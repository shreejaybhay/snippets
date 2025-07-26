import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Notification } from "@/models/notification";
import { broadcast } from "@/app/api/notifications/sse/route";

export async function POST(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    await connectDB();
    
    // Get current user from token
    const currentUser = await getUserFromToken(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await Promise.resolve(context.params);
    const targetUserId = params.userId;
    
    if (currentUser._id.toString() === targetUserId) {
      return NextResponse.json(
        { success: false, message: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Initialize arrays if they don't exist
    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { following: targetUserId },
        $inc: { followingCount: -1 }
      });
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUser._id },
        $inc: { followersCount: -1 }
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { following: targetUserId },
        $inc: { followingCount: 1 }
      });
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUser._id },
        $inc: { followersCount: 1 }
      });

      // Create follow notification using your notification model structure
      const notification = await Notification.create({
        userId: targetUserId,
        type: 'follow',
        actorId: currentUser._id,
        targetId: targetUserId,
        message: `${currentUser.username} started following you`,
        read: false,
        metadata: {} // Empty metadata object as per your schema
      });

      // Populate the notification with actor details immediately
      const populatedNotification = await Notification.findById(notification._id)
        .populate('actorId', 'username profileURL')
        .lean();

      // Broadcast immediately with properly formatted data
      broadcast({
        type: 'notification',
        data: {
          ...populatedNotification,
          actor: {
            _id: currentUser._id.toString(),
            username: currentUser.username,
            profileURL: currentUser.profileURL || null
          },
          createdAt: new Date().toISOString() // Add timestamp
        }
      }, targetUserId);

      // Return the response
      return NextResponse.json({
        success: true,
        isFollowing: true,
        message: "Successfully followed user"
      });
    }

    return NextResponse.json({
      success: true,
      isFollowing: !isFollowing
    });

  } catch (error) {
    console.error("Follow/Unfollow error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to follow/unfollow user" },
      { status: 500 }
    );
  }
}
