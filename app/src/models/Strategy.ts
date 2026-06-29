import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IStrategyParameter {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'rating' | 'image';
  options?: string[];
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface IChecklistItem {
  id: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface IStrategy extends Document {
  userId: string;
  name: string;
  description?: string;
  parameters: IStrategyParameter[];
  checklist: IChecklistItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StrategyParameterSchema = new Schema<IStrategyParameter>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'date', 'rating', 'image'],
      required: true,
    },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
    defaultValue: { type: Schema.Types.Mixed },
    description: { type: String },
  },
  { _id: false }
);

const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    required: { type: Boolean, default: true },
    description: { type: String },
  },
  { _id: false }
);

const StrategySchema = new Schema<IStrategy>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    parameters: [StrategyParameterSchema],
    checklist: [ChecklistItemSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StrategySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Strategy: Model<IStrategy> =
  mongoose.models.Strategy ?? mongoose.model<IStrategy>('Strategy', StrategySchema);
