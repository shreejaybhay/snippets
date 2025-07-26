import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Follow } from "@/models/Follow";
import { User } from "@/models/User";
import { getUserFromToken } from "@/utils/auth";
import mongoose from "mongoose";

interface UserWithFollowers {
  _id: string;
  followers?: Array<{
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

    // First try to get followers from User model
    const user = await User.findById(userId)
      .populate('followers', '_id username profileURL')
      .lean() as UserWithFollowers;

    if (user && user.followers && user.followers.length > 0) {
      // Map followers and include isFollowing status
      const followersWithStatus = await Promise.all(
        user.followers.map(async (follower: any) => {
          const isFollowing = currentUser ? 
            currentUser.following?.includes(follower._id) : 
            false;

          return {
            _id: follower._id,
            username: follower.username,
            profileURL: follower.profileURL,
            isFollowing
          };
        })
      );

      return NextResponse.json({
        success: true,
        followers: followersWithStatus
      });
    }

    // Fallback to Follow model if no followers found in User model
    const followRelations = await Follow.find({
      followingId: userId,
      status: 'accepted'
    })
    .populate('followerId', '_id username profileURL')
    .lean();

    const followersWithStatus = await Promise.all(
      followRelations.map(async (follow: any) => {
        const isFollowing = currentUser ? 
          await Follow.exists({
            followerId: currentUser._id,
            followingId: follow.followerId._id,
            status: 'accepted'
          }) : 
          false;

        return {
          _id: follow.followerId._id,
          username: follow.followerId.username,
          profileURL: follow.followerId.profileURL,
          isFollowing: !!isFollowing
        };
      })
    );

    return NextResponse.json({
      success: true,
      followers: followersWithStatus
    });

  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch followers" },
      { status: 500 }
    );
  }
}
