import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 异常数据导出 API
 * POST: 导出异常数据为JSON文件
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anomalyIds, exportAll } = body;

    const client = getSupabaseClient();

    let query = client
      .from('anomaly_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (!exportAll && anomalyIds && Array.isArray(anomalyIds)) {
      query = query.in('id', anomalyIds);
    }

    const { data: anomalies, error } = await query;

    if (error) throw error;

    if (!anomalies || anomalies.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有可导出的异常数据' },
        { status: 400 }
      );
    }

    // 格式化导出数据
    const exportData = {
      exportInfo: {
        exportTime: new Date().toISOString(),
        totalCount: anomalies.length,
        exportBy: 'system',
      },
      anomalies: anomalies.map(a => ({
        id: a.id,
        tableName: a.table_name,
        recordId: a.record_id,
        anomalyType: a.anomaly_type,
        anomalyDescription: a.anomaly_description,
        originalData: a.original_data,
        status: a.status,
        createdAt: a.created_at,
      })),
    };

    // 记录安全日志
    await client.from('security_logs').insert({
      id: `log-${Date.now()}`,
      event_type: '异常数据导出',
      event_level: 'INFO',
      description: `导出 ${anomalies.length} 条异常数据`,
      created_at: new Date().toISOString(),
    });

    // 返回JSON数据（前端负责下载）
    return NextResponse.json({
      success: true,
      data: exportData,
      filename: `anomaly-export-${new Date().toISOString().split('T')[0]}.json`,
    });
  } catch (error) {
    console.error('导出异常数据失败:', error);
    return NextResponse.json(
      { success: false, error: '导出异常数据失败' },
      { status: 500 }
    );
  }
}
