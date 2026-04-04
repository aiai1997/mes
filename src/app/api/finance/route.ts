/**
 * 财务管理API路由
 * 提供财务流水、薪资管理、供应商付款等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-response';
import {
  createFinancialTransaction,
  createPieceRateSalary,
  processSupplierPayment,
  getFinancialStatistics
} from '@/lib/finance-service';
import { withPermissionCheck, withDataPermissionFilter } from '@/lib/api-response';

// 获取财务流水
const getTransactions = createApiHandler(
  withPermissionCheck(
    withDataPermissionFilter(
      async (request: NextRequest) => {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const category = searchParams.get('category');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // 这里应该实现财务流水查询逻辑
        // 暂时返回空数组
        return {
          data: [],
          total: 0,
          page,
          limit
        };
      },
      'finance'
    ),
    ['finance:view']
  )
);

// 创建财务流水
const createTransaction = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const body = await request.json();

      const transaction = await createFinancialTransaction({
        transactionType: body.transactionType,
        category: body.category,
        amount: body.amount,
        currency: body.currency,
        relatedId: body.relatedId,
        relatedType: body.relatedType,
        description: body.description,
        operator: body.operator,
        operatorId: body.operatorId,
      });

      return transaction;
    },
    ['finance:create']
  )
);

// 创建薪资记录
const createSalary = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const body = await request.json();

      const salary = await createPieceRateSalary({
        employeeId: body.employeeId,
        periodStart: body.periodStart,
        periodEnd: body.periodEnd,
        workReports: body.workReports,
        unitPrice: body.unitPrice,
        baseWage: body.baseWage,
        subsidy: body.subsidy,
        deductions: body.deductions,
        operator: body.operator,
        operatorId: body.operatorId,
      });

      return salary;
    },
    ['finance:create']
  )
);

// 处理供应商付款
const processPayment = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const body = await request.json();

      const payment = await processSupplierPayment({
        supplierId: body.supplierId,
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        relatedOrders: body.relatedOrders,
        description: body.description,
        operator: body.operator,
        operatorId: body.operatorId,
      });

      return payment;
    },
    ['finance:audit']
  )
);

// 获取财务统计
const getStatistics = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const { searchParams } = new URL(request.url);
      const period = searchParams.get('period') || 'month';

      const statistics = await getFinancialStatistics(period);
      return statistics;
    },
    ['finance:view']
  )
);

export const GET = getTransactions;
export const POST = createTransaction;

// 为了支持不同的操作，使用动态路由
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'salary':
      return createSalary(request);
    case 'payment':
      return processPayment(request);
    case 'statistics':
      return getStatistics(request);
    default:
      return NextResponse.json(
        { success: false, error: '无效的操作' },
        { status: 400 }
      );
  }
}