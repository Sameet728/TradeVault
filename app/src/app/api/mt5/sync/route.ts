import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { User } from '@/models/User';
import { TradingAccount } from '@/models/TradingAccount';
import { Types } from 'mongoose';

// Expected MT5 Payload
// {
//   "apiKey": "tj_...",
//   "accountNumber": "123456",
//   "symbol": "XAUUSD",
//   "type": "buy",
//   "lots": 1.0,
//   "entryPrice": 2000.50,
//   "exitPrice": 2010.50,
//   "sl": 1990.00,
//   "tp": 2020.00,
//   "pnl": 1000.00,
//   "openTime": "2023-10-27T10:00:00Z",
//   "closeTime": "2023-10-27T11:00:00Z"
// }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      apiKey, accountNumber, symbol, type, lots,
      entryPrice, exitPrice, sl, tp, pnl,
      openTime, closeTime,
    } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    await connectDB();

    // In a real app, you would hash the API key or map it to a user.
    // Here we simulate the lookup based on the fake API key format we used in settings:
    // "tj_" + base64(email)
    const encodedEmail = apiKey.replace('tj_', '').slice(0, 24);
    
    // Fallback simple validation for this demo
    const users = await User.find({}).lean();
    const user = users.find(u => {
      const uEncoded = Buffer.from(u.email).toString('base64').slice(0, 24);
      return uEncoded === encodedEmail;
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Find the trading account that matches the account number, or just pick their first active account
    let account = null;
    if (accountNumber) {
      account = await TradingAccount.findOne({ userId: user._id.toString(), accountNumber: String(accountNumber), isActive: true });
    }
    if (!account) {
      account = await TradingAccount.findOne({ userId: user._id.toString(), isActive: true });
    }

    if (!account) {
      return NextResponse.json({ error: 'No active trading account found for user' }, { status: 404 });
    }

    const direction = type?.toLowerCase().includes('buy') ? 'LONG' : 'SHORT';
    const tradeDate = openTime ? new Date(openTime) : new Date();
    const isClosed = exitPrice && closeTime;

    const trade = await Trade.create({
      userId: user._id.toString(),
      accountId: account._id,
      symbol: symbol?.toUpperCase() || 'UNKNOWN',
      direction,
      entryPrice: parseFloat(entryPrice) || 0,
      exitPrice: isClosed ? parseFloat(exitPrice) : undefined,
      stopLoss: sl ? parseFloat(sl) : undefined,
      takeProfit: tp ? parseFloat(tp) : undefined,
      lotSize: parseFloat(lots) || 1,
      pnl: pnl ? parseFloat(pnl) : undefined,
      tradeDate,
      closeDate: isClosed ? new Date(closeTime) : undefined,
      status: isClosed ? 'closed' : 'open',
      importedFrom: 'MT5_EA',
    });

    // Update account balance if the trade is closed and has PnL
    if (isClosed && pnl) {
      await TradingAccount.findByIdAndUpdate(account._id, {
        $inc: { balance: parseFloat(pnl) },
      });
    }

    return NextResponse.json({ success: true, tradeId: trade._id });
  } catch (err: unknown) {
    console.error('[MT5 Sync]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
