import mongoose, { Document } from "mongoose";


export interface Tags extends Document {
    name: string;
}


const TagsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


const Tags = mongoose.models.Tags || mongoose.model<Tags>("Tags", TagsSchema);
export default Tags;
