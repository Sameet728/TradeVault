import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { Strategy } from '@/models/Strategy';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const strategyId = searchParams.get('strategyId');
    const parameterKey = searchParams.get('parameterKey');

    if (!strategyId || !parameterKey) {
      return NextResponse.json({ error: 'Missing strategyId or parameterKey' }, { status: 400 });
    }

    await connectDB();

    // Verify strategy belongs to user
    const strategy = await Strategy.findOne({ _id: strategyId, userId: user.id });
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Dynamic grouping based on the parameter key stored in the `parameterValues` Map.
    // In MongoDB, Map values are stored as an object, so we query it via `parameterValues.<key>`
    const parameterField = `$parameterValues.${parameterKey}`;

    const pipeline = [
      {
        $match: {
          userId: user.id,
          strategyId: strategy._id,
          status: 'closed',
          // Only aggregate trades that actually have this parameter defined
          [`parameterValues.${parameterKey}`]: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: parameterField,
          tradeCount: { $sum: 1 },
          totalPnL: { $sum: { $ifNull: ['$pnl', 0] } },
          totalRR: { $sum: { $ifNull: ['$rr', 0] } },
          wins: {
            $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] }
          },
          losses: {
            $sum: { $cond: [{ $lt: ['$pnl', 0] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          parameterValue: '$_id',
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
            // Placeholder: we'd need sum of winning PnL and sum of losing PnL to do a true PF.
            // Using a simple conditional here for demo purposes.
            $cond: [{ $eq: ['$losses', 0] }, 999, { $divide: ['$wins', '$losses'] }]
          }
        }
      },
      {
        $sort: { tradeCount: -1 }
      }
    ];

    const results = await Trade.aggregate(pipeline);

    return NextResponse.json({ parameterKey, results });
  } catch (error) {
    console.error('[API Analytics Parameters]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
