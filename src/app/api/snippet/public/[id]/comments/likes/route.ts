import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Comment } from "@/models/comments";
import { CommentLike } from "@/models/CommentLike";
import mongoose from "mongoose";

interface RouteContext {
  params: { id: string };
}

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();
    const user = await getUserFromToken(req);
    
    if (!user || typeof user === "object" && "status" in user) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const { commentId } = await req.json();
    if (!commentId) {
      return NextResponse.json(
        { message: "Comment ID is required", success: false },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found", success: false },
        { status: 404 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if user already liked the comment
      const existingLike = await CommentLike.findOne({
        userId: user._id,
        commentId: comment._id
      }).session(session);

      let liked: boolean;
      
      if (existingLike) {
        // Unlike
        await CommentLike.deleteOne({ _id: existingLike._id }).session(session);
        liked = false;
      } else {
        // Like
        await CommentLike.create([{
          userId: user._id,
          commentId: comment._id
        }], { session });
        liked = true;
      }

      // Get updated likes count
      const likesCount = await CommentLike.countDocuments({ 
        commentId: comment._id 
      }).session(session);

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        liked,
        likesCount
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error processing comment like:", error);
    return NextResponse.json(
      { message: "Error processing like", success: false },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await connectDB();
    const user = await getUserFromToken(req);
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { message: "Comment ID is required", success: false },
        { status: 400 }
      );
    }

    const likesCount = await CommentLike.countDocuments({ commentId });
    
    let liked = false;
    if (user && !("status" in user)) {
      const existingLike = await CommentLike.findOne({
        userId: user._id,
        commentId
      });
      liked = !!existingLike;
    }

    return NextResponse.json({
      success: true,
      liked,
      likesCount
    });
  } catch (error) {
    console.error("Error fetching comment like status:", error);
    return NextResponse.json(
      { message: "Error fetching like status", success: false },
      { status: 500 }
    );
  }
}