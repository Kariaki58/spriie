import mongoose, { Schema, Types, Model } from "mongoose";

interface AddressEntry {
  fullName: string;
  type: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IAddress {
  userId: Types.ObjectId;
  addresses: AddressEntry[];
}

const AddressEntrySchema = new Schema<AddressEntry>(
  {
    fullName: { type: String, required: true },
    type: { type: String, required: true, enum: ["home", "work", "other"] },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const AddressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    addresses: [AddressEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Validate only one default address
AddressSchema.pre("save", function (next) {
  if (this.isModified("addresses")) {
    const defaultCount = this.addresses.filter(addr => addr.isDefault).length;
    if (defaultCount > 1) {
      return next(new Error("Only one address can be marked as default"));
    }
    
    // Ensure at least one default address exists if there are addresses
    if (this.addresses.length > 0 && defaultCount === 0) {
      this.addresses[0].isDefault = true;
    }
  }
  next();
});

const AddressModel: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema);

export default AddressModel;