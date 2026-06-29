import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { TradingAccount } from '@/models/TradingAccount';
import { Trade } from '@/models/Trade';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const propAccount = await TradingAccount.findOne({ 
      userId: user.id, 
      type: 'prop', 
      isActive: true 
    }).lean();

    if (!propAccount || !propAccount.propFirmSettings) {
      return NextResponse.json({ active: false });
    }

    const { startingBalance, dailyDrawdownLimit, maxDrawdownLimit, profitTarget } = propAccount.propFirmSettings;

    // Get today's trades (from start of UTC day)
    const startOfDay = new Date();
    startOfDay.setUTCHours(0,0,0,0);

    const todaysTrades = await Trade.find({ 
      accountId: propAccount._id, 
      status: 'closed',
      tradeDate: { $gte: startOfDay }
    }).lean();

    const allClosedTrades = await Trade.find({ 
      accountId: propAccount._id, 
      status: 'closed' 
    }).lean();

    const dailyPnL = todaysTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalPnL = allClosedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const currentBalance = startingBalance + totalPnL;
    
    // Drawdown calculations
    const dailyDrawdownAmount = startingBalance * (dailyDrawdownLimit / 100);
    const maxDrawdownAmount = startingBalance * (maxDrawdownLimit / 100);
    const profitTargetAmount = startingBalance * (profitTarget / 100);

    const isDailyFailed = dailyPnL < -dailyDrawdownAmount;
    const isMaxFailed = totalPnL < -maxDrawdownAmount;
    const isPassed = totalPnL >= profitTargetAmount;

    return NextResponse.json({
      active: true,
      accountName: propAccount.accountName,
      metrics: {
        startingBalance,
        currentBalance: currentBalance,
        dailyPnL,
        totalPnL,
        dailyDrawdownLimit,
        maxDrawdownLimit,
        profitTarget,
        dailyDrawdownAmount,
        maxDrawdownAmount,
        profitTargetAmount
      },
      status: isPassed ? 'PASSED' : (isDailyFailed || isMaxFailed ? 'FAILED' : 'ACTIVE'),
      progress: {
        daily: {
          used: Math.min(Math.max((Math.abs(Math.min(dailyPnL, 0)) / dailyDrawdownAmount) * 100, 0), 100),
          failed: isDailyFailed
        },
        max: {
          used: Math.min(Math.max((Math.abs(Math.min(totalPnL, 0)) / maxDrawdownAmount) * 100, 0), 100),
          failed: isMaxFailed
        },
        profit: {
          achieved: Math.min(Math.max((Math.max(totalPnL, 0) / profitTargetAmount) * 100, 0), 100)
        }
      }
    });

  } catch (error) {
    console.error('[API Prop Tracker]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
