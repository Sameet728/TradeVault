import { Types } from 'mongoose';
import type { ITrade } from '@/models/Trade';
import type { IStrategy } from '@/models/Strategy';
import type { ITradingAccount } from '@/models/TradingAccount';

// Dummy Strategy
export const dummyStrategies: any = [
  {
    _id: new Types.ObjectId().toString(),
    userId: 'dummy_user',
    name: 'London Breakout',
    description: 'Breakout of the Asian session range during London open',
    parameters: [
      { key: 'range_size', label: 'Range Size', type: 'number', options: [], required: false },
      { key: 'confirmation', label: 'Confirmation', type: 'boolean', options: [], required: false }
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new Types.ObjectId().toString(),
    userId: 'dummy_user',
    name: 'Supply & Demand',
    description: 'Trading from HTF zones',
    parameters: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Dummy Trades
export const dummyTrades: any = Array.from({ length: 50 }).map((_, i) => {
  const isWin = Math.random() > 0.4;
  const pnl = isWin ? Math.random() * 500 + 100 : -(Math.random() * 300 + 50);
  const date = new Date();
  date.setDate(date.getDate() - i);
  
  return {
    _id: new Types.ObjectId().toString(),
    userId: 'dummy_user',
    accountId: new Types.ObjectId().toString(),
    symbol: ['XAUUSD', 'EURUSD', 'GBPUSD', 'US30'][Math.floor(Math.random() * 4)],
    direction: Math.random() > 0.5 ? 'LONG' : 'SHORT',
    entryPrice: 1.1000 + (Math.random() * 0.01),
    exitPrice: 1.1000 + (isWin ? 0.005 : -0.002),
    stopLoss: 1.0980,
    takeProfit: 1.1050,
    lotSize: Math.floor(Math.random() * 3) + 1,
    pnl,
    rr: isWin ? (pnl / 200) : -1,
    tradeDate: date,
    closeDate: date,
    status: 'closed',
    strategyId: dummyStrategies[Math.floor(Math.random() * 2)]._id,
    session: ['London', 'New York', 'Asian'][Math.floor(Math.random() * 3)],
    importedFrom: 'manual',
    parameterValues: new Map(),
    createdAt: date,
    updatedAt: date
  };
});

// Helper for Dashboard Stats
export const dummyDashboardStats = {
  totalTrades: 124,
  winRate: 64.5,
  profitFactor: 2.1,
  netProfit: 12450.50,
  averageRR: 1.8,
  largestWin: 1250,
  largestLoss: -450,
  maxDrawdown: 4.2,
  monthlyPnl: 3450.25,
  openTrades: 2,
};
