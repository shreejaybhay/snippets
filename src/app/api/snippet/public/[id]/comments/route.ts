import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Comment } from "@/models/comments";
import { Snippet } from "@/models/snippets";
import { CommentLike } from "@/models/CommentLike";
import { trackAchievementProgress } from "@/utils/achievementTracker";
import { createNotification } from "@/utils/notifications";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromToken(request);
    const params = await Promise.resolve(context.params);
    const snippetId = params.id;

    // Fetch comments with populated user data
    const comments = await Comment.find({ snippetId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profileURL');

    // Get the likes for each comment if user is authenticated
    const commentsWithLikes = await Promise.all(comments.map(async (comment) => {
      const likes = await CommentLike.find({ commentId: comment._id }).select('userId');
      const isLikedByMe = user && !('status' in user) && 
        likes.some((like: { userId: mongoose.Types.ObjectId }) => 
          like.userId.toString() === user._id.toString()
        );

      return {
        ...comment.toObject(),
        likes: likes.map((like: { userId: mongoose.Types.ObjectId }) => 
          like.userId.toString()
        ),
        isLikedByMe
      };
    }));

    return NextResponse.json({
      success: true,
      comments: commentsWithLikes
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching comments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();
    const params = await Promise.resolve(context.params);
    const snippetId = params.id;
    const { content } = await request.json();
    
    const user = await getUserFromToken(request);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const snippet = await Snippet.findById(snippetId);
    if (!snippet) {
      return NextResponse.json(
        { success: false, message: "Snippet not found" },
        { status: 404 }
      );
    }

    // Create the comment
    const comment = await Comment.create([{
      content,
      snippetId,
      userId: user._id,
      likes: []
    }], { session });

    // Update snippet's comment count
    await Snippet.findByIdAndUpdate(
      snippetId,
      { $inc: { commentsCount: 1 } },
      { session }
    );

    // Create notification for snippet owner (if commenter is not the owner)
    if (snippet.userId.toString() !== user._id.toString()) {
      try {
        await createNotification({
          type: 'comment',
          recipientId: snippet.userId.toString(),
          actorId: user._id.toString(),
          targetId: snippet._id.toString(),
          metadata: {
            snippetId: snippet._id.toString(),
            snippetTitle: snippet.title || 'Untitled Snippet',
            commentContent: content.substring(0, 150)
          }
        });
      } catch (notificationError) {
        // Log error but don't fail the comment creation
        console.warn('Failed to create comment notification:', notificationError);
      }
    }

    await session.commitTransaction();

    // Get the populated comment
    const populatedComment = await Comment.findById(comment[0]._id)
      .populate('userId', 'username profileURL');

    // Track achievement
    try {
      const commentCount = await Comment.countDocuments({ userId: user._id });
      await trackAchievementProgress(user._id, 'comments', commentCount);
    } catch (achievementError) {
      console.warn('Failed to track achievement progress:', achievementError);
    }

    return NextResponse.json({
      success: true,
      comment: {
        ...populatedComment.toObject(),
        likes: [],
        isLikedByMe: false
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { success: false, message: "Error creating comment" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
