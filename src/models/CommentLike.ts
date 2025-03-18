import mongoose from "mongoose";

export interface ICommentLike {
  userId: mongoose.Types.ObjectId;
  commentId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const commentLikeSchema = new mongoose.Schema<ICommentLike>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CommentLike = mongoose.models.CommentLike || mongoose.model<ICommentLike>('CommentLike', commentLikeSchema);
