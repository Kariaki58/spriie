import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEscrow extends Document {
  orderId: Types.ObjectId;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  amount: number;
  status: "pending" | "held" | "released" | "refunded" | "disputed";
  releaseConditions: {
    buyerConfirmation?: boolean;
    deliveryConfirmation?: boolean;
    timeBasedRelease?: Date;
  };
  confirmationToken?: string;
  confirmationTokenExpires?: Date;
  transactions: {
    paymentTransaction: Types.ObjectId;
    releaseTransaction?: Types.ObjectId;
    refundTransaction?: Types.ObjectId;
  };
  dispute?: {
    raisedBy: Types.ObjectId;
    reason: string;
    status: "open" | "resolved";
    resolution?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EscrowSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },
    buyerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    sellerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["pending", "held", "released", "refunded", "disputed"],
      default: "pending",
      required: true
    },
    releaseConditions: {
      buyerConfirmation: { type: Boolean, default: false },
      deliveryConfirmation: { type: Boolean, default: false },
      timeBasedRelease: { type: Date }
    },
    confirmationToken: {
      type: String,
    },
    confirmationTokenExpires: {
      type: Date
    },
    dispute: {
      raisedBy: { type: mongoose.Types.ObjectId, ref: "User" },
      reason: { type: String },
      status: { 
        type: String, 
        enum: ["open", "resolved"] 
      },
      resolution: { type: String }
    }
  },
  {
    timestamps: true
  }
);

// Automatically set confirmationTokenExpires to 48 hours after token creation
EscrowSchema.pre("save", function (next) {
  if (this.isModified("confirmationToken") && this.confirmationToken) {
    this.confirmationTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);
  }
  next();
});

const Escrow = mongoose.models.Escrow || mongoose.model<IEscrow>("Escrow", EscrowSchema);

export default Escrow;
