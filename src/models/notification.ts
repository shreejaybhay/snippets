import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'achievement';
  actorId: mongoose.Types.ObjectId;
  targetId: string; // Changed to string type
  message: string;
  read: boolean;
  createdAt: Date;
  metadata: {
    snippetId?: string;    // Added explicit snippetId
    snippetTitle?: string;
    commentContent?: string;
    achievementId?: string;
    achievementTitle?: string;
    [key: string]: any;
  };
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['follow', 'like', 'comment', 'mention', 'achievement'],
      required: true
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

export const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
