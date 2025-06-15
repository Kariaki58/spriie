import mongoose, { Document } from "mongoose";


export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    paystack: string;
    flutterwave: string;
    paypal: string;
    stripe: string;
}

const PaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    paystack: {
        type: String,
    },
    flutterwave: {
        type: String,
    },
    paypal: {
        type: String,
    },
    stripe: {
        type: String,
    }
}, {
    timestamps: true
});


const Payment = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;