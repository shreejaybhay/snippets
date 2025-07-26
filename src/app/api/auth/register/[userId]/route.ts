import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Snippet } from "@/models/snippets";
import { Comment } from "@/models/comments";
import { CommentLike } from "@/models/CommentLike";
import { Notification } from "@/models/notification";
import { Folder } from "@/models/folder";
import { Achievement } from "@/models/Achievement";
import { Follow } from "@/models/Follow";
import { ChatRoom } from "@/models/chatRoom";
import bcrypt from "bcryptjs";
import { getUserFromToken } from "@/utils/auth";
import { User } from "@/models/User";

// Define the params type
type RouteParams = {
  params: Promise<{ userId: string }>;
};

const isDev = process.env.NODE_ENV === "development";

async function verifyTokenAndUserId(
  request: NextRequest,
  userId: string
): Promise<NextResponse | null> {
  try {
    const authUser = await getUserFromToken(request);

    if (!authUser) {
      return NextResponse.json(
        { message: "Authentication failed - No user found", success: false },
        { status: 401 }
      );
    }

    if (authUser && typeof authUser === "object" && "status" in authUser) {
      return authUser as NextResponse;
    }

    if (authUser._id.toString() !== userId) {
      return NextResponse.json(
        { message: "Unauthorized - User ID mismatch", success: false },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    return NextResponse.json(
      { message: "Authentication error", success: false },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required", success: false },
      { status: 400 }
    );
  }

  const authError = await verifyTokenAndUserId(request, userId);
  if (authError) return authError;

  await connectDB();
  if (isDev) {
    console.log("Received userId:", userId);
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID", success: false },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ user, success: true });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required", success: false },
      { status: 400 }
    );
  }

  const authError = await verifyTokenAndUserId(request, userId);
  if (authError) return authError;

  try {
    const { password }: { password: string } = await request.json();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Password is incorrect", success: false },
        { status: 400 }
      );
    }

    // Start a transaction for data consistency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Delete all snippets created by the user
      await Snippet.deleteMany({ userId }, { session });

      // 2. Delete all comments made by the user
      await Comment.deleteMany({ userId }, { session });

      // 3. Delete all comment likes by the user
      await CommentLike.deleteMany({ userId }, { session });

      // 4. Remove user's likes from all snippets
      await Snippet.updateMany(
        { likes: userId },
        { $pull: { likes: userId }, $inc: { likesCount: -1 } },
        { session }
      );

      // 5. Remove user's ID from favorites arrays of all users
      await User.updateMany(
        { favorites: userId },
        { $pull: { favorites: userId } },
        { session }
      );

      // 6. Remove user from following/followers relationships
      await User.updateMany(
        { following: userId },
        { $pull: { following: userId }, $inc: { followingCount: -1 } },
        { session }
      );

      await User.updateMany(
        { followers: userId },
        { $pull: { followers: userId }, $inc: { followersCount: -1 } },
        { session }
      );

      // 7. Delete all notifications related to the user (as actor or recipient)
      await Notification.deleteMany(
        { $or: [{ userId }, { actorId: userId }] },
        { session }
      );

      // 8. Delete all folders created by the user
      await Folder.deleteMany({ userId }, { session });

      // 9. Delete all achievements for the user
      await Achievement.deleteMany({ userId }, { session });

      // 10. Delete all follow relationships involving the user
      await Follow.deleteMany(
        { $or: [{ followerId: userId }, { followingId: userId }] },
        { session }
      );

      // 11. Remove user from chat rooms and update admin lists
      await ChatRoom.updateMany(
        { participants: userId },
        { $pull: { participants: userId } },
        { session }
      );

      await ChatRoom.updateMany(
        { admins: userId },
        { $pull: { admins: userId } },
        { session }
      );

      // 12. Delete chat rooms created by the user (optional - you might want to transfer ownership instead)
      await ChatRoom.deleteMany({ createdBy: userId }, { session });

      // 13. Finally delete the user
      await User.deleteOne({ _id: userId }, { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return NextResponse.json({
      message: "User and all associated data deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required", success: false },
      { status: 400 }
    );
  }

  const authError = await verifyTokenAndUserId(request, userId);
  if (authError) return authError;

  try {
    // Update to include bannerURL
    const { username, oldPassword, newPassword, profileURL, bannerURL } =
      await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // Update username, profile picture & banner
    if (username) user.username = username;
    if (profileURL) user.profileURL = profileURL;
    if (bannerURL) user.bannerURL = bannerURL;

    // Handle password update
    if (newPassword && oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Old password is incorrect", success: false },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await user.save();
    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    return NextResponse.json({
      message: "User updated successfully",
      user: userWithoutPassword,
      success: true,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user", success: false },
      { status: 500 }
    );
  }
}
