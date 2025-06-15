import mongoose, { Document } from "mongoose";


export interface IContainer extends Document {
    type: "text" | "image" | "video",
    content: string,
    style: Object
}


const ContainerSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["text", "image", "video"]
    },
    content: {
        type: String,
        required: true
    },
    style: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
});


const Container = mongoose.models.Container || mongoose.model<IContainer>("Container", ContainerSchema);
export default Container;
