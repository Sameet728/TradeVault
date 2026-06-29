import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { PipelineStage } from 'mongoose';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // The AI Edge Engine discovers the highest edge by grouping multi-dimensionally
    // We will group by Symbol, Strategy, and Session to find the best performing "Setups"
    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: user.id,
          status: 'closed'
        }
      },
      {
        $lookup: {
          from: 'strategies',
          localField: 'strategyId',
          foreignField: '_id',
          as: 'strategy'
        }
      },
      {
        $unwind: { path: '$strategy', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: {
            symbol: '$symbol',
            session: { $ifNull: ['$session', 'Any'] },
            strategyName: { $ifNull: ['$strategy.name', 'No Strategy'] }
          },
          tradeCount: { $sum: 1 },
          totalPnL: { $sum: { $ifNull: ['$pnl', 0] } },
          totalRR: { $sum: { $ifNull: ['$rr', 0] } },
          winningPnL: {
            $sum: { $cond: [{ $gt: ['$pnl', 0] }, '$pnl', 0] }
          },
          losingPnL: {
            $sum: { $cond: [{ $lt: ['$pnl', 0] }, '$pnl', 0] }
          },
          wins: {
            $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] }
          },
          losses: {
            $sum: { $cond: [{ $lt: ['$pnl', 0] }, 1, 0] }
          }
        }
      },
      {
        // Filter out setups with fewer than 3 trades to remove noise
        $match: {
          tradeCount: { $gte: 3 }
        }
      },
      {
        $project: {
          symbol: '$_id.symbol',
          session: '$_id.session',
          strategyName: '$_id.strategyName',
          tradeCount: 1,
          totalPnL: 1,
          avgRR: {
            $cond: [{ $eq: ['$tradeCount', 0] }, 0, { $divide: ['$totalRR', '$tradeCount'] }]
          },
          winRate: {
            $cond: [
              { $eq: [{ $add: ['$wins', '$losses'] }, 0] },
              0,
              { $multiply: [{ $divide: ['$wins', { $add: ['$wins', '$losses'] }] }, 100] }
            ]
          },
          profitFactor: {
            $cond: [
              { $eq: ['$losingPnL', 0] },
              999,
              { $divide: ['$winningPnL', { $abs: '$losingPnL' }] }
            ]
          },
          expectedReturn: {
            // Very basic ER = WinRate * AvgWin - LossRate * AvgLoss
            // Simplified here as TotalPnL / TradeCount (Expected value per trade)
            $divide: ['$totalPnL', '$tradeCount']
          }
        }
      },
      {
        // Sort by highest Profit Factor and Win Rate (Edge)
        $sort: { profitFactor: -1, winRate: -1 }
      },
      {
        $limit: 10
      }
    ];

    const bestSetups = await Trade.aggregate(pipeline);

    // AI summary generation would happen here, we return the raw edge data for the UI to consume
    return NextResponse.json({ bestSetups });
  } catch (error) {
    console.error('[API Edge Engine]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
