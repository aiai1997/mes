import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取钱包交易记录
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletId = searchParams.get('walletId');

    if (!walletId) {
      return NextResponse.json(
        { error: '缺少钱包ID参数' },
        { status: 400 }
      );
    }

    // 防止注入：验证walletId格式
    if (typeof walletId !== 'string' || walletId.length > 50 || !/^[\w-]+$/.test(walletId)) {
      return NextResponse.json(
        { error: '无效的钱包ID格式' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查询交易记录，按时间倒序
    const { data: transactions, error } = await client
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('查询交易记录失败:', error);
      throw error;
    }

    // 格式化交易记录
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: Number(t.amount),
      description: t.description,
      relatedOrder: t.related_order,
      createdAt: t.created_at,
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error('获取交易记录失败:', error);
    return NextResponse.json(
      { error: '获取交易记录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
