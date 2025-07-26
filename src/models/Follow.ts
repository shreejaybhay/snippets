import mongoose, { Schema, Document } from "mongoose";

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted';
  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema({
  followerId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  followingId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted'],
    default: 'accepted'
  }
}, { timestamps: true });

// Compound index to ensure unique follows and efficient queries
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1, status: 1 });

export const Follow = mongoose.models.Follow || mongoose.model<IFollow>("Follow", FollowSchema);