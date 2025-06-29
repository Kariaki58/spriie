import mongoose, { Document, Schema, Types } from "mongoose";
import Like from "./like";

export interface IComment extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId;
  replies: Types.ObjectId[];
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    product: { 
      type: Schema.Types.ObjectId, 
      ref: "Product",
      required: true 
    },
    content: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 1000 
    },
    parentComment: { 
      type: Schema.Types.ObjectId, 
      ref: "Comment" 
    },
    replies: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Comment" 
    }],
    likes: [{ 
      type: Schema.Types.ObjectId, 
      ref: "Like" 
    }]
  },
  { timestamps: true }
);

// Indexes
CommentSchema.index({ product: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

// Virtuals
CommentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

CommentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Cascade delete replies when a comment is deleted
CommentSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Delete all replies
    await Comment.deleteMany({ parentComment: this._id });
    // Remove comment reference from product
    await mongoose.model('Product').updateOne(
      { _id: this.product },
      { $pull: { comments: this._id } }
    );
    // Delete all associated likes
    await Like.deleteMany({ _id: { $in: this.likes } });
    next();
  } catch (err: any) {
    next(err);
  }
});

// Add comment to product when created
CommentSchema.post('save', async function(doc) {
  if (!doc.parentComment) { // Only add top-level comments to product
    await mongoose.model('Product').updateOne(
      { _id: doc.product },
      { $addToSet: { comments: doc._id } }
    );
  }
});

const Comment = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
export default Comment;