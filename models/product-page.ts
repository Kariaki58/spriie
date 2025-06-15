import mongoose, { Document } from "mongoose";


export interface IProductPage extends Document {
    storeId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    rows: mongoose.Types.ObjectId[];
}


const ProductPageSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Store"
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rows: [mongoose.Types.ObjectId],
}, {
    timestamps: true
});


const ProductPage = mongoose.models.ProductPage || mongoose.model<IProductPage>("ProductPage", ProductPageSchema);
export default ProductPage;