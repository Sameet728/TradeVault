import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMistakeDefinition extends Document {
  userId: string;
  name: string;
  description?: string;
  color?: string; // For UI display tags
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MistakeDefinitionSchema = new Schema<IMistakeDefinition>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String, default: '#EF4444' }, // Default to red
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MistakeDefinitionSchema.index({ userId: 1, name: 1 }, { unique: true });

export const MistakeDefinition: Model<IMistakeDefinition> =
  mongoose.models.MistakeDefinition ?? mongoose.model<IMistakeDefinition>('MistakeDefinition', MistakeDefinitionSchema);
