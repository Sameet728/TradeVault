'use server';

import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Trade, ITrade } from '@/models/Trade';
import { TradingAccount } from '@/models/TradingAccount';
import '@/models/Strategy';
import { Strategy } from '@/models/Strategy';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';
import type { TradeFormData, TradeFilters, TradePaginated } from '@/types/trade.types';
import type { DashboardStats } from '@/types/analytics.types';

function toPlainTrade(doc: ITrade) {
  const obj = doc.toObject({ virtuals: false });
  return {
    ...obj,
    _id: obj._id.toString(),
    userId: obj.userId.toString(),
    accountId: obj.accountId.toString(),
    strategyId: obj.strategyId?.toString(),
    tradeDate: obj.tradeDate?.toISOString?.() || new Date().toISOString(),
    closeDate: obj.closeDate?.toISOString?.(),
    createdAt: obj.createdAt?.toISOString?.() || new Date().toISOString(),
    updatedAt: obj.updatedAt?.toISOString?.() || new Date().toISOString(),
    parameterValues: obj.parameterValues instanceof Map
      ? Object.fromEntries(obj.parameterValues)
      : (obj.parameterValues ?? {}),
    checklistValues: obj.checklistValues instanceof Map
      ? Object.fromEntries(obj.checklistValues)
      : (obj.checklistValues ?? {}),
  };
}

export async function createTradeAction(data: TradeFormData): Promise<{ error?: string; id?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();

    const trade = await Trade.create({
      ...data,
      userId: userId,
      accountId: new Types.ObjectId(data.accountId),
      strategyId: data.strategyId ? new Types.ObjectId(data.strategyId) : undefined,
      tradeDate: new Date(data.tradeDate),
      closeDate: data.closeDate ? new Date(data.closeDate) : undefined,
      parameterValues: new Map(Object.entries(data.parameterValues ?? {})),
      checklistValues: new Map(Object.entries(data.checklistValues ?? {})),
    });

    // Update account balance if PnL provided
    if (data.pnl !== undefined && data.pnl !== null) {
      await TradingAccount.findByIdAndUpdate(data.accountId, {
        $inc: { balance: data.pnl },
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/trades');
    revalidatePath('/analytics');
    revalidatePath('/calendar');

    return { id: trade._id.toString() };
  } catch (err: unknown) {
    console.error('[createTradeAction]', err);
    return { error: 'Failed to create trade' };
  }
}

export async function getTradeAction(tradeId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    await connectDB();
    const trade = await Trade.findOne({ _id: tradeId, userId });
    if (!trade) return null;

    return toPlainTrade(trade);
  } catch (error) {
    console.error('getTrade error:', error);
    return null;
  }
}

export async function updateTradeAction(
  id: string,
  data: Partial<TradeFormData>
): Promise<{ error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();

    const update: Record<string, unknown> = { ...data };
    if (data.parameterValues) {
      update.parameterValues = new Map(Object.entries(data.parameterValues));
    }
    if (data.checklistValues) {
      update.checklistValues = new Map(Object.entries(data.checklistValues));
    }
    if (data.tradeDate) update.tradeDate = new Date(data.tradeDate);
    if (data.closeDate) update.closeDate = new Date(data.closeDate);

    await Trade.findOneAndUpdate(
      { _id: id, userId: userId },
      update
    );

    revalidatePath('/dashboard');
    revalidatePath('/trades');
    revalidatePath(`/trades/${id}`);
    revalidatePath('/analytics');

    return {};
  } catch (err: unknown) {
    console.error('[updateTradeAction]', err);
    return { error: 'Failed to update trade' };
  }
}

export async function deleteTradeAction(id: string): Promise<{ error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Unauthorized' };

    await connectDB();
    await Trade.findOneAndDelete({ _id: id, userId: userId });

    revalidatePath('/dashboard');
    revalidatePath('/trades');
    revalidatePath('/analytics');

    return {};
  } catch (err: unknown) {
    console.error('[deleteTradeAction]', err);
    return { error: 'Failed to delete trade' };
  }
}

