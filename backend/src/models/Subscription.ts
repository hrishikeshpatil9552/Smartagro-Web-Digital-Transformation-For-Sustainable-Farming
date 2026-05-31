import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  farmer?: mongoose.Types.ObjectId | null;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt?: Date;
  lastSeenAt?: Date;
  active?: boolean;
}

const SubscriptionSchema = new Schema({
  farmer: { type: Schema.Types.ObjectId, ref: "Farmer", default: null },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: String,
    auth: String,
  },
  createdAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

export default mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
