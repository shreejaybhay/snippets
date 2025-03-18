import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { connectDB } from "@/lib/db";
import { Snippet } from "@/models/snippets";
import mongoose from "mongoose";

interface RouteParams {
  params: { userId: string };
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    await connectDB();
    const { userId } = await Promise.resolve(context.params);

    // Validate if the userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Find user by ID and exclude sensitive information
    const user = await User.findById(userId).select(
      "_id username profileURL bio createdAt"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get user stats
    const snippetsCount = await Snippet.countDocuments({ author: userId });
    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;

    // Check if the current user is following this profile
    let isFollowing = false;
    const authHeader = request.headers.get('cookie');
    if (authHeader) {
      // If you have a way to get the current user from the session/token
      // implement the following logic:
      // const currentUser = await getCurrentUser(request);
      // if (currentUser) {
      //   isFollowing = user.followers.includes(currentUser._id);
      // }
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        profileURL: user.profileURL || "",
        bio: user.bio || "",
        createdAt: user.createdAt,
        isFollowing,
        snippetsCount,
        followersCount,
        followingCount,
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
