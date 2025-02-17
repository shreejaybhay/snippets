import mongoose, { Schema, Document } from "mongoose";

export interface ISnippet extends Document {
  title: string;
  description?: string;
  code: string;
  language: string;
  userId: {
    _id: mongoose.Types.ObjectId;
    username: string;
    profileURL: string;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SnippetSchema = new Schema<ISnippet>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    code: { type: String, required: true },
    language: { type: String, required: true, trim: true },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Add index for better query performance
SnippetSchema.index({ userId: 1 });

export const Snippet = mongoose.models.Snippet || mongoose.model<ISnippet>("Snippet", SnippetSchema);
