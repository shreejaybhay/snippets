import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Snippet } from "@/models/snippets";
import { getUserFromToken } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get the current user
    const user = await getUserFromToken(request);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all contributors data
    const contributors = await Snippet.aggregate([
      {
        $match: {
          isPublic: true  // Only count public snippets
        }
      },
      {
        $group: {
          _id: "$userId",
          totalSnippets: { $sum: 1 },
          totalLikes: { $sum: "$likesCount" },
          totalViews: { $sum: "$views" },
          totalComments: { $sum: "$commentsCount" },
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: "$userInfo"
      }
    ]);

    // Calculate scores and ranks
    const contributorsWithScores = contributors.map(c => ({
      ...c,
      score: calculateScore(c.totalViews, c.totalLikes, c.totalComments),
    })).sort((a, b) => b.score - a.score);

    // Add ranks
    const rankedContributors = contributorsWithScores.map((c, index) => ({
      ...c,
      rank: index + 1
    }));

    // Find current user's stats
    const currentUserStats = rankedContributors.find(c => 
      c._id.toString() === user._id.toString()
    );

    // Calculate overall stats
    const stats = {
      totalContributors: contributors.length,
      totalSnippets: contributors.reduce((sum, c) => sum + c.totalSnippets, 0),
      totalInteractions: contributors.reduce((sum, c) => 
        sum + c.totalLikes + c.totalViews + c.totalComments, 
        0
      ),
      averageScore: contributorsWithScores.reduce((sum, c) => sum + c.score, 0) / 
        contributors.length || 0
    };

    return NextResponse.json({
      success: true,
      contributors: rankedContributors,
      currentUserStats: currentUserStats ? {
        totalSnippets: currentUserStats.totalSnippets,
        totalInteractions: 
          currentUserStats.totalLikes + 
          currentUserStats.totalViews + 
          currentUserStats.totalComments,
        score: currentUserStats.score,
        rank: currentUserStats.rank
      } : null,
      stats
    });

  } catch (error) {
    console.error("Error in leaderboard API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateScore(views: number, likes: number, comments: number): number {
  // You can adjust these weights based on your scoring criteria
  const viewWeight = 1;
  const likeWeight = 2;
  const commentWeight = 3;

  return (
    views * viewWeight +
    likes * likeWeight +
    comments * commentWeight
  );
}
