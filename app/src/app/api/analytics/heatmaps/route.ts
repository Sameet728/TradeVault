import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { PipelineStage } from 'mongoose';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // Group by Day of Week and Hour of Day using MongoDB date operators
    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: user.id,
          status: 'closed',
          tradeDate: { $exists: true }
        }
      },
      {
        $project: {
          pnl: { $ifNull: ['$pnl', 0] },
          // Day of week: 1 (Sunday) to 7 (Saturday)
          dayOfWeek: { $dayOfWeek: '$tradeDate' },
          // Hour of day: 0 to 23
          hourOfDay: { $hour: '$tradeDate' }
        }
      },
      {
        $group: {
          _id: { day: '$dayOfWeek', hour: '$hourOfDay' },
          tradeCount: { $sum: 1 },
          totalPnL: { $sum: '$pnl' },
          wins: { $sum: { $cond: [{ $gt: ['$pnl', 0] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          day: '$_id.day',
          hour: '$_id.hour',
          tradeCount: 1,
          totalPnL: 1,
          winRate: {
            $cond: [
              { $eq: ['$tradeCount', 0] }, 0,
              { $multiply: [{ $divide: ['$wins', '$tradeCount'] }, 100] }
            ]
          }
        }
      }
    ];

    const heatmaps = await Trade.aggregate(pipeline);

    // Transform into a 7x24 grid for easy frontend rendering
    const grid = Array.from({ length: 7 }, (_, d) => 
      Array.from({ length: 24 }, (_, h) => ({
        day: d + 1, // 1=Sun...7=Sat
        hour: h,
        tradeCount: 0,
        totalPnL: 0,
        winRate: 0
      }))
    );

    heatmaps.forEach(h => {
      // day corresponds to 1-7 in MongoDB
      if (h.day >= 1 && h.day <= 7 && h.hour >= 0 && h.hour <= 23) {
        grid[h.day - 1][h.hour] = h;
      }
    });

    return NextResponse.json({ heatmap: grid });
  } catch (error) {
    console.error('[API Heatmaps GET]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
