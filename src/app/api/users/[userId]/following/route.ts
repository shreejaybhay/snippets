import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/utils/auth";

interface UserWithFollowing {
  _id: string;
  following?: Array<{
    _id: string;
    username: string;
    profileURL?: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    await connectDB();
    const currentUser = await getUserFromToken(request);
    const params = await Promise.resolve(context.params);
    const userId = params.userId;

    const user = await User.findById(userId)
      .populate('following', '_id username profileURL')
      .lean() as UserWithFollowing;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.following) {
      return NextResponse.json({
        success: true,
        following: []
      });
    }

    // Map following and include isFollowing status for current user
    const followingWithStatus = await Promise.all(
      user.following.map(async (followedUser: any) => {
        const isFollowing = currentUser ? 
          currentUser.following?.includes(followedUser._id) : 
          false;

        return {
          _id: followedUser._id,
          username: followedUser.username,
          profileURL: followedUser.profileURL,
          isFollowing
        };
      })
    );

    return NextResponse.json({
      success: true,
      following: followingWithStatus
    });

  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch following" },
      { status: 500 }
    );
  }
}
