import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Trade } from '@/models/Trade';
import { User } from '@/models/User';
import { TradingAccount } from '@/models/TradingAccount';
import { BrokerConnection } from '@/models/BrokerConnection';
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
      webhookSecret, externalTicketId, accountNumber, symbol, type, lots,
      entryPrice, exitPrice, sl, tp, pnl, commissions, swaps,
      openTime, closeTime, platform
    } = body;

    if (!webhookSecret) {
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 401 });
    }

    await connectDB();

    // 1. Authenticate via BrokerConnection webhook secret
    const connection = await BrokerConnection.findOne({ webhookSecret, status: 'active' });
    if (!connection) {
      return NextResponse.json({ error: 'Invalid webhook secret or inactive connection' }, { status: 401 });
    }

    const userId = connection.userId;

    // 2. Find associated trading account
    let account = null;
    if (accountNumber) {
      account = await TradingAccount.findOne({ userId, accountNumber: String(accountNumber), isActive: true });
    }
    if (!account) {
      account = await TradingAccount.findOne({ userId, isActive: true });
    }

    if (!account) {
      return NextResponse.json({ error: 'No active trading account found for user' }, { status: 404 });
    }

    // 3. Normalize payload (MT5/cTrader/etc to standard ITrade)
    const direction = type?.toLowerCase().includes('buy') ? 'LONG' : 'SHORT';
    const tradeDate = openTime ? new Date(openTime) : new Date();
    const isClosed = exitPrice && closeTime;
    
    // Check if this trade was already synced
    if (externalTicketId) {
      const existingTrade = await Trade.findOne({ externalTicketId, brokerConnectionId: connection._id });
      if (existingTrade) {
        // Update existing trade (e.g. if it was open and is now closed)
        if (isClosed && existingTrade.status === 'open') {
          existingTrade.exitPrice = parseFloat(exitPrice);
          existingTrade.closeDate = new Date(closeTime);
          existingTrade.pnl = pnl ? parseFloat(pnl) : undefined;
          existingTrade.commissions = commissions ? parseFloat(commissions) : existingTrade.commissions;
          existingTrade.swaps = swaps ? parseFloat(swaps) : existingTrade.swaps;
          existingTrade.status = 'closed';
          await existingTrade.save();
          
          // Update connection sync time
          connection.lastSyncAt = new Date();
          await connection.save();

          return NextResponse.json({ success: true, tradeId: existingTrade._id, updated: true });
        }
        return NextResponse.json({ success: true, message: 'Trade already synced' });
      }
    }

    const trade = await Trade.create({
      userId,
      accountId: account._id,
      brokerConnectionId: connection._id,
      externalTicketId: externalTicketId || undefined,
      symbol: symbol?.toUpperCase() || 'UNKNOWN',
      direction,
      entryPrice: parseFloat(entryPrice) || 0,
      exitPrice: isClosed ? parseFloat(exitPrice) : undefined,
      stopLoss: sl ? parseFloat(sl) : undefined,
      takeProfit: tp ? parseFloat(tp) : undefined,
      lotSize: parseFloat(lots) || 1,
      commissions: commissions ? parseFloat(commissions) : 0,
      swaps: swaps ? parseFloat(swaps) : 0,
      pnl: pnl ? parseFloat(pnl) : undefined,
      tradeDate,
      closeDate: isClosed ? new Date(closeTime) : undefined,
      status: isClosed ? 'closed' : 'open',
      importedFrom: platform || connection.platform || 'API',
    });
    
    // Update last sync time
    connection.lastSyncAt = new Date();
    await connection.save();

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
