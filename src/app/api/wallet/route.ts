import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取当前用户的钱包信息
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 参数验证
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      );
    }

    // 防止注入：验证userId格式
    if (typeof userId !== 'string' || userId.length > 50 || !/^[\w-]+$/.test(userId)) {
      return NextResponse.json(
        { error: '无效的用户ID格式' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查询钱包信息
    const { data: wallet, error: walletError } = await client
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error('查询钱包失败:', walletError);
      throw walletError;
    }

    // 如果钱包不存在，创建一个新的
    if (!wallet) {
      const walletId = `wallet-${userId}`;
      const { data: newWallet, error: createError } = await client
        .from('wallets')
        .insert({
          id: walletId,
          user_id: userId,
          balance: 0,
          total_earnings: 0,
          total_withdrawals: 0,
          status: 'active',
        })
        .select()
        .single();

      if (createError) {
        console.error('创建钱包失败:', createError);
        throw createError;
      }

      return NextResponse.json({
        success: true,
        wallet: {
          id: newWallet.id,
          balance: Number(newWallet.balance),
          totalEarnings: Number(newWallet.total_earnings),
          totalWithdrawals: Number(newWallet.total_withdrawals),
          status: newWallet.status,
        },
      });
    }

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        balance: Number(wallet.balance),
        totalEarnings: Number(wallet.total_earnings),
        totalWithdrawals: Number(wallet.total_withdrawals),
        status: wallet.status,
      },
    });
  } catch (error) {
    console.error('获取钱包信息失败:', error);
    return NextResponse.json(
      { error: '获取钱包信息失败，请稍后重试' },
      { status: 500 }
    );
  }
}
