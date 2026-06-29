const fs = require('fs');

let code = fs.readFileSync('src/actions/analytics.actions.ts', 'utf8');

const importReplacement = `  ParameterStat,
  StrategyStat,
  AnalyticsFilters,
  AdvancedMetrics,
  DirectionMetrics,
  CalendarDay
} from '@/types/analytics.types';`;

code = code.replace(/  ParameterStat,\n  StrategyStat,\n  AnalyticsFilters,\n\} from '@\/types\/analytics\.types';/, importReplacement);

const newAction = `

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
    status: data.pnl > 0 ? 'profit' : (data.pnl < 0 ? 'loss' : 'breakeven')
  })).sort((a, b) => a.date.localeCompare(b.date));
}
`;

code += newAction;
fs.writeFileSync('src/actions/analytics.actions.ts', code);
console.log('Done!');
