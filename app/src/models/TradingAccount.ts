import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPropFirmSettings {
  profitTarget: number;
  dailyDrawdownLimit: number;
  maxDrawdownLimit: number;
  startingBalance: number;
}

export interface ITradingAccount extends Document {
  userId: string;
  accountName: string;
  broker: string;
  accountNumber?: string;
  platform: 'MT5' | 'MT4' | 'cTrader' | 'MatchTrader' | 'Other';
  balance: number;
  currency: string;
  type: 'personal' | 'prop';
  propFirmSettings?: IPropFirmSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropFirmSettingsSchema = new Schema<IPropFirmSettings>(
  {
    profitTarget: { type: Number, required: true },
    dailyDrawdownLimit: { type: Number, required: true },
    maxDrawdownLimit: { type: Number, required: true },
    startingBalance: { type: Number, required: true },
  },
  { _id: false }
);

const TradingAccountSchema = new Schema<ITradingAccount>(
  {
    userId: { type: String, required: true, index: true },
    accountName: { type: String, required: true },
    broker: { type: String, required: true },
    accountNumber: { type: String },
    platform: {
      type: String,
      enum: ['MT5', 'MT4', 'cTrader', 'MatchTrader', 'Other'],
      default: 'MT5',
    },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    type: { type: String, enum: ['personal', 'prop'], default: 'personal' },
    propFirmSettings: { type: PropFirmSettingsSchema },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TradingAccount: Model<ITradingAccount> =
  mongoose.models.TradingAccount ??
  mongoose.model<ITradingAccount>('TradingAccount', TradingAccountSchema);
