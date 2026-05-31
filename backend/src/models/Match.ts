import mongoose, { Document, Schema } from 'mongoose';

const MatchSchema = new Schema({
  farmer: { type: Schema.Types.ObjectId, ref: 'Farmer' },
  scheme: { type: Schema.Types.ObjectId, ref: 'Scheme' },
  matched_on: { type: Date, default: Date.now },
  match_score: Number,
  eligibility_explanation: String
});

export default mongoose.model('Match', MatchSchema);
