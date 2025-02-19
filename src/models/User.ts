import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileURL: {
      type: String,
      default: "", // Default empty string for no profile image
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Snippet" }], // Favorite snippets
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
