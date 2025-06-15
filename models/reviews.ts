import mongoose, { Document } from "mongoose";


export interface IReviews extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    videoId: mongoose.Types.ObjectId;
    rating: number;
    name: string;
    comment: string;
    email: string;
    reviewImage: string;
    replies: {
        userId: mongoose.Types.ObjectId;
        email: string;
        comment: string;
    }[];
}


const ReviewsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    productId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Product"
    },
    videoId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Video"
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    name: {
        type: String,
    },
    comment: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    reviewImage: {
        type: String,
    },
    replies: {
        type: [
            {
                userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
                email: { type: String, required: true },
                comment: { type: String, required: true }
            }
        ]
    }
}, {
    timestamps: true
});


const Reviews = mongoose.models.Reviews || mongoose.model<IReviews>("Reviews", ReviewsSchema);
export default Reviews;