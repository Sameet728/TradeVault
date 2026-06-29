import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlaybook extends Document {
  userId: string;
  name: string;
  description: string;
  criteria: string[];
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PlaybookSchema = new Schema<IPlaybook>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    criteria: [{ type: String }],
    imageUrls: [{ type: String }],
  },
  { timestamps: true }
);

export const Playbook: Model<IPlaybook> =
  mongoose.models.Playbook ?? mongoose.model<IPlaybook>('Playbook', PlaybookSchema);
