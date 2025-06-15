import mongoose, { Document } from "mongoose";


export interface IContainerRow extends Document {
    container: mongoose.Types.ObjectId[];
}

const ContainerRowSchema = new mongoose.Schema({
    container: {
        type: [mongoose.Types.ObjectId],
        required: true,
        ref: "Container"
    }
}, {
    timestamps: true
});


const ContainerRow = mongoose.models.ContainerRow || mongoose.model<IContainerRow>("ContainerRow", ContainerRowSchema);
export default ContainerRow;

