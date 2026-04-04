import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 数据恢复 API（带备份保护）
 * POST: 恢复数据前先备份当前数据
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupId, createdBy, confirmRestore } = body;

    if (!backupId) {
      return NextResponse.json(
        { success: false, error: '缺少备份ID' },
        { status: 400 }
      );
    }

    if (!confirmRestore) {
      return NextResponse.json(
        { success: false, error: '请确认恢复操作' },
        { status: 400 }
      );
    }

    // 验证备份ID格式
    if (typeof backupId !== 'string' || !backupId.startsWith('backup-')) {
      return NextResponse.json(
        { success: false, error: '无效的备份ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 1. 先备份当前数据（恢复前备份）
    console.log('开始备份当前数据...');
    const tables = ['users', 'employees', 'customers', 'suppliers', 'teams', 'orders', 'materials', 'wallets', 'wallet_transactions'];
    const currentData: Record<string, any[]> = {};
    let totalSize = 0;

    for (const table of tables) {
      const { data, error } = await client.from(table).select('*');
      if (error && error.code !== 'PGRST116') {
        console.error(`备份表 ${table} 失败:`, error);
        continue;
      }
      currentData[table] = data || [];
      totalSize += JSON.stringify(data || []).length;
    }

    const preRestoreBackupId = `backup-pre-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 保存恢复前备份
    const { error: preBackupError } = await client
      .from('data_backups')
      .insert({
        id: preRestoreBackupId,
        backup_type: '恢复前备份',
        backup_name: `恢复前自动备份 ${new Date().toLocaleString('zh-CN')}`,
        description: `在恢复备份 ${backupId} 之前自动创建的安全备份`,
        backup_data: currentData,
        data_size: totalSize,
        table_count: tables.length,
        status: 'completed',
        created_by: createdBy || 'system',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后过期
      });

    if (preBackupError) {
      console.error('创建恢复前备份失败:', preBackupError);
      return NextResponse.json(
        { success: false, error: '创建恢复前备份失败，已中止恢复操作' },
        { status: 500 }
      );
    }

    console.log('恢复前备份创建成功:', preRestoreBackupId);

    // 2. 获取要恢复的备份数据
    const { data: backupRecord, error: fetchError } = await client
      .from('data_backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (fetchError || !backupRecord) {
      console.error('获取备份记录失败:', fetchError);
      return NextResponse.json(
        { success: false, error: '备份记录不存在或已被删除' },
        { status: 404 }
      );
    }

    const backupData = backupRecord.backup_data as Record<string, any[]>;

    // 3. 执行数据恢复（不直接覆盖，而是清空后插入）
    const restoreResults: Record<string, { success: boolean; count: number; error?: string }> = {};

    for (const table of tables) {
      try {
        // 清空表数据
        const { error: deleteError } = await client
          .from(table)
          .delete()
          .neq('id', 'impossible-value'); // 删除所有数据

        if (deleteError) {
          console.error(`清空表 ${table} 失败:`, deleteError);
          restoreResults[table] = { success: false, count: 0, error: deleteError.message };
          continue;
        }

        // 插入备份数据
        const tableData = backupData[table] || [];
        if (tableData.length > 0) {
          const { error: insertError } = await client
            .from(table)
            .insert(tableData);

          if (insertError) {
            console.error(`恢复表 ${table} 失败:`, insertError);
            restoreResults[table] = { success: false, count: 0, error: insertError.message };
          } else {
            restoreResults[table] = { success: true, count: tableData.length };
          }
        } else {
          restoreResults[table] = { success: true, count: 0 };
        }
      } catch (error) {
        console.error(`恢复表 ${table} 异常:`, error);
        restoreResults[table] = { 
          success: false, 
          count: 0, 
          error: error instanceof Error ? error.message : '未知错误' 
        };
      }
    }

    // 4. 记录安全日志
    await client.from('security_logs').insert({
      id: `log-${Date.now()}`,
      event_type: '数据恢复',
      event_level: 'WARNING',
      description: `从备份 ${backupId} 恢复数据，已创建恢复前备份 ${preRestoreBackupId}`,
      user_id: createdBy || 'system',
      created_at: new Date().toISOString(),
    });

    // 5. 检查是否有失败的表
    const failedTables = Object.entries(restoreResults)
      .filter(([_, result]) => !result.success)
      .map(([table, result]) => `${table}: ${result.error}`);

    if (failedTables.length > 0) {
      return NextResponse.json({
        success: false,
        error: '部分数据恢复失败',
        details: failedTables,
        preRestoreBackupId,
        restoreResults,
      });
    }

    return NextResponse.json({
      success: true,
      message: '数据恢复成功',
      preRestoreBackupId,
      stats: {
        tableCount: tables.length,
        totalRecords: Object.values(restoreResults).reduce((sum, r) => sum + r.count, 0),
      },
    });
  } catch (error) {
    console.error('数据恢复失败:', error);
    return NextResponse.json(
      { success: false, error: '数据恢复失败，请稍后重试' },
      { status: 500 }
    );
  }
}
