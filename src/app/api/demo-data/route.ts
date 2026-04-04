import { NextResponse } from 'next/server';
import { 
  getDataCounts, 
  initializeDemoData, 
  clearDemoData,
  checkDatabaseConnection 
} from '@/lib/db-service';

export async function GET() {
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: '数据库连接失败，请检查 Supabase 配置' },
        { status: 500 }
      );
    }

    const counts = await getDataCounts();
    return NextResponse.json({ 
      success: true, 
      counts,
      isInitialized: counts.total > 0
    });
  } catch (error) {
    console.error('获取数据统计失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取数据统计失败' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // 检查数据库连接
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: '数据库连接失败，请检查 Supabase 配置' },
        { status: 500 }
      );
    }

    // 先清空现有数据
    await clearDemoData();
    
    // 初始化新数据
    const counts = await initializeDemoData();
    
    return NextResponse.json({ 
      success: true, 
      message: '演示数据初始化成功',
      counts 
    });
  } catch (error) {
    console.error('初始化演示数据失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '初始化演示数据失败' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearDemoData();
    const counts = await getDataCounts();
    
    return NextResponse.json({ 
      success: true, 
      message: '演示数据已清空',
      counts 
    });
  } catch (error) {
    console.error('清空演示数据失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '清空演示数据失败' },
      { status: 500 }
    );
  }
}
