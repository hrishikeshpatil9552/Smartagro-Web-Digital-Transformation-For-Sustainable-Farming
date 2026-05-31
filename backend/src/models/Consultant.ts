import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultant extends Document {
  name: string;
  phone: string;
  email?: string;
  expertise: string; // Main specialization (single crop)
  experience: number; // in years
  state: string;
  district: string;
  language?: string; // e.g., "Hindi, English"
  fee?: number; // 0 for free
  rating?: number;
  image?: string; // URL or base64 to profile image
  profit?: number; // Last year profit or average earnings
  about?: string; // Brief description
  cropSpecializations?: string[]; // Multiple crops handled
}

const ConsultantSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  expertise: { type: String, required: true },
  experience: { type: Number, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  language: { type: String, default: 'Hindi, English' },
  fee: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  image: { type: String },
  profit: { type: Number },
  about: { type: String },
  cropSpecializations: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model<IConsultant>('Consultant', ConsultantSchema);
