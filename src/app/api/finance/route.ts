/**
 * 财务管理API路由
 * 提供财务流水、薪资管理、供应商付款等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, withPermissionCheck, withDataPermissionFilter, createErrorResponse } from '@/lib/api-response';
import {
  createFinancialTransaction,
  createPieceRateSalary,
  createSupplierPayment,
  processSupplierPayment,
  getFinancialStatistics
} from '@/lib/finance-service';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取财务流水
const getTransactions = createApiHandler(
  withPermissionCheck(
    withDataPermissionFilter(
      async (request: NextRequest) => {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('limit') || '20');
        const category = searchParams.get('category');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const client = getSupabaseClient();
        let query = client.from('financial_transactions').select('*', { count: 'exact' });

        if (category) {
          query = query.eq('category', category);
        }
        if (startDate) {
          query = query.gte('transaction_date', startDate);
        }
        if (endDate) {
          query = query.lte('transaction_date', endDate);
        }

        query = query.order('transaction_date', { ascending: false });
        const offset = (page - 1) * pageSize;
        query = query.range(offset, offset + pageSize - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        return {
          data: data || [],
          page,
          pageSize,
          total: count || 0,
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

      return createPieceRateSalary({
        employeeId: body.employeeId,
        periodStart: body.periodStart,
        periodEnd: body.periodEnd,
        workReports: body.workReports,
        unitPrice: body.unitPrice,
        baseWage: body.baseWage,
        subsidy: body.subsidy,
        deductions: body.deductions,
        operator: body.operator,
      });
    },
    ['finance:create']
  )
);

// 创建供应商付款
const createPayment = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const body = await request.json();

      return createSupplierPayment({
        supplierId: body.supplierId,
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        dueDate: body.dueDate,
        description: body.description,
        operator: body.operator,
      });
    },
    ['finance:create']
  )
);

// 处理供应商付款
const processPayment = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const body = await request.json();
      const paymentId = body.paymentId;
      const paymentDate = body.paymentDate || new Date().toISOString();

      if (!paymentId) {
        throw new Error('缺少 paymentId');
      }

      await processSupplierPayment(paymentId, paymentDate, body.operator);
      return {
        paymentId,
        status: '已付款',
      };
    },
    ['finance:audit']
  )
);

// 获取财务统计
const getStatistics = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const { searchParams } = new URL(request.url);
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      return getFinancialStatistics(
        startDate && endDate ? { start: startDate, end: endDate } : undefined
      );
    },
    ['finance:view']
  )
);

export const GET = getTransactions;

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'payment':
      return createPayment(request);
    case 'salary':
      return createSalary(request);
    default:
      return createTransaction(request);
  }
}

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
      return new Response(JSON.stringify(createErrorResponse('无效的操作', 400, 'Bad Request')), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
  }
}