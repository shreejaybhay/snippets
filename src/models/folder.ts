import mongoose, { Schema, Document } from "mongoose";

export interface IFolder extends Document {
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  color: string;
  snippetCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    color: { 
      type: String, 
      default: "#4F46E5" // Default indigo color
    },
    snippetCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Add index for faster queries
FolderSchema.index({ userId: 1 });

export const Folder = mongoose.models.Folder || mongoose.model<IFolder>("Folder", FolderSchema);