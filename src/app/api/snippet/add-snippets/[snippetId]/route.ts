import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Snippet } from "@/models/snippets";
import mongoose from "mongoose";
import { trackAchievementProgress } from "@/utils/achievementTracker";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ snippetId: string }> }
) {
  try {
    await connectDB();

    // Await the params
    const { snippetId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(snippetId)) {
      return NextResponse.json(
        { success: false, message: "Invalid snippet ID format" },
        { status: 400 }
      );
    }

    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const snippet = await Snippet.findOne({
      _id: snippetId,
      userId: user._id
    }).lean();

    if (!snippet) {
      return NextResponse.json(
        { success: false, message: "Snippet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, snippet });
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch snippet" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ snippetId: string }> }
) {
  try {
    // Await both operations concurrently
    const [{ snippetId }, user] = await Promise.all([
      context.params,
      getUserFromToken(req)
    ]);

    await connectDB();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const updateData = await req.json();
    
    const snippet = await Snippet.findOneAndUpdate(
      {
        _id: snippetId,
        userId: user._id
      },
      updateData,
      { new: true }
    );

    if (!snippet) {
      return NextResponse.json(
        { success: false, message: "Snippet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, snippet });
  } catch (error) {
    console.error("Error updating snippet:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update snippet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ snippetId: string }> }
) {
  try {
    await connectDB();

    // Await the params
    const { snippetId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(snippetId)) {
      return NextResponse.json(
        { success: false, message: "Invalid snippet ID format" },
        { status: 400 }
      );
    }

    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const deletedSnippet = await Snippet.findOneAndDelete({
      _id: snippetId,
      userId: user._id
    });

    if (!deletedSnippet) {
      return NextResponse.json(
        { success: false, message: "Snippet not found" },
        { status: 404 }
      );
    }

    // After successful deletion, update achievements
    const totalSnippets = await Snippet.countDocuments({ userId: user._id });
    
    await Promise.all([
      trackAchievementProgress(user._id.toString(), 'CODE_MASTER', totalSnippets),
      trackAchievementProgress(user._id.toString(), 'code-master', totalSnippets),
      trackAchievementProgress(user._id.toString(), 'SNIPPETS_CREATED', totalSnippets),
      trackAchievementProgress(user._id.toString(), 'snippets-created', totalSnippets)
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting snippet" },
      { status: 500 }
    );
  }
}
