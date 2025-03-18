import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Snippet } from "@/models/snippets";
import { trackAchievementProgress } from "@/utils/achievementTracker";

export async function POST(req: NextRequest) {
  try {
    console.log("🟢 Connecting to database...");
    await connectDB();

    console.log("🟢 Authenticating user...");
    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return user;
    }

    console.log("🟢 Parsing request body...");
    const { title, description, code, language, tags } = await req.json();

    if (!title || !code || !language) {
      return NextResponse.json(
        { message: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    console.log("🟢 Formatting tags...");
    const formattedTags = Array.isArray(tags) 
      ? tags.filter((tag) => typeof tag === "string" && tag.trim() !== "").map((tag) => tag.trim()) 
      : [];

    console.log("🟢 Creating snippet...");
    const snippet = await Snippet.create({
      title,
      description,
      code,
      language,
      userId: user._id,
      tags: formattedTags,
    });

    // Get total snippets count for the user
    const totalSnippets = await Snippet.countDocuments({ userId: user._id });

    // Track achievements
    await Promise.all([
      // Track "Snippet Creator" achievement (first snippet)
      trackAchievementProgress(user._id.toString(), 'snippet-creator', 1),
      // Track "Snippet Collector" achievement (total snippets)
      trackAchievementProgress(user._id.toString(), 'snippet-collector', totalSnippets),
      // Track "Code Master" achievement (total snippets)
      trackAchievementProgress(user._id.toString(), 'code-master', totalSnippets),
      // Track general snippets created metric
      trackAchievementProgress(user._id.toString(), 'snippetsCreated', totalSnippets)
    ]);

    console.log("✅ Snippet created successfully!");
    return NextResponse.json({
      message: "Snippet created successfully",
      snippet,
      success: true,
    });
  } catch (error) {
    console.error("🔴 Error creating snippet:", error);
    return NextResponse.json(
      { message: "Error creating snippet", success: false },
      { status: 500 }
    );
  }
}
