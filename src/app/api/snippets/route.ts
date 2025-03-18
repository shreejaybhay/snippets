import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import mongoose from "mongoose";
import { Snippet } from "@/models/snippets";
import { trackAchievementProgress } from "@/utils/achievementTracker";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const folderId = url.searchParams.get('folderId');

    let query: any = { userId: user._id };

    if (folderId) {
      if (!mongoose.Types.ObjectId.isValid(folderId)) {
        return NextResponse.json(
          { success: false, message: "Invalid folder ID" },
          { status: 400 }
        );
      }
      query.folderId = folderId;
    }

    const snippets = await Snippet.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Get total snippets count
    const totalSnippets = await Snippet.countDocuments({ userId: user._id });
    
    console.log('Current total snippets:', totalSnippets); // Debug log

    // Try both possible achievement IDs
    await Promise.all([
      trackAchievementProgress(user._id.toString(), 'CODE_MASTER', totalSnippets),
      trackAchievementProgress(user._id.toString(), 'code-master', totalSnippets),
      trackAchievementProgress(user._id.toString(), 'SNIPPETS_CREATED', totalSnippets),
      trackAchievementProgress(user._id.toString(), 'snippetsCreated', totalSnippets)
    ]);

    return NextResponse.json({
      success: true,
      snippets,
      totalSnippets
    });
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching snippets" },
      { status: 500 }
    );
  }
}
