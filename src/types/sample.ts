// 打样管理类型定义

export type SampleStatus = '申请中' | '制作中' | '待审批' | '已通过' | '需修改' | '已转大货';
export type SampleType = '初样' | '修改样' | '确认样' | '产前样';

export interface Sample {
  id: string;
  sampleNo: string;
  sampleType: SampleType;
  
  // 客户信息
  customerId: string;
  customerName: string;
  styleNo: string;
  productName: string;
  
  // 尺寸信息
  size: string;
  color: string;
  
  // 要求
  requirements: string;
  materialRequirement: string;
  processRequirement: string;
  
  // 打样信息
  teamId: string;
  teamName: string;
  designer: string;
  
  // 用料
  materials: SampleMaterial[];
  materialCost: number;
  laborCost: number;
  totalCost: number;
  
  // 状态
  status: SampleStatus;
  
  // 审批
  approvedBy?: string;
  approvedTime?: string;
  approvalComment?: string;
  
  // 转大货
  convertedOrderId?: string;
  
  // 图片
  photos: string[];
  
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SampleMaterial {
  id: string;
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 模拟数据
let samples: Sample[] = [];

export function initSampleData() {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem('erp_samples');
  if (!stored) {
    samples = [
      {
        id: '1',
        sampleNo: 'SMP20240110001',
        sampleType: '确认样',
        customerId: '1',
        customerName: '优衣库',
        styleNo: 'ST2024001',
        productName: '男士休闲T恤',
        size: 'L',
        color: '白色',
        requirements: '面料柔软，透气性好',
        materialRequirement: '纯棉',
        processRequirement: '平缝',
        teamId: '1',
        teamName: '打样组',
        designer: '李设计',
        materials: [
          { id: '1', materialId: '1', materialName: '纯棉面料', unit: '米', quantity: 1.5, unitPrice: 30, amount: 45 },
        ],
        materialCost: 45,
        laborCost: 50,
        totalCost: 95,
        status: '制作中',
        photos: [],
        remark: '',
        createdBy: 'admin',
        createdAt: '2024-01-10 09:00:00',
        updatedAt: '2024-01-10 09:00:00',
      },
    ];
    localStorage.setItem('erp_samples', JSON.stringify(samples));
  } else {
    samples = JSON.parse(stored);
  }
}

export function getSamples(): Sample[] {
  return [...samples].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getSample(id: string): Sample | undefined {
  return samples.find(s => s.id === id);
}

export function saveSample(sample: Sample) {
  const index = samples.findIndex(s => s.id === sample.id);
  if (index >= 0) {
    samples[index] = sample;
  } else {
    samples.push(sample);
  }
  localStorage.setItem('erp_samples', JSON.stringify(samples));
}

export function generateSampleNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const todaySamples = samples.filter(s => s.sampleNo.includes(dateStr));
  const seq = (todaySamples.length + 1).toString().padStart(3, '0');
  return `SMP${dateStr}${seq}`;
}
