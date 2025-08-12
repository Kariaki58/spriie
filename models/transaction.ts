import mongoose, { Document } from "mongoose";

export interface ITransaction extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  type: "fund" | "withdraw" | "buy" | "sale" | "refund";
  amount: number;
  status: "pending" | "paid" | "failed";
  paymentMethod: "wallet" | "paystack";
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
    type: {
      type: String,
      enum: ["fund", "withdraw", "buy", "sale", "refund"]
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
    }
  },
  {
    timestamps: true
  }
);

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;