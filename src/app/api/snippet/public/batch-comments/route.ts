import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import { Comment } from "@/models/comments";
import { CommentLike } from "@/models/CommentLike";
import { getUserFromToken } from "@/utils/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { snippetIds } = await req.json();
    const user = await getUserFromToken(req);
    
    // Fetch comments for all snippets
    const comments = await Comment.find({ 
      snippetId: { $in: snippetIds } 
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'username profileURL');

    // Get likes for comments if user is authenticated
    const commentsWithLikes = await Promise.all(comments.map(async (comment) => {
      const likes = await CommentLike.find({ commentId: comment._id }).select('userId');
      const isLikedByMe = user && !('status' in user) && 
        likes.some(like => like.userId.toString() === user._id.toString());

      return {
        ...comment.toObject(),
        likes: likes.map(like => like.userId.toString()),
        isLikedByMe
      };
    }));
    
    return NextResponse.json({
      success: true,
      data: commentsWithLikes
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch comments',
    }, { status: 500 });
  }
}
