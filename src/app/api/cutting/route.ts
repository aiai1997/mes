import { NextRequest, NextResponse } from 'next/server';
import { CuttingTask, generateCuttingTaskNo, getCuttingTasks, createCuttingTask, updateCuttingTaskProgress } from '@/types/order';

// GET - 获取裁床任务数据
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    const taskId = url.searchParams.get('id');
    
    if (taskId) {
      const tasks = getCuttingTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        return NextResponse.json({
          success: true,
          data: task
        });
      } else {
        return NextResponse.json(
          { success: false, error: '裁床任务不存在' },
          { status: 404 }
        );
      }
    } else if (orderId) {
      const tasks = getCuttingTasks(orderId);
      return NextResponse.json({
        success: true,
        data: tasks
      });
    } else {
      const tasks = getCuttingTasks();
      return NextResponse.json({
        success: true,
        data: tasks
      });
    }
  } catch (error) {
    console.error('获取裁床任务数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    );
  }
}

// POST - 创建裁床任务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.orderId || !body.operator) {
      return NextResponse.json(
        { success: false, error: '缺少订单ID和操作员' },
        { status: 400 }
      );
    }
    
    const task = createCuttingTask(body.orderId, body.operator, body.estimatedTime || 60);
    
    return NextResponse.json({
      success: true,
      message: '裁床任务创建成功',
      data: task
    });
  } catch (error) {
    console.error('创建裁床任务失败:', error);
    return NextResponse.json(
      { success: false, error: '创建裁床任务失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新裁床任务进度
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id || body.completedQuantity === undefined) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID和完成数量' },
        { status: 400 }
      );
    }
    
    const task = updateCuttingTaskProgress(body.id, body.completedQuantity);
    
    if (task) {
      return NextResponse.json({
        success: true,
        message: '裁床任务进度更新成功',
        data: task
      });
    } else {
      return NextResponse.json(
        { success: false, error: '裁床任务不存在' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('更新裁床任务进度失败:', error);
    return NextResponse.json(
      { success: false, error: '更新裁床任务进度失败' },
      { status: 500 }
    );
  }
}
