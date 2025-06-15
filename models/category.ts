import mongoose, { Document } from "mongoose";


export interface ICategory extends Document {
    name: string;
}


const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
