// ============================================================
// Trade Types
// ============================================================

export type TradeDirection = 'LONG' | 'SHORT';
export type TradeStatus = 'open' | 'closed' | 'cancelled';
export type TradeSession = 'London' | 'New York' | 'Asian' | 'Sydney' | 'London/NY Overlap' | 'Other';
export type TradeEmotion = 'Calm' | 'FOMO' | 'Fearful' | 'Greedy' | 'Confident' | 'Overconfident' | 'Anxious' | 'Neutral';
export type ImportSource = 'MT5' | 'MT4' | 'MatchTrader' | 'cTrader' | 'Manual';

export interface TradeNote {
  idea?: string;
  mistakes?: string;
  lessons?: string;
  emotion?: TradeEmotion;
}

export interface Trade {
  _id: string;
  userId: string;
  accountId: string;
  strategyId?: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  pnl?: number;
  rr?: number;
  tradeDate: string;
  closeDate?: string;
  session?: TradeSession;
  parameterValues: Record<string, unknown>;
  checklistValues: Record<string, boolean>;
  screenshots: string[];
  notes: TradeNote;
  status: TradeStatus;
  importedFrom?: ImportSource;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TradeFormData {
  accountId: string;
  strategyId?: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  pnl?: number;
  rr?: number;
  tradeDate: string;
  closeDate?: string;
  session?: TradeSession;
  parameterValues: Record<string, unknown>;
  checklistValues: Record<string, boolean>;
  screenshots?: string[];
  notes: TradeNote;
  status: TradeStatus;
  tags?: string[];
}

export interface TradeFilters {
  accountId?: string;
  strategyId?: string;
  symbol?: string;
  direction?: TradeDirection;
  status?: TradeStatus;
  session?: TradeSession;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface TradePaginated {
  trades: Trade[];
  total: number;
  page: number;
  totalPages: number;
}
