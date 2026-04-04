// 品质管理类型定义

export type QCType = 'IQC' | 'IPQC' | 'FQC' | 'OQC';
export type QCResult = '合格' | '不合格' | '待检';
export type DefectType = '线头' | '脏污' | '破洞' | '色差' | '尺寸偏差' | '跳线' | '断线' | '油污' | '其他';

export interface QCRecord {
  id: string;
  qcNo: string;
  qcType: QCType;
  
  // 关联信息
  orderId: string;
  orderNo: string;
  styleNo: string;
  bundleId?: string;
  bundleNo?: string;
  
  // 检验信息
  inspectQuantity: number;
  passQuantity: number;
  failQuantity: number;
  defectRate: number; // 不良率
  passRate: number; // 良品率
  
  // 不良明细
  defects: DefectItem[];
  
  // 检验结果
  result: QCResult;
  inspector: string;
  inspectTime: string;
  
  // 处理
  handleMethod?: '返工' | '报废' | '让步接收' | '退货';
  reworkId?: string; // 关联返工单
  scrapId?: string; // 关联报废单
  
  remark: string;
  createdAt: string;
}

export interface DefectItem {
  id: string;
  defectType: DefectType;
  quantity: number;
  position: string; // 不良位置
  description: string;
  photo?: string;
}

export interface DefectLibrary {
  id: string;
  defectType: DefectType;
  defectCode: string;
  defectName: string;
  category: string;
  description: string;
  standardPhoto?: string;
  severity: '轻微' | '严重' | '致命';
  isActive: boolean;
}

export interface QCStandard {
  id: string;
  qcType: QCType;
  productName: string;
  inspectItem: string;
  inspectMethod: string;
  inspectTool: string;
  aqlLevel: string;
  sampleSize: number;
  acceptCount: number;
  rejectCount: number;
}

// 模拟数据
let qcRecords: QCRecord[] = [];
let defectLibrary: DefectLibrary[] = [];

export function initQualityData() {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem('erp_qc_records');
  if (!stored) {
    qcRecords = [
      {
        id: '1',
        qcNo: 'FQC20240115001',
        qcType: 'FQC',
        orderId: '1',
        orderNo: 'ORD20240110001',
        styleNo: 'ST2024001',
        inspectQuantity: 100,
        passQuantity: 95,
        failQuantity: 5,
        defectRate: 5,
        passRate: 95,
        defects: [
          { id: '1', defectType: '线头', quantity: 3, position: '袖口', description: '线头未剪干净' },
          { id: '2', defectType: '脏污', quantity: 2, position: '前胸', description: '油污' },
        ],
        result: '合格',
        inspector: '张质检',
        inspectTime: '2024-01-15 16:00:00',
        remark: '',
        createdAt: '2024-01-15 16:00:00',
      },
    ];
    localStorage.setItem('erp_qc_records', JSON.stringify(qcRecords));
  } else {
    qcRecords = JSON.parse(stored);
  }
  
  const storedDefects = localStorage.getItem('erp_defect_library');
  if (!storedDefects) {
    defectLibrary = [
      { id: '1', defectType: '线头', defectCode: 'DF001', defectName: '线头过长', category: '外观', description: '线头超过3mm', severity: '轻微', isActive: true },
      { id: '2', defectType: '脏污', defectCode: 'DF002', defectName: '油污', category: '外观', description: '表面有油渍', severity: '严重', isActive: true },
      { id: '3', defectType: '破洞', defectCode: 'DF003', defectName: '面料破洞', category: '面料', description: '面料破损', severity: '致命', isActive: true },
      { id: '4', defectType: '色差', defectCode: 'DF004', defectName: '颜色差异', category: '颜色', description: '颜色与样板不符', severity: '严重', isActive: true },
      { id: '5', defectType: '尺寸偏差', defectCode: 'DF005', defectName: '尺寸不符', category: '尺寸', description: '尺寸超出公差范围', severity: '严重', isActive: true },
    ];
    localStorage.setItem('erp_defect_library', JSON.stringify(defectLibrary));
  } else {
    defectLibrary = JSON.parse(storedDefects);
  }
}

export function getQCRecords(): QCRecord[] {
  return [...qcRecords].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getQCRecord(id: string): QCRecord | undefined {
  return qcRecords.find(r => r.id === id);
}

export function saveQCRecord(record: QCRecord) {
  const index = qcRecords.findIndex(r => r.id === record.id);
  if (index >= 0) {
    qcRecords[index] = record;
  } else {
    qcRecords.push(record);
  }
  localStorage.setItem('erp_qc_records', JSON.stringify(qcRecords));
}

export function getDefectLibrary(): DefectLibrary[] {
  return defectLibrary.filter(d => d.isActive);
}

export function getQCStatistics() {
  const total = qcRecords.length;
  const passed = qcRecords.filter(r => r.result === '合格').length;
  const failed = qcRecords.filter(r => r.result === '不合格').length;
  
  const avgPassRate = total > 0 
    ? qcRecords.reduce((sum, r) => sum + r.passRate, 0) / total 
    : 0;
    
  return {
    total,
    passed,
    failed,
    avgPassRate: avgPassRate.toFixed(1),
    passCount: passed,
    failCount: failed,
  };
}

export function generateQCNo(type: QCType): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const todayRecords = qcRecords.filter(r => r.qcNo.includes(dateStr) && r.qcType === type);
  const seq = (todayRecords.length + 1).toString().padStart(3, '0');
  return `${type}${dateStr}${seq}`;
}
