import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITradeNote {
  idea?: string;
  mistakes?: string;
  lessons?: string;
  emotion?: string;
}

export interface ITrade extends Document {
  userId: string;
  accountId: Types.ObjectId;
  strategyId?: Types.ObjectId;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  commissions?: number;
  swaps?: number;
  pnl?: number;
  rr?: number;
  tradeDate: Date;
  closeDate?: Date;
  session?: string;
  parameterValues: Map<string, unknown>;
  checklistValues: Map<string, boolean>;
  screenshots: string[];
  notes: ITradeNote;
  status: 'open' | 'closed' | 'cancelled';
  importedFrom?: string;
  externalTicketId?: string;
  brokerConnectionId?: Types.ObjectId;
  tags?: string[];
  mistakeIds?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TradeNoteSchema = new Schema<ITradeNote>(
  {
    idea: { type: String },
    mistakes: { type: String },
    lessons: { type: String },
    emotion: { type: String },
  },
  { _id: false }
);

const TradeSchema = new Schema<ITrade>(
  {
    userId: { type: String, required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'TradingAccount', required: true },
    strategyId: { type: Schema.Types.ObjectId, ref: 'Strategy' },
    symbol: { type: String, required: true, uppercase: true },
    direction: { type: String, enum: ['LONG', 'SHORT'], required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number },
    stopLoss: { type: Number },
    takeProfit: { type: Number },
    lotSize: { type: Number, required: true },
    commissions: { type: Number, default: 0 },
    swaps: { type: Number, default: 0 },
    pnl: { type: Number },
    rr: { type: Number },
    tradeDate: { type: Date, required: true },
    closeDate: { type: Date },
    session: { type: String },
    parameterValues: { type: Map, of: Schema.Types.Mixed, default: {} },
    checklistValues: { type: Map, of: Boolean, default: {} },
    screenshots: [{ type: String }],
    notes: { type: TradeNoteSchema, default: {} },
    status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'closed' },
    importedFrom: { type: String },
    externalTicketId: { type: String },
    brokerConnectionId: { type: Schema.Types.ObjectId, ref: 'BrokerConnection' },
    tags: [{ type: String }],
    mistakeIds: [{ type: Schema.Types.ObjectId, ref: 'MistakeDefinition' }],
  },
  { timestamps: true }
);

// Compound index for analytics queries
TradeSchema.index({ userId: 1, tradeDate: -1 });
TradeSchema.index({ userId: 1, accountId: 1, tradeDate: -1 });
TradeSchema.index({ userId: 1, strategyId: 1 });
TradeSchema.index({ userId: 1, symbol: 1 });

export const Trade: Model<ITrade> =
  mongoose.models.Trade ?? mongoose.model<ITrade>('Trade', TradeSchema);
