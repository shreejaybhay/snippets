import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Comment } from "@/models/comments";
import { Snippet } from "@/models/snippets";
import mongoose from "mongoose";

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string; commentId: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromToken(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, commentId } = await Promise.resolve(context.params);

    // Find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user is authorized to delete (comment owner)
    if (comment.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Not authorized to delete this comment" },
        { status: 403 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the comment
      await Comment.findByIdAndDelete(commentId, { session });

      // Decrease the snippet's comment count
      await Snippet.findByIdAndUpdate(
        id,
        { $inc: { commentsCount: -1 } },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting comment" },
      { status: 500 }
    );
  }
}