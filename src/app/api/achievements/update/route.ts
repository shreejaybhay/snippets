import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Snippet } from "@/models/snippets";
import { trackAchievementProgress } from "@/utils/achievementTracker";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    // Get current snippet count
    const snippetCount = await Snippet.countDocuments({ userId: user._id });

    // Update Code Master achievement
    await trackAchievementProgress(
      user._id.toString(),
      'code-master',
      snippetCount
    );

    return NextResponse.json({
      message: "Achievement progress updated successfully",
      success: true,
      currentSnippets: snippetCount
    });

  } catch (error) {
    console.error("Error updating achievement progress:", error);
    return NextResponse.json(
      { message: "Error updating achievement progress", success: false },
      { status: 500 }
    );
  }
}
