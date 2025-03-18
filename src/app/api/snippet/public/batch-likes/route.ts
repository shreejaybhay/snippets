import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import { Snippet } from "@/models/snippets";
import { getUserFromToken } from "@/utils/auth";
import { createNotification } from "@/utils/notifications";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { snippetIds } = await req.json();
    
    const user = await getUserFromToken(req);
    if (!user || typeof user === "object" && "status" in user) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const snippets = await Snippet.find({
      _id: { $in: snippetIds }
    });

    const likesInfo = await Promise.all(
      snippets.map(async (snippet) => {
        const isLiked = snippet.likes.includes(user._id);
        
        // If not already liked, create notification
        if (!isLiked && snippet.userId.toString() !== user._id.toString()) {
          try {
            await createNotification({
              userId: snippet.userId,
              actorId: user._id,
              type: 'like',
              targetId: snippet._id,
              metadata: {
                snippetTitle: snippet.title || 'Untitled Snippet'
              }
            });
          } catch (error) {
            console.warn('Failed to create batch like notification:', error);
          }
        }

        return {
          snippetId: snippet._id,
          isLiked,
          likesCount: snippet.likes.length
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: likesInfo
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch likes',
    }, { status: 500 });
  }
}
