'use server';

import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { Types } from 'mongoose';
import { format, parseISO } from 'date-fns';
import type {
  EquityPoint,
  DailyPnL,
  MonthlyReturn,
  SessionStat,
  SymbolStat,
  CalendarDay,
  ParameterStat,
  StrategyStat,
  AnalyticsFilters,
  AdvancedMetrics,
  DirectionMetrics
} from '@/types/analytics.types';

function buildQuery(userId: string, filters: AnalyticsFilters = {}) {
  const query: Record<string, unknown> = {
    userId: userId,
    status: 'closed',
  };
  if (filters.accountId) query.accountId = new Types.ObjectId(filters.accountId);
  if (filters.strategyId) query.strategyId = new Types.ObjectId(filters.strategyId);
  if (filters.symbol) query.symbol = filters.symbol.toUpperCase();
  if (filters.dateFrom || filters.dateTo) {
    query.tradeDate = {};
    if (filters.dateFrom) (query.tradeDate as Record<string, Date>).$gte = new Date(filters.dateFrom);
    if (filters.dateTo) (query.tradeDate as Record<string, Date>).$lte = new Date(filters.dateTo);
  }
  return query;
}

export async function getEquityCurveAction(filters?: AnalyticsFilters): Promise<EquityPoint[]> {
  const { userId } = await auth();
  if (!userId) return [];

  if ((await cookies()).get('dummy-mode')?.value === 'true') {
    let balance = 0; let peak = 0;
    return Array.from({length: 30}).map((_, i) => {
      balance += Math.random() * 200 - 80;
      if(balance>peak) peak = balance;
      const d = new Date(); d.setDate(d.getDate() - (30 - i));
      return { date: d.toISOString().split('T')[0], balance: parseFloat(balance.toFixed(2)), equity: parseFloat(balance.toFixed(2)), drawdown: peak > 0 ? parseFloat((((peak - balance) / peak) * 100).toFixed(2)) : 0 };
    });
  }
  await connectDB();
  const trades = await Trade.find(buildQuery(userId, filters))
    .sort({ tradeDate: 1 })
    .select('tradeDate pnl')
    .lean();

  let balance = 0;
  let peak = 0;
  return trades.map((t) => {
    balance += t.pnl ?? 0;
    if (balance > peak) peak = balance;
    const drawdown = peak > 0 ? ((peak - balance) / peak) * 100 : 0;
    return {
      date: format(t.tradeDate, 'MMM dd'),
      balance: parseFloat(balance.toFixed(2)),
      equity: parseFloat(balance.toFixed(2)),
      drawdown: parseFloat(drawdown.toFixed(2)),
    };
  });
}

export async function getDailyPnLAction(filters?: AnalyticsFilters): Promise<DailyPnL[]> {
  const { userId } = await auth();
  if (!userId) return [];

  await connectDB();
  const trades = await Trade.find(buildQuery(userId, filters))
    .sort({ tradeDate: 1 })
    .select('tradeDate pnl')
    .lean();

  const byDay: Record<string, { pnl: number; trades: number; wins: number }> = {};
  for (const t of trades) {
    const day = format(t.tradeDate, 'yyyy-MM-dd');
    byDay[day] = byDay[day] ?? { pnl: 0, trades: 0, wins: 0 };
    byDay[day].pnl += t.pnl ?? 0;
    byDay[day].trades++;
    if ((t.pnl ?? 0) > 0) byDay[day].wins++;
  }

  return Object.entries(byDay).map(([date, data]) => ({
    date,
    pnl: parseFloat(data.pnl.toFixed(2)),
    trades: data.trades,
    winRate: data.trades ? (data.wins / data.trades) * 100 : 0,
  }));
}

export async function getMonthlyReturnsAction(filters?: AnalyticsFilters): Promise<MonthlyReturn[]> {
  const { userId } = await auth();
  if (!userId) return [];

  await connectDB();
  const trades = await Trade.find(buildQuery(userId, filters))
    .sort({ tradeDate: 1 })
    .select('tradeDate pnl')
    .lean();

  const byMonth: Record<string, { pnl: number; trades: number; wins: number }> = {};
  for (const t of trades) {
    const month = format(t.tradeDate, 'MMM yyyy');
    byMonth[month] = byMonth[month] ?? { pnl: 0, trades: 0, wins: 0 };
    byMonth[month].pnl += t.pnl ?? 0;
    byMonth[month].trades++;
    if ((t.pnl ?? 0) > 0) byMonth[month].wins++;
  }

  return Object.entries(byMonth).map(([month, data]) => ({
    month,
    pnl: parseFloat(data.pnl.toFixed(2)),
    trades: data.trades,
    winRate: data.trades ? (data.wins / data.trades) * 100 : 0,
  }));
}

