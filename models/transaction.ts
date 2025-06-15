import mongoose, { Document } from "mongoose";


export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    refrence: string;
    status: string[];
    message: string;
    transaction: string;
    trxef: string;
}

const TransactionSchema = new mongoose.Schema({
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
    refrence: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "processing", "completed", "failed"]
    },
    transaction: {
        type: String,
        required: true
    },
    trxef: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);


export default Transaction;
