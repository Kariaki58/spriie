import mongoose, { Document } from "mongoose";

export interface IRecentViews extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    videoId: mongoose.Types.ObjectId;
}

const RecentViewsSchema = new mongoose.Schema({
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
    }
}, {
    timestamps: true
});

const RecentViews = mongoose.models.RecentViews || mongoose.model<IRecentViews>("RecentViews", RecentViewsSchema);
export default RecentViews;