export async function getSessionStatsAction(filters?: AnalyticsFilters): Promise<SessionStat[]> {
  const { userId } = await auth();
  if (!userId) return [];

  await connectDB();
  const trades = await Trade.find({ ...buildQuery(userId, filters), session: { $exists: true, $ne: null } })
    .select('session pnl rr')
    .lean();

  const bySess: Record<string, { wins: number; losses: number; pnl: number; rr: number[]; total: number }> = {};
  for (const t of trades) {
    const s = t.session ?? 'Unknown';
    bySess[s] = bySess[s] ?? { wins: 0, losses: 0, pnl: 0, rr: [], total: 0 };
    bySess[s].total++;
    bySess[s].pnl += t.pnl ?? 0;
    if (t.rr != null) bySess[s].rr.push(t.rr);
    if ((t.pnl ?? 0) > 0) bySess[s].wins++;
    else if ((t.pnl ?? 0) < 0) bySess[s].losses++;
  }

  return Object.entries(bySess).map(([sessionName, data]) => {
    const gross = data.pnl > 0 ? data.pnl : 0;
    const grossLoss = data.wins < data.total
      ? trades.filter(t => t.session === sessionName && (t.pnl ?? 0) < 0).reduce((s, t) => s + Math.abs(t.pnl ?? 0), 0)
      : 0;
    return {
      session: sessionName,
      trades: data.total,
      wins: data.wins,
      losses: data.losses,
      winRate: data.total ? (data.wins / data.total) * 100 : 0,
      profitFactor: grossLoss > 0 ? gross / grossLoss : gross > 0 ? 999 : 0,
      netPnl: parseFloat(data.pnl.toFixed(2)),
      avgRR: data.rr.length ? data.rr.reduce((a, b) => a + b, 0) / data.rr.length : 0,
    };
  });
}

export async function getSymbolStatsAction(filters?: AnalyticsFilters): Promise<SymbolStat[]> {
  const { userId } = await auth();
  if (!userId) return [];

  await connectDB();
  const trades = await Trade.find(buildQuery(userId, filters))
    .select('symbol pnl rr')
    .lean();

  const bySym: Record<string, { wins: number; losses: number; pnl: number; rr: number[]; total: number }> = {};
  for (const t of trades) {
    const s = t.symbol;
    bySym[s] = bySym[s] ?? { wins: 0, losses: 0, pnl: 0, rr: [], total: 0 };
    bySym[s].total++;
    bySym[s].pnl += t.pnl ?? 0;
    if (t.rr != null) bySym[s].rr.push(t.rr);
    if ((t.pnl ?? 0) > 0) bySym[s].wins++;
    else if ((t.pnl ?? 0) < 0) bySym[s].losses++;
  }

  return Object.entries(bySym).map(([symbol, data]) => {
    const grossProfit = trades.filter(t => t.symbol === symbol && (t.pnl ?? 0) > 0).reduce((s, t) => s + (t.pnl ?? 0), 0);
    const grossLoss = trades.filter(t => t.symbol === symbol && (t.pnl ?? 0) < 0).reduce((s, t) => s + Math.abs(t.pnl ?? 0), 0);
    return {
      symbol,
      trades: data.total,
      winRate: data.total ? (data.wins / data.total) * 100 : 0,
      profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0,
      netPnl: parseFloat(data.pnl.toFixed(2)),
      avgRR: data.rr.length ? data.rr.reduce((a, b) => a + b, 0) / data.rr.length : 0,
    };
  }).sort((a, b) => b.trades - a.trades);
}

export async function getStrategyStatsAction(filters?: AnalyticsFilters): Promise<StrategyStat[]> {
  const { userId } = await auth();
  if (!userId) return [];

  await connectDB();

  const result = await Trade.aggregate([
    {
      $match: {
        userId: userId,
        status: 'closed',
        strategyId: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$strategyId',
        trades: { $sum: 1 },
        wins: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] } },
        netPnl: { $sum: '$pnl' },
        avgRR: { $avg: '$rr' },
        grossProfit: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, '$pnl', 0] } },
        grossLoss: { $sum: { $cond: [{ $lt: ['$pnl', 0] }, { $abs: '$pnl' }, 0] } },
      },
    },
    { $lookup: { from: 'strategies', localField: '_id', foreignField: '_id', as: 'strategy' } },
    { $unwind: '$strategy' },
  ]);

  return result.map((r) => ({
    strategyId: r._id.toString(),
    strategyName: r.strategy.name,
    trades: r.trades,
    winRate: r.trades ? (r.wins / r.trades) * 100 : 0,
    profitFactor: r.grossLoss > 0 ? r.grossProfit / r.grossLoss : r.grossProfit > 0 ? 999 : 0,
    netPnl: parseFloat(r.netPnl.toFixed(2)),
    maxDrawdown: 0, // simplified
    avgRR: r.avgRR ?? 0,
  }));
}




