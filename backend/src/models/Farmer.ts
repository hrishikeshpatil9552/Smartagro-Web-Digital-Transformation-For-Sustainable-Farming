import mongoose, { Document, Schema } from 'mongoose';

export interface IFarmer extends Document {
  name?: string;
  phone?: string;
  state?: string;
  district?: string;
  taluka?: string;
  village?: string;
  land_size?: number;
  caste?: string;
  income?: number;
  category?: string;
  crops?: string[];
  created_at?: Date;
}

const FarmerSchema = new Schema({
  name: String,
  phone: String,
  state: String,
  district: String,
  taluka: String,
  village: String,
  land_size: Number,
  caste: String,
  income: Number,
  category: String,
  crops: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IFarmer>('Farmer', FarmerSchema);
