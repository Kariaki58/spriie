import mongoose, { Document } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  paymentMethod: "wallet" | "paystack";
  reference?: string;
  status: "pending" | "paid" | "failed";
  message?: string;
  transaction?: string;
  trxef?: string;
}

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User"
    },
    storeId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Store"
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["wallet", "paystack"]
    },
    reference: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (this: any) {
          return this.paymentMethod === "wallet" || !!this.reference;
        },
        message: "Reference is required for Paystack payments."
      }
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed"]
    },
    transaction: {
      type: String,
      validate: {
        validator: function (this: any) {
          return this.paymentMethod === "wallet" || !!this.transaction;
        },
        message: "Transaction ID is required for Paystack payments."
      }
    },
    trxef: {
      type: String,
      validate: {
        validator: function (this: any) {
          return this.paymentMethod === "wallet" || !!this.trxef;
        },
        message: "TRXEF is required for Paystack payments."
      }
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
