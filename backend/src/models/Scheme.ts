import mongoose, { Document, Schema } from 'mongoose';

export interface IRule { field: string; op: string; value: any; }
export interface IEligibility {
  rules?: IRule[];
  logic?: 'AND' | 'OR';
  last_date?: string | null;
}

export interface IScheme extends Document {
  scheme_code: string;
  title: string;
  description?: string;
  eligibility_json?: IEligibility;
  documents_required: string[];
  benefit_details?: Record<string, any>;
  states: string[];
  source_url?: string;
  last_updated?: Date;
  verified?: boolean;
  generated_by?: string; // "gemini" etc
}

const SchemeSchema = new Schema({
  scheme_code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  eligibility_json: { type: Schema.Types.Mixed, default: {} },
  documents_required: { type: [String], default: [] },
  benefit_details: { type: Schema.Types.Mixed, default: {} },
  states: { type: [String], default: [] },
  source_url: String,
  last_updated: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
  generated_by: String
});

export default mongoose.model<IScheme>('Scheme', SchemeSchema);