export async function getTradesAction(filters: TradeFilters = {}): Promise<TradePaginated> {
  const { userId } = await auth();
  if (!userId) return { trades: [], total: 0, page: 1, totalPages: 0 };

  await connectDB();

  const query: Record<string, unknown> = { userId: userId };
  if (filters.accountId) query.accountId = new Types.ObjectId(filters.accountId);
  if (filters.strategyId) query.strategyId = new Types.ObjectId(filters.strategyId);
  if (filters.symbol) query.symbol = filters.symbol.toUpperCase();
  if (filters.direction) query.direction = filters.direction;
  if (filters.status) query.status = filters.status;
  if (filters.session) query.session = filters.session;
  if (filters.dateFrom || filters.dateTo) {
    query.tradeDate = {};
    if (filters.dateFrom) (query.tradeDate as Record<string, Date>).$gte = new Date(filters.dateFrom);
    if (filters.dateTo) (query.tradeDate as Record<string, Date>).$lte = new Date(filters.dateTo);
  }

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 25;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Trade.find(query)
      .sort({ tradeDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('strategyId', 'name')
      .lean(),
    Trade.countDocuments(query),
  ]);

  return {
    trades: docs.map((d) => ({
      ...d,
      _id: d._id.toString(),
      userId: d.userId.toString(),
      accountId: d.accountId.toString(),
      strategyId: d.strategyId?.toString(),
      tradeDate: d.tradeDate instanceof Date ? d.tradeDate.toISOString() : (d.tradeDate ? String(d.tradeDate) : new Date().toISOString()),
      closeDate: d.closeDate instanceof Date ? d.closeDate.toISOString() : (d.closeDate ? String(d.closeDate) : undefined),
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : (d.createdAt ? String(d.createdAt) : new Date().toISOString()),
      updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : (d.updatedAt ? String(d.updatedAt) : new Date().toISOString()),
      session: d.session as any,
      notes: d.notes as any,
      importedFrom: d.importedFrom as any,
      parameterValues: d.parameterValues instanceof Map
        ? Object.fromEntries(d.parameterValues)
        : (d.parameterValues as Record<string, unknown> ?? {}),
      checklistValues: d.checklistValues instanceof Map
        ? Object.fromEntries(d.checklistValues)
        : (d.checklistValues as Record<string, boolean> ?? {}),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

import { dummyDashboardStats, dummyTrades } from '@/lib/dummyData';
export async function getDashboardStatsAction(): Promise<DashboardStats> {
  const { userId } = await auth();
  if (!userId) return {
    totalTrades: 0, winRate: 0, profitFactor: 0, netProfit: 0,
    averageRR: 0, largestWin: 0, largestLoss: 0, maxDrawdown: 0,
    monthlyPnl: 0, openTrades: 0,
  };

  if ((await cookies()).get('dummy-mode')?.value === 'true') return dummyDashboardStats;
  await connectDB();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allTrades, monthlyTrades, openTrades] = await Promise.all([
    Trade.find({ userId, status: 'closed' }).select('pnl rr direction').lean(),
    Trade.find({ userId, status: 'closed', tradeDate: { $gte: monthStart } }).select('pnl').lean(),
    Trade.countDocuments({ userId, status: 'open' }),
  ]);

  const totalTrades = allTrades.length;
  const wins = allTrades.filter((t) => (t.pnl ?? 0) > 0);
  const losses = allTrades.filter((t) => (t.pnl ?? 0) < 0);

  const grossProfit = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = losses.reduce((s, t) => s + Math.abs(t.pnl ?? 0), 0);

  const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 999 : 0) : grossProfit / grossLoss;
  const netProfit = grossProfit - grossLoss;

  const rrValues = allTrades.filter((t) => t.rr != null).map((t) => t.rr as number);
  const averageRR = rrValues.length ? rrValues.reduce((a, b) => a + b, 0) / rrValues.length : 0;

  const largestWin = wins.length ? Math.max(...wins.map((t) => t.pnl ?? 0)) : 0;
  const largestLoss = losses.length ? Math.min(...losses.map((t) => t.pnl ?? 0)) : 0;

  // Simple max drawdown calculation
  let peak = 0, equity = 0, maxDrawdown = 0;
  for (const t of allTrades) {
    equity += t.pnl ?? 0;
    if (equity > peak) peak = equity;
    const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const monthlyPnl = monthlyTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

  return {
    totalTrades,
    winRate,
    profitFactor,
    netProfit,
    averageRR,
    largestWin,
    largestLoss,
    maxDrawdown,
    monthlyPnl,
    openTrades,
  };
}
