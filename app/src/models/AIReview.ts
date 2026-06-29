import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAIReview extends Document {
  userId: string;
  tradeId: Types.ObjectId;
  strengths: string[];
  weaknesses: string[];
  mistakes: string[];
  improvements: string[];
  score: number;
  summary: string;
  generatedAt: Date;
}

const AIReviewSchema = new Schema<IAIReview>(
  {
    userId: { type: String, required: true, index: true },
    tradeId: { type: Schema.Types.ObjectId, ref: 'Trade', required: true, unique: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    mistakes: [{ type: String }],
    improvements: [{ type: String }],
    score: { type: Number, min: 0, max: 100 },
    summary: { type: String },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const AIReview: Model<IAIReview> =
  mongoose.models.AIReview ?? mongoose.model<IAIReview>('AIReview', AIReviewSchema);

// ---- Weekly Report ----
export interface IAIWeeklyReport extends Document {
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  tradeCount: number;
  winRate: number;
  netPnl: number;
  bestStrategy?: string;
  worstStrategy?: string;
  commonMistakes: string[];
  suggestedImprovements: string[];
  summary: string;
  generatedAt: Date;
}

const AIWeeklyReportSchema = new Schema<IAIWeeklyReport>({
  userId: { type: String, required: true, index: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  tradeCount: { type: Number },
  winRate: { type: Number },
  netPnl: { type: Number },
  bestStrategy: { type: String },
  worstStrategy: { type: String },
  commonMistakes: [{ type: String }],
  suggestedImprovements: [{ type: String }],
  summary: { type: String },
  generatedAt: { type: Date, default: Date.now },
});

export const AIWeeklyReport: Model<IAIWeeklyReport> =
  mongoose.models.AIWeeklyReport ??
  mongoose.model<IAIWeeklyReport>('AIWeeklyReport', AIWeeklyReportSchema);

// ---- Notification ----
export interface INotification extends Document {
  userId: string;
  type: 'weekly_report' | 'drawdown_warning' | 'target_reached' | 'trade_review';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['weekly_report', 'drawdown_warning', 'target_reached', 'trade_review'],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>('Notification', NotificationSchema);
