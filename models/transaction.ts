import mongoose, { Document } from "mongoose";

export interface ITransaction extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  type: "fund" | "withdraw" | "buy" | "sale" | "refund";
  amount: number;
  status: "pending" | "paid" | "failed";
  paymentMethod: "wallet" | "paystack";
  escrowRelated?: boolean;
  escrowId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    toUserId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    platformFee: {
      type: Number
    },
    type: {
      type: String,
      enum: ["fund", "withdraw", "pending", "held", "released", "refunded", "disputed"]
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"]
    },
    paymentMethod: {
      type: String,
      enum: ["wallet", "paystack"]
    },
    escrowRelated: { type: Boolean, default: false },
    escrowId: { type: mongoose.Types.ObjectId, ref: "Escrow" }
  },
  {
    timestamps: true
  }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;