import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { MistakeDefinition } from '@/models/MistakeDefinition';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 1. Fetch user's defined mistakes
    const mistakeDefs = await MistakeDefinition.find({ userId: user.id }).lean();
    if (mistakeDefs.length === 0) {
      return NextResponse.json({ mistakes: [], totalCost: 0 });
    }

    // 2. Aggregate trades with mistakeIds
    const pipeline = [
      {
        $match: {
          userId: user.id,
          mistakeIds: { $exists: true, $not: { $size: 0 } },
          status: 'closed'
        }
      },
      {
        $unwind: '$mistakeIds'
      },
      {
        $group: {
          _id: '$mistakeIds',
          tradeCount: { $sum: 1 },
          totalPnL: { $sum: { $ifNull: ['$pnl', 0] } },
          losingTradesCount: {
            $sum: {
              $cond: [{ $lt: ['$pnl', 0] }, 1, 0]
            }
          },
          losingTradesPnL: {
            $sum: {
              $cond: [{ $lt: ['$pnl', 0] }, '$pnl', 0]
            }
          }
        }
      },
      {
        $sort: { losingTradesPnL: 1 } // Ascending (most negative first)
      }
    ];

    const results = await Trade.aggregate(pipeline);

    // 3. Map aggregation results to mistake definitions
    const mappedResults = results.map(r => {
      const def = mistakeDefs.find(d => d._id.toString() === r._id.toString());
      return {
        id: r._id,
        name: def ? def.name : 'Unknown Mistake',
        color: def ? def.color : '#52525B',
        tradeCount: r.tradeCount,
        totalPnL: r.totalPnL,
        losingTradesCount: r.losingTradesCount,
        cost: r.losingTradesPnL, // The actual cost is the PnL lost on losing trades with this mistake
      };
    });

    const totalCost = mappedResults.reduce((acc, curr) => acc + curr.cost, 0);

    return NextResponse.json({ mistakes: mappedResults, totalCost });
  } catch (error) {
    console.error('[API Analytics Mistakes]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
