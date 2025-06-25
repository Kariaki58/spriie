import mongoose, { Document, Schema, Types } from "mongoose";

export interface ILike extends Document {
  user: Types.ObjectId;
  product?: Types.ObjectId;
  comment?: Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    product: { 
      type: Schema.Types.ObjectId, 
      ref: "Product" 
    },
    comment: { 
      type: Schema.Types.ObjectId, 
      ref: "Comment" 
    }
  },
  { timestamps: true }
);

LikeSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { product: { $exists: true } } });
LikeSchema.index({ user: 1, comment: 1 }, { unique: true, partialFilterExpression: { comment: { $exists: true } } });

LikeSchema.pre('validate', function(next) {
  if (this.product && this.comment) {
    throw new Error('Like can only reference either a product or comment, not both');
  }
  if (!this.product && !this.comment) {
    throw new Error('Like must reference either a product or comment');
  }
  next();
});

const Like = mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);
export default Like;