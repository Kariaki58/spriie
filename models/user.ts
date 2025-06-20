import mongoose, { Document} from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    storeUrl: string;
    googleId: string;
    authMethod: string[];
    password: string;
    avatar: string;
    role: string[];
    isVerified: boolean;
    teams: mongoose.Types.ObjectId[];
    token: string;
    expires: Date;
    transaction: mongoose.Types.ObjectId[];
    paymentGateway: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    storeUrl: {
        type: String,
    },
    googleId: {
        type: String,
        unique: true
    },
    authMethod: {
        type: String,
        enum: ["email", "google"],
        required: true
    },
    password: {
        type: String,
    },
    avatar: {
        type: String,
    },
    role: {
        type: String,
        enum: ["seller", "buyer", "admin"],
        default: "buyer",
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true
    },
    teams: {
        type: [mongoose.Types.ObjectId],
        ref: "Team",
    },
    token: {
        type: String,
    },
    expires: {
        type: Date,
    },
    transaction: {
        type: [mongoose.Types.ObjectId],
        ref: "Transaction",
    },
    paymentGateway: {
        type: [mongoose.Types.ObjectId],
        ref: "PaymentGateway",
    }
}, {
    timestamps: true
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


export default User;
