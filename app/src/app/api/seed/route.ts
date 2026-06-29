import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { Strategy } from '@/models/Strategy';
import { TradingAccount } from '@/models/TradingAccount';
import { Types } from 'mongoose';
import { dummyStrategies, dummyTrades } from '@/lib/dummyData';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // 1. Create a trading account
    const account = await TradingAccount.create({
      userId,
      accountName: 'Prop Firm Challenge',
      broker: 'FTMO',
      platform: 'MT5',
      balance: 100000,
      currency: 'USD',
      isActive: true,
    });

    // 2. Create strategies
    const strategies = await Strategy.insertMany(
      dummyStrategies.map((s: any) => ({
        userId,
        name: s.name,
        description: s.description,
        parameters: s.parameters || [],
        checklist: [],
        isActive: true,
      }))
    );

    // 3. Create trades
    const tradesToInsert = dummyTrades.map((t: any) => ({
      ...t,
      _id: undefined,
      userId,
      accountId: account._id,
      strategyId: strategies[Math.floor(Math.random() * strategies.length)]._id,
    }));

    await Trade.insertMany(tradesToInsert);

    return NextResponse.json({ success: true, message: 'Seeded actual data successfully!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
