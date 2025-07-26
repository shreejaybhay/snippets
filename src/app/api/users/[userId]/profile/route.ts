import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { User } from "@/models/User";
import { Snippet } from "@/models/snippets";

export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  try {
    const params = await context.params;
    await connectDB();
    const currentUser = await getUserFromToken(request);

    // Fetch user data
    const user = await User.findById(params.userId).select(
      '_id username profileURL bannerURL createdAt'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get follow status and counts
    const isFollowing = currentUser ? 
      currentUser.following?.includes(params.userId) : 
      false;
    
    const followersCount = await User.countDocuments({ following: params.userId });
    const followingCount = await User.countDocuments({ followers: params.userId });

    // Fetch public snippets
    const snippets = await Snippet.find({ 
      userId: params.userId,
      isPublic: true 
    })
    .sort({ createdAt: -1 })
    .select('_id title description language createdAt likesCount commentsCount views');

    const profile = {
      user: {
        _id: user._id,
        username: user.username,
        profileURL: user.profileURL,
        bannerURL: user.bannerURL,
        createdAt: user.createdAt,
        isFollowing,
        followersCount,
        followingCount,
        snippetsCount: snippets.length,
      },
      snippets: snippets
    };

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
