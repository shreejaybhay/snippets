import { connectDB } from "@/lib/db";
import { Snippet } from "@/models/snippets";
import { NextRequest, NextResponse } from "next/server";
import { trackAchievementProgress } from "@/utils/achievementTracker";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Snippet ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate if the snippet exists first
    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return NextResponse.json(
        { success: false, message: "Snippet not found" },
        { status: 404 }
      );
    }

    // Increment views count
    const updatedSnippet = await Snippet.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (updatedSnippet) {
      // Get total views across all user's snippets
      const totalViews = await Snippet.aggregate([
        { $match: { userId: updatedSnippet.userId } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
      ]);

      const totalViewCount = totalViews[0]?.totalViews || 0;

      // Track achievement progress for both individual and total views
      await Promise.all([
        trackAchievementProgress(
          updatedSnippet.userId.toString(),
          'viewsReceived',
          totalViewCount
        ),
        trackAchievementProgress(
          updatedSnippet.userId.toString(),
          'viral-sensation',
          totalViewCount
        ),
        trackAchievementProgress(
          updatedSnippet.userId.toString(),
          'getting-noticed',
          totalViewCount
        )
      ]);
    }

    return NextResponse.json({
      success: true,
      views: updatedSnippet?.views || 0,
      message: "View count updated successfully"
    });
  } catch (error) {
    console.error("Error updating view count:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update view count" },
      { status: 500 }
    );
  }
}
