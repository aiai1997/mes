import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 数据备份 API
 * POST: 创建数据备份
 * GET: 获取备份列表
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupName, description, createdBy } = body;

    const client = getSupabaseClient();

    // 获取所有需要备份的表数据
    const tables = ['users', 'employees', 'customers', 'suppliers', 'teams', 'orders', 'materials', 'wallets', 'wallet_transactions'];
    const backupData: Record<string, any[]> = {};
    let totalSize = 0;

    for (const table of tables) {
      const { data, error } = await client.from(table).select('*');
      if (error && error.code !== 'PGRST116') {
        console.error(`备份表 ${table} 失败:`, error);
        continue;
      }
      backupData[table] = data || [];
      totalSize += JSON.stringify(data || []).length;
    }

    // 生成备份ID
    const backupId = `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 保存备份记录
    const { error: insertError } = await client
      .from('data_backups')
      .insert({
        id: backupId,
        backup_type: '手动备份',
        backup_name: backupName || `系统备份 ${new Date().toLocaleString('zh-CN')}`,
        description: description || '用户手动创建的备份',
        backup_data: backupData,
        data_size: totalSize,
        table_count: tables.length,
        status: 'completed',
        created_by: createdBy || 'system',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
      });

    if (insertError) {
      console.error('保存备份记录失败:', insertError);
      throw insertError;
    }

    // 记录安全日志
    await client.from('security_logs').insert({
      id: `log-${Date.now()}`,
      event_type: '数据备份',
      event_level: 'INFO',
      description: `创建数据备份：${backupName || '系统备份'}`,
      user_id: createdBy || 'system',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      backupId,
      message: '数据备份成功',
      stats: {
        tableCount: tables.length,
        dataSize: `${(totalSize / 1024).toFixed(2)} KB`,
      },
    });
  } catch (error) {
    console.error('数据备份失败:', error);
    return NextResponse.json(
      { success: false, error: '数据备份失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * 获取备份列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const client = getSupabaseClient();

    // 查询备份列表（不返回backup_data字段，减少数据量）
    const { data: backups, error } = await client
      .from('data_backups')
      .select('id, backup_type, backup_name, description, data_size, table_count, status, created_by, created_at, expires_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // 格式化数据
    const formattedBackups = backups.map(b => ({
      id: b.id,
      backupType: b.backup_type,
      backupName: b.backup_name,
      description: b.description,
      dataSize: b.data_size ? `${(b.data_size / 1024).toFixed(2)} KB` : '0 KB',
      tableCount: b.table_count,
      status: b.status,
      createdBy: b.created_by,
      createdAt: b.created_at,
      expiresAt: b.expires_at,
    }));

    return NextResponse.json({
      success: true,
      backups: formattedBackups,
    });
  } catch (error) {
    console.error('获取备份列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取备份列表失败' },
      { status: 500 }
    );
  }
}
