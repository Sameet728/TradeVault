// ============================================================
// Analytics Types
// ============================================================

export interface DashboardStats {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  averageRR: number;
  largestWin: number;
  largestLoss: number;
  maxDrawdown: number;
  monthlyPnl: number;
  openTrades: number;
}

export interface EquityPoint {
  date: string;
  balance: number;
  equity: number;
  drawdown: number;
}

export interface DailyPnL {
  date: string;
  pnl: number;
  trades: number;
  winRate: number;
}

export interface MonthlyReturn {
  month: string;       // e.g. "Jan 2025"
  pnl: number;
  trades: number;
  winRate: number;
}

export interface SessionStat {
  session: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  netPnl: number;
  avgRR: number;
}

export interface SymbolStat {
  symbol: string;
  trades: number;
  winRate: number;
  profitFactor: number;
  netPnl: number;
  avgRR: number;
}

export interface ParameterStat {
  paramKey: string;
  paramLabel: string;
  paramValue: string;
  trades: number;
  wins: number;
  winRate: number;
  profitFactor: number;
  netPnl: number;
}

export interface StrategyStat {
  strategyId: string;
  strategyName: string;
  trades: number;
  winRate: number;
  profitFactor: number;
  netPnl: number;
  maxDrawdown: number;
  avgRR: number;
}

export interface CalendarDay {
  date: string;
  pnl: number;
  trades: number;
  status: 'profit' | 'loss' | 'breakeven' | 'none';
}

export interface DrawdownPeriod {
  start: string;
  end: string;
  maxDrawdown: number;
  duration: number;
}

export interface AnalyticsFilters {
  accountId?: string;
  strategyId?: string;
  symbol?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DirectionMetrics {
  trades: number;
  winRate: number;
  largestWin: number;
  avgWin: number;
  maxConsecutiveWins: number;
  netPnl: number;
}

export interface AdvancedMetrics {
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  longs: DirectionMetrics;
  shorts: DirectionMetrics;
}
