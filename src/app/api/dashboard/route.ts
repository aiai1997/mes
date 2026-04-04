import { NextRequest, NextResponse } from 'next/server';

// 生成随机数据的辅助函数
function generateRandomData(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成模拟数据
function generateMockData() {
  // 生产进度数据
  const productionProgress = [
    { name: '订单1', progress: generateRandomData(60, 100), target: 100 },
    { name: '订单2', progress: generateRandomData(40, 80), target: 100 },
    { name: '订单3', progress: generateRandomData(70, 100), target: 100 },
    { name: '订单4', progress: generateRandomData(30, 60), target: 100 },
    { name: '订单5', progress: generateRandomData(50, 90), target: 100 },
  ];
  
  // 销售额数据
  const salesData = [
    { month: '1月', amount: generateRandomData(100000, 150000) },
    { month: '2月', amount: generateRandomData(120000, 180000) },
    { month: '3月', amount: generateRandomData(150000, 200000) },
    { month: '4月', amount: generateRandomData(130000, 170000) },
    { month: '5月', amount: generateRandomData(160000, 220000) },
    { month: '6月', amount: generateRandomData(180000, 250000) },
  ];
  
  // 库存数据
  const inventoryData = [
    { name: '面料', value: generateRandomData(30, 40) },
    { name: '辅料', value: generateRandomData(20, 30) },
    { name: '成品', value: generateRandomData(15, 25) },
    { name: '半成品', value: generateRandomData(15, 25) },
  ];
  
  // 工资数据
  const salaryData = [
    { month: '1月', amount: generateRandomData(70000, 90000) },
    { month: '2月', amount: generateRandomData(75000, 95000) },
    { month: '3月', amount: generateRandomData(80000, 100000) },
    { month: '4月', amount: generateRandomData(78000, 98000) },
    { month: '5月', amount: generateRandomData(85000, 105000) },
    { month: '6月', amount: generateRandomData(82000, 102000) },
  ];
  
  // 回款数据
  const paymentData = [
    { month: '1月', amount: generateRandomData(90000, 130000) },
    { month: '2月', amount: generateRandomData(110000, 150000) },
    { month: '3月', amount: generateRandomData(140000, 180000) },
    { month: '4月', amount: generateRandomData(120000, 160000) },
    { month: '5月', amount: generateRandomData(160000, 200000) },
    { month: '6月', amount: generateRandomData(180000, 220000) },
  ];
  
  // 订单数据
  const orderData = [
    { status: '待处理', value: generateRandomData(5, 15) },
    { status: '生产中', value: generateRandomData(10, 20) },
    { status: '已完成', value: generateRandomData(20, 30) },
    { status: '已发货', value: generateRandomData(15, 25) },
  ];
  
  // 核心指标
  const keyMetrics = [
    { name: '总销售额', value: `¥${generateRandomData(1000000, 1500000).toLocaleString()}`, change: `+${(generateRandomData(10, 20) / 10).toFixed(1)}%` },
    { name: '订单数量', value: generateRandomData(100, 150).toString(), change: `+${(generateRandomData(5, 15) / 10).toFixed(1)}%` },
    { name: '生产完成率', value: `${generateRandomData(80, 95)}%`, change: `+${(generateRandomData(1, 5) / 10).toFixed(1)}%` },
    { name: '回款率', value: `${generateRandomData(85, 95)}%`, change: `+${(generateRandomData(1, 4) / 10).toFixed(1)}%` },
  ];

  return {
    productionProgress,
    salesData,
    inventoryData,
    salaryData,
    paymentData,
    orderData,
    keyMetrics,
  };
}

// GET - 获取数据大屏数据
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || '6months';
    const department = url.searchParams.get('department') || 'all';
    const workshop = url.searchParams.get('workshop') || 'all';
    
    // 生成模拟数据
    const data = generateMockData();
    
    // 模拟数据加载延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      data,
      timeRange,
      department,
      workshop,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    );
  }
}
