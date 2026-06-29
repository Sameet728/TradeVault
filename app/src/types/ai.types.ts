// ============================================================
// AI Review Types
// ============================================================

export interface AIReview {
  _id: string;
  userId: string;
  tradeId: string;
  strengths: string[];
  weaknesses: string[];
  mistakes: string[];
  improvements: string[];
  score: number;        // 0-100
  summary: string;
  generatedAt: string;
}

export interface AIWeeklyReport {
  _id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  tradeCount: number;
  winRate: number;
  netPnl: number;
  bestStrategy: string;
  worstStrategy: string;
  commonMistakes: string[];
  suggestedImprovements: string[];
  summary: string;
  generatedAt: string;
}

export interface AIPatternInsight {
  category: string;          // e.g. "Best Session", "Optimal RR"
  insight: string;
  confidence: 'low' | 'medium' | 'high';
  supportingData: string;
  actionable: string;
}

export interface AIPatternDiscovery {
  _id: string;
  userId: string;
  insights: AIPatternInsight[];
  tradesSampled: number;
  generatedAt: string;
}

export type AccountType = 'personal' | 'prop';

export interface PropFirmSettings {
  profitTarget: number;       // % e.g. 10
  dailyDrawdownLimit: number; // % e.g. 5
  maxDrawdownLimit: number;   // % e.g. 10
  startingBalance: number;
}

export interface TradingAccount {
  _id: string;
  userId: string;
  accountName: string;
  broker: string;
  accountNumber?: string;
  platform: 'MT5' | 'MT4' | 'cTrader' | 'MatchTrader' | 'Other';
  balance: number;
  currency: string;
  type: AccountType;
  propFirmSettings?: PropFirmSettings;
  isActive: boolean;
  isPublic: boolean;
  publicSlug?: string;
  createdAt: string;
  updatedAt: string;
}
