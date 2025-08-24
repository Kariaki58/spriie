import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICartItemVariant {
  attribute: string;
  value: string;
}

export interface ICartItem {
  productId: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  reviewed?: boolean;
  variants?: ICartItemVariant[];
}

export interface IProblemReport {
  reportedAt: Date;
  description: string;
  status: "pending_review" | "resolved" | "rejected";
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  resolutionNotes?: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  storeId: Types.ObjectId;
  cartItems: ICartItem[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | "problem_reported";
  shippingAddress: Record<string, any>;
  paymentMethod: string;
  cancellationReason?: string;
  escrow?: Types.ObjectId;
  problemReports?: IProblemReport[];
  createdAt: Date;
  updatedAt: Date;
}

const ProblemReportSchema = new Schema({
  reportedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending_review", "resolved", "rejected"],
    default: "pending_review"
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  resolutionNotes: {
    type: String
  }
}, { _id: false });


const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    storeId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    cancellationReason: {
      type: String,
    },
    cartItems: {
      type: [
        {
          productId: { type: mongoose.Types.ObjectId, required: true, ref: "Product" },
          storeId: { type: mongoose.Types.ObjectId, required: true, ref: "Store" },
          name: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
          price: { type: Number, required: true, min: 0 },
          reviewed: { type: Boolean, default: false },
          variants: [{
            attribute: { type: String },
            value: { type: String }
          }],
        },
      ],
      required: true,
    },
    escrow: {
      type: mongoose.Types.ObjectId,
      ref: "Escrow"
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "shipped", "delivered", "problem_reported", "cancelled", "returned"],
      default: "pending",
    },
    shippingAddress: {
      type: Schema.Types.Mixed,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["wallet", "bank_transfer", "cash_on_delivery", "paystack"],
    },
    problemReports: {
      type: [ProblemReportSchema],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;