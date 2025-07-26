import mongoose from "mongoose";

export interface ISnippet extends mongoose.Document {
  title: string;
  description?: string;
  code: string;
  language: string;
  userId: mongoose.Types.ObjectId;
  forkedFrom: mongoose.Types.ObjectId | null;
  tags: string[];
  isPublic: boolean;
  views: number;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  comments: mongoose.Types.ObjectId[];
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  folderId: mongoose.Types.ObjectId | null;
}

const SnippetSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  code: { type: String, required: true },
  language: { type: String, required: true, trim: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  forkedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Snippet",
    default: null
  },
  tags: [{ type: String, trim: true }],
  isPublic: { type: Boolean, default: false },
  views: {
    type: Number,
    default: 0,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
  likesCount: {
    type: Number,
    default: 0,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  isPinned: { type: Boolean, default: false },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
    default: null
  }
}, {
  timestamps: true,
});

// Add indexes
SnippetSchema.index({ userId: 1, isPublic: 1 });
SnippetSchema.index({ likes: 1 });
SnippetSchema.index({ userId: 1, folderId: 1 });

export const Snippet = mongoose.models.Snippet || mongoose.model("Snippet", SnippetSchema);
