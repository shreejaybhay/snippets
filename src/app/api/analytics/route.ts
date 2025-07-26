import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Snippet } from "@/models/snippets";
import { getUserFromToken } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const user = await getUserFromToken(request);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's PUBLIC snippets with analytics data
    const analytics = await Snippet.aggregate([
      { 
        $match: { 
          userId: user._id,
          isPublic: true 
        } 
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "snippetId",
          as: "comments"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.userId",
          foreignField: "_id",
          as: "commentUsers"
        }
      },
      {
        $addFields: {
          comments: {
            $map: {
              input: "$comments",
              as: "comment",
              in: {
                _id: "$$comment._id",
                content: "$$comment.content",
                createdAt: "$$comment.createdAt",
                userId: {
                  $let: {
                    vars: {
                      user: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$commentUsers",
                              cond: { $eq: ["$$this._id", "$$comment.userId"] }
                            }
                          },
                          0
                        ]
                      }
                    },
                    in: {
                      username: "$$user.username",
                      profileURL: "$$user.profileURL"
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          views: { $ifNull: ["$views", 0] },
          likesCount: { $size: { $ifNull: ["$likes", []] } },
          commentsCount: { $size: "$comments" },
          shareCount: { $ifNull: ["$shareCount", 0] },
          createdAt: 1,
          comments: 1
        }
      },
      { $sort: { views: -1 } }
    ]);

    // Calculate total stats for PUBLIC snippets only
    const stats = {
      totalViews: analytics.reduce((sum, snippet) => sum + snippet.views, 0),
      totalLikes: analytics.reduce((sum, snippet) => sum + snippet.likesCount, 0),
      totalComments: analytics.reduce((sum, snippet) => sum + (snippet.comments?.length || 0), 0),
      totalSnippets: analytics.length
    };

    return NextResponse.json({
      success: true,
      analytics,
      stats
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
