import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  snippetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    snippetId: {
      type: Schema.Types.ObjectId,
      ref: "Snippet",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
CommentSchema.index({ snippetId: 1, createdAt: -1 });

export const Comment = mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);