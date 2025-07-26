import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileURL: { type: String },
  bannerURL: { type: String },
  firebaseUid: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Snippet' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpiry: {
    type: Date,
    required: false,
  },
  // Removed twitterAccessToken and twitterAccessSecret fields
});

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Initialize arrays if they don't exist
userSchema.pre('save', function(next) {
  if (!this.following) this.following = [];
  if (!this.followers) this.followers = [];
  if (!this.favorites) this.favorites = [];
  next();
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
