import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrokerConnection extends Document {
  userId: string;
  name: string;
  platform: 'MT4' | 'MT5' | 'cTrader' | 'MatchTrader' | 'DXTrade' | 'CSV';
  webhookSecret?: string;
  accountId?: string; // e.g., the MT5 account number
  serverName?: string;
  lastSyncAt?: Date;
  status: 'active' | 'error' | 'disconnected';
  createdAt: Date;
  updatedAt: Date;
}

const BrokerConnectionSchema = new Schema<IBrokerConnection>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    platform: {
      type: String,
      enum: ['MT4', 'MT5', 'cTrader', 'MatchTrader', 'DXTrade', 'CSV'],
      required: true,
    },
    webhookSecret: { type: String }, // For secure API validation from EA
    accountId: { type: String },
    serverName: { type: String },
    lastSyncAt: { type: Date },
    status: { type: String, enum: ['active', 'error', 'disconnected'], default: 'active' },
  },
  { timestamps: true }
);

export const BrokerConnection: Model<IBrokerConnection> =
  mongoose.models.BrokerConnection ?? mongoose.model<IBrokerConnection>('BrokerConnection', BrokerConnectionSchema);
