import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/auth";
import { connectDB } from "@/lib/db";
import { CommentLike } from "@/models/CommentLike";
import { Comment } from "@/models/comments";

// Add this GET handler to fetch initial like state
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          }
        }
      );
    }

    await connectDB();
    const userId = user._id;
    const params_data = await params;
    const { commentId } = params_data;

    const existingLike = await CommentLike.findOne({
      userId: userId,
      commentId: commentId,
    });

    return NextResponse.json(
      {
        success: true,
        isLiked: !!existingLike,
        likesCount: await CommentLike.countDocuments({ commentId })
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=30',
        }
      }
    );
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const userId = user._id;
    const params_data = await params;
    const { id: snippetId, commentId } = params_data;

    // Check if already liked
    const existingLike = await CommentLike.findOne({
      userId: userId,
      commentId: commentId,
    });

    if (existingLike) {
      // If already liked, unlike it
      await CommentLike.deleteOne({
        userId: userId,
        commentId: commentId,
      });

      const likesCount = await CommentLike.countDocuments({ commentId });
      return NextResponse.json({
        success: true,
        liked: false,
        likesCount,
      });
    }

    // Create like
    await CommentLike.create({
      userId: userId,
      commentId: commentId,
      snippetId: snippetId,
    });

    // Get updated likes count
    const likesCount = await CommentLike.countDocuments({ commentId });

    return NextResponse.json({
      success: true,
      liked: true,
      likesCount,
    });
  } catch (error) {
    console.error("Error in comment like:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const userId = user._id;
    const params_data = await params;
    const { id: snippetId, commentId } = params_data;

    // Delete like
    const result = await CommentLike.deleteOne({
      userId: userId,
      commentId: commentId,
    });

    // Get updated likes count even if nothing was deleted
    const likesCount = await CommentLike.countDocuments({ commentId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Like not found", likesCount },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      liked: false,
      likesCount,
    });
  } catch (error) {
    console.error("Error in unlike:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
