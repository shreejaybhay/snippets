import mongoose, { Schema, Document } from 'mongoose';

export interface IChatRoom extends Document {
  name: string;
  description?: string;
  participants: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
  };
}

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      content: String,
      senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ChatRoomSchema.index({ participants: 1 });
ChatRoomSchema.index({ createdAt: -1 });

export const ChatRoom = mongoose.models.ChatRoom || mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);