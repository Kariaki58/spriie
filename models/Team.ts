import mongoose, { Document } from "mongoose";

export interface ITeamMember extends Document {
  storeId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  email: string;
  name: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar?: string;
  status: "active" | "pending";
  invitedBy: mongoose.Types.ObjectId;
  verificationToken?: string;
  tokenExpires?: Date;
  permissions?: {
    viewStore: boolean;
    manageProducts: boolean;
    manageOrders: boolean;
    manageTeam: boolean;
    manageBilling: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "editor", "viewer"],
      required: true,
      default: "editor",
    },
    avatar: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "pending"],
      required: true,
      default: "pending",
    },
    invitedBy: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    verificationToken: {
      type: String,
    },
    tokenExpires: {
      type: Date,
    },
    permissions: {
      viewStore: { type: Boolean, default: true },
      manageProducts: { type: Boolean, default: false },
      manageOrders: { type: Boolean, default: false },
      manageTeam: { type: Boolean, default: false },
      manageBilling: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

TeamSchema.pre<ITeamMember>("save", function (next) {
  // Set permissions based on role
  switch (this.role) {
    case "owner":
      this.permissions = {
        viewStore: true,
        manageProducts: true,
        manageOrders: true,
        manageTeam: true,
        manageBilling: true,
      };
      break;
    case "admin":
      this.permissions = {
        viewStore: true,
        manageProducts: true,
        manageOrders: true,
        manageTeam: true,
        manageBilling: false,
      };
      break;
    case "editor":
      this.permissions = {
        viewStore: true,
        manageProducts: true,
        manageOrders: false,
        manageTeam: false,
        manageBilling: false,
      };
      break;
    case "viewer":
      this.permissions = {
        viewStore: true,
        manageProducts: false,
        manageOrders: false,
        manageTeam: false,
        manageBilling: false,
      };
      break;
  }
  next();
});

export default mongoose.models?.Team || mongoose.model<ITeamMember>("Team", TeamSchema);