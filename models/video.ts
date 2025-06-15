import mongoose, { Document } from "mongoose";


export interface IVideo extends Document {
    url: string[];
    price: number;
    description: string;
    tags: string[];
}


const VideoSchema = new mongoose.Schema({
    url: {
        type: [String],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    }
}, {
    timestamps: true,
})


const Video = mongoose.models.Video || mongoose.model<IVideo>("Video", VideoSchema);

export default Video;
