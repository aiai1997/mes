/**
 * 二维码物料管理服务
 * 提供二维码生成、扫描、库存管理等功能
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';
import QRCode from 'qrcode';

// 获取数据库客户端
function getClient() {
  return getSupabaseClient();
}

/**
 * 生成物料二维码编号
 */
function generateQrcodeNo(): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MAT${timestamp}${random}`;
}

/**
 * 生成二维码图片
 */
async function generateQrcodeImage(qrcodeNo: string): Promise<string> {
  try {
    const qrData = JSON.stringify({
      type: 'material',
      qrcodeNo,
      timestamp: new Date().toISOString()
    });

    // 生成二维码base64图片
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrImage;
  } catch (error) {
    console.error('生成二维码失败:', error);
    throw new Error('生成二维码失败');
  }
}

/**
 * 批量生成物料二维码
 */
export async function generateMaterialQrcodes(data: {
  materialId: string;
  materialCode: string;
  materialName: string;
  batchNo: string;
  quantity: number;
  unit?: string;
  manufactureDate?: string;
  count: number; // 生成二维码的数量
}): Promise<any[]> {
  const client = getClient();
  const results = [];

  for (let i = 0; i < data.count; i++) {
    const qrcodeNo = generateQrcodeNo();
    const qrcodeImage = await generateQrcodeImage(qrcodeNo);

    const qrcodeData = {
      qrcode_no: qrcodeNo,
      material_id: data.materialId,
      material_code: data.materialCode,
      material_name: data.materialName,
      batch_no: data.batchNo,
      quantity: data.quantity,
      unit: data.unit || '米',
      manufacture_date: data.manufactureDate,
      qrcode_image: qrcodeImage,
      status: '启用'
    };

    const { data: result, error } = await client
      .from('material_qrcodes')
      .insert(qrcodeData)
      .select()
      .single();

    if (error) throw error;
    results.push(result);
  }

  return results;
}

/**
 * 扫描二维码进行出入库操作
 */
export async function scanQrcode(data: {
  qrcodeNo: string;
  action: '入库' | '出库' | '领料';
  location?: string;
  operatorId: string;
  operatorName: string;
  ipAddress?: string;
}): Promise<any> {
  const client = getClient();

  // 1. 验证二维码是否存在
  const { data: qrcode, error: qrcodeError } = await client
    .from('material_qrcodes')
    .select('*')
    .eq('qrcode_no', data.qrcodeNo)
    .eq('status', '启用')
    .single();

  if (qrcodeError || !qrcode) {
    throw new Error('二维码不存在或已失效');
  }

  // 2. 根据操作类型更新库存
  let stockChange = 0;
  if (data.action === '入库') {
    stockChange = qrcode.quantity;
  } else if (data.action === '出库' || data.action === '领料') {
    stockChange = -qrcode.quantity;
  }

  // 更新库存
  const { data: stockItem, error: stockError } = await client
    .from('stock_items')
    .select('*')
    .eq('material_id', qrcode.material_id)
    .eq('batch_no', qrcode.batch_no)
    .single();

  if (stockError && stockError.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw stockError;
  }

  if (stockItem) {
    // 更新现有库存
    const newQuantity = stockItem.quantity + stockChange;
    if (newQuantity < 0) {
      throw new Error('库存不足，无法出库');
    }

    const { error: updateError } = await client
      .from('stock_items')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', stockItem.id);

    if (updateError) throw updateError;
  } else if (data.action === '入库') {
    // 创建新库存记录
    const { error: insertError } = await client
      .from('stock_items')
      .insert({
        material_id: qrcode.material_id,
        material_code: qrcode.material_code,
        material_name: qrcode.material_name,
        quantity: stockChange,
        location: data.location,
        batch_no: qrcode.batch_no
      });

    if (insertError) throw insertError;
  } else {
    throw new Error('库存不足，无法出库');
  }

  // 3. 记录扫描日志
  const scanLog = {
    qrcode_no: data.qrcodeNo,
    action: data.action,
    location: data.location,
    operator_id: data.operatorId,
    operator_name: data.operatorName,
    ip_address: data.ipAddress,
    scan_time: new Date().toISOString()
  };

  const { error: logError } = await client
    .from('qrcode_scan_logs')
    .insert(scanLog);

  if (logError) throw logError;

  // 4. 记录操作日志
  try {
    const { createOperationLog } = await import('./operation-log-middleware');
    await createOperationLog({
      module: '物料管理',
      action: `${data.action}操作`,
      description: `${data.action}物料：${qrcode.material_name}，数量：${qrcode.quantity}${qrcode.unit}`,
      operatorId: data.operatorId,
      resourceId: qrcode.id,
      resourceType: 'material_qrcode',
      status: '成功'
    });
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }

  return {
    qrcode,
    action: data.action,
    quantity: qrcode.quantity,
    unit: qrcode.unit,
    location: data.location,
    scanTime: new Date().toISOString()
  };
}

/**
 * 查询物料二维码列表
 */
export async function getMaterialQrcodes(filters?: {
  materialId?: string;
  batchNo?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<any> {
  const client = getClient();

  let query = client.from('material_qrcodes').select('*', { count: 'exact' });

  if (filters?.materialId) {
    query = query.eq('material_id', filters.materialId);
  }

  if (filters?.batchNo) {
    query = query.eq('batch_no', filters.batchNo);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  // 分页
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 20;
  const offset = (page - 1) * pageSize;

  query = query.range(offset, offset + pageSize - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

/**
 * 查询扫描日志
 */
export async function getScanLogs(filters?: {
  qrcodeNo?: string;
  action?: string;
  operatorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<any> {
  const client = getClient();

  let query = client.from('qrcode_scan_logs').select('*', { count: 'exact' });

  if (filters?.qrcodeNo) {
    query = query.eq('qrcode_no', filters.qrcodeNo);
  }

  if (filters?.action) {
    query = query.eq('action', filters.action);
  }

  if (filters?.operatorId) {
    query = query.eq('operator_id', filters.operatorId);
  }

  if (filters?.startDate) {
    query = query.gte('scan_time', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('scan_time', filters.endDate);
  }

  // 分页
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 20;
  const offset = (page - 1) * pageSize;

  query = query.range(offset, offset + pageSize - 1).order('scan_time', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}