export async function getAdvancedStatsAction(filters?: AnalyticsFilters): Promise<AdvancedMetrics | null> {
  const { userId } = await auth();
  if (!userId) return null;

  if ((await cookies()).get('dummy-mode')?.value === 'true') {
    return {
      avgWin: 11.60, avgLoss: -7.94, profitFactor: 1.01, consecutiveWins: 2, consecutiveLosses: 1, maxConsecutiveWins: 8, maxConsecutiveLosses: 4,
      longs: { trades: 23, winRate: 26.09, largestWin: 26.97, avgWin: 10.08, maxConsecutiveWins: 2, netPnl: -46.39 },
      shorts: { trades: 38, winRate: 50.0, largestWin: 55.12, avgWin: 12.08, maxConsecutiveWins: 8, netPnl: 74.26 }
    };
  }

  await connectDB();
  const trades = await Trade.find(buildQuery(userId, filters)).sort({ tradeDate: 1 }).lean();
  
  if (!trades.length) return null;

  let grossProfit = 0;
  let grossLoss = 0;
  let winCount = 0;
  let lossCount = 0;
  
  let currWins = 0;
  let currLosses = 0;
  let maxWins = 0;
  let maxLosses = 0;

  const longs = { trades: 0, wins: 0, largestWin: 0, grossWin: 0, currWins: 0, maxWins: 0, netPnl: 0 };
  const shorts = { trades: 0, wins: 0, largestWin: 0, grossWin: 0, currWins: 0, maxWins: 0, netPnl: 0 };

  for (const t of trades) {
    const pnl = t.pnl ?? 0;
    const isWin = pnl > 0;
    const isLoss = pnl < 0;

    if (isWin) {
      grossProfit += pnl; winCount++;
      currWins++; currLosses = 0;
      if (currWins > maxWins) maxWins = currWins;
    } else if (isLoss) {
      grossLoss += Math.abs(pnl); lossCount++;
      currLosses++; currWins = 0;
      if (currLosses > maxLosses) maxLosses = currLosses;
    }

    const dir = t.direction === 'LONG' ? longs : shorts;
    dir.trades++;
    dir.netPnl += pnl;
    if (isWin) {
      dir.wins++;
      dir.grossWin += pnl;
      dir.currWins++;
      if (dir.currWins > dir.maxWins) dir.maxWins = dir.currWins;
      if (pnl > dir.largestWin) dir.largestWin = pnl;
    } else if (isLoss) {
      dir.currWins = 0;
    }
  }

  const pf = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? grossProfit : 0);
  
  return {
    avgWin: winCount > 0 ? parseFloat((grossProfit / winCount).toFixed(2)) : 0,
    avgLoss: lossCount > 0 ? parseFloat((grossLoss / lossCount * -1).toFixed(2)) : 0,
    profitFactor: parseFloat(pf.toFixed(2)),
    consecutiveWins: currWins,
    consecutiveLosses: currLosses,
    maxConsecutiveWins: maxWins,
    maxConsecutiveLosses: maxLosses,
    longs: {
      trades: longs.trades,
      winRate: longs.trades > 0 ? parseFloat((longs.wins / longs.trades * 100).toFixed(2)) : 0,
      largestWin: parseFloat(longs.largestWin.toFixed(2)),
      avgWin: longs.wins > 0 ? parseFloat((longs.grossWin / longs.wins).toFixed(2)) : 0,
      maxConsecutiveWins: longs.maxWins,
      netPnl: parseFloat(longs.netPnl.toFixed(2))
    },
    shorts: {
      trades: shorts.trades,
      winRate: shorts.trades > 0 ? parseFloat((shorts.wins / shorts.trades * 100).toFixed(2)) : 0,
      largestWin: parseFloat(shorts.largestWin.toFixed(2)),
      avgWin: shorts.wins > 0 ? parseFloat((shorts.grossWin / shorts.wins).toFixed(2)) : 0,
      maxConsecutiveWins: shorts.maxWins,
      netPnl: parseFloat(shorts.netPnl.toFixed(2))
    }
  };
}

export async function getCalendarDataAction(filters?: AnalyticsFilters): Promise<CalendarDay[]> {
  const { userId } = await auth();
  if (!userId) return [];

  if ((await cookies()).get('dummy-mode')?.value === 'true') {
    const arr: CalendarDay[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const isTradeDay = Math.random() > 0.3;
      const pnl = isTradeDay ? (Math.random() * 200 - 80) : 0;
      arr.push({
        date: d.toISOString().split('T')[0],
        pnl: parseFloat(pnl.toFixed(2)),
        trades: isTradeDay ? Math.floor(Math.random() * 5) + 1 : 0,
        status: !isTradeDay ? 'none' : (pnl > 0 ? 'profit' : (pnl < 0 ? 'loss' : 'breakeven'))
      });
    }
    return arr;
  }

  await connectDB();
  const trades = await Trade.find(buildQuery(userId, filters)).select('tradeDate pnl').lean();

  const byDay: Record<string, { pnl: number; trades: number }> = {};
  for (const t of trades) {
    const day = format(t.tradeDate, 'yyyy-MM-dd');
    byDay[day] = byDay[day] ?? { pnl: 0, trades: 0 };
    byDay[day].pnl += t.pnl ?? 0;
    byDay[day].trades++;
  }

  return Object.entries(byDay).map(([date, data]) => ({
    date,
    pnl: parseFloat(data.pnl.toFixed(2)),
    trades: data.trades,
    status: (data.pnl > 0 ? 'profit' : (data.pnl < 0 ? 'loss' : 'breakeven')) as CalendarDay['status']
  })).sort((a, b) => a.date.localeCompare(b.date));
}
