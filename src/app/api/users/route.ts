import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Snippet } from "@/models/snippets"; // Updated import to match your file structure
import { getUserFromToken } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get current user from token
    const currentUser = await getUserFromToken(request);

    // Fetch all users except the current user
    const users = await User.find(
      currentUser ? { _id: { $ne: currentUser._id } } : {}
    ).select('username profileURL bio createdAt followersCount followingCount');

    // Get public snippet counts for all users
    const snippetCounts = await Snippet.aggregate([
      {
        $match: {
          isPublic: true // Only count public snippets
        }
      },
      {
        $group: {
          _id: '$userId',
          snippetsCount: { $sum: 1 }
        }
      }
    ]);

    // Create a map of userId to snippet count
    const snippetCountMap = new Map(
      snippetCounts.map(item => [item._id.toString(), item.snippetsCount])
    );

    // Add snippet counts and following status to user objects
    const usersWithDetails = users.map(user => ({
      ...user.toObject(),
      snippetsCount: snippetCountMap.get(user._id.toString()) || 0,
      isFollowing: currentUser 
        ? currentUser.following?.includes(user._id)
        : false
    }));

    return NextResponse.json({
      success: true,
      users: usersWithDetails
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
