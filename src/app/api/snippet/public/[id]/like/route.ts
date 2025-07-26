import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Snippet } from "@/models/snippets";
import { getUserFromToken } from "@/utils/auth";
import { createNotification } from "@/utils/notifications";
import { broadcast } from "@/app/api/notifications/sse/route";
import mongoose from "mongoose";
import { Notification } from "@/models/notification";

// GET handler to fetch like status
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id: snippetId } = await Promise.resolve(context.params);

    const user = await getUserFromToken(req);
    const snippet = await Snippet.findById(snippetId);

    if (!snippet) {
      return NextResponse.json(
        { message: "Snippet not found", success: false },
        { status: 404 }
      );
    }

    // If user is not logged in, just return the total likes count
    if (!user || typeof user === "object" && "status" in user) {
      return NextResponse.json({
        success: true,
        liked: false,
        likesCount: snippet.likes?.length || 0
      });
    }

    // Check if the user has liked the snippet
    const isLiked = snippet.likes?.includes(user._id.toString());

    return NextResponse.json({
      success: true,
      liked: !!isLiked,
      likesCount: snippet.likes?.length || 0
    });

  } catch (error) {
    console.error("Error fetching like status:", error);
    return NextResponse.json(
      { message: "Error fetching like status", success: false },
      { status: 500 }
    );
  }
}

// POST handler for liking/unliking
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();
    const { id: snippetId } = await Promise.resolve(context.params);

    const user = await getUserFromToken(req);
    if (!user || typeof user === "object" && "status" in user) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const snippet = await Snippet.findById(snippetId);
    if (!snippet) {
      return NextResponse.json(
        { message: "Snippet not found", success: false },
        { status: 404 }
      );
    }

    // Initialize likes array if it doesn't exist
    if (!snippet.likes) {
      snippet.likes = [];
    }

    const userId = user._id.toString();
    const userLikeIndex = snippet.likes.indexOf(userId);
    
    // Toggle like status
    if (userLikeIndex === -1) {
      // Add like
      snippet.likes.push(userId);
      
      // Create notification only if user is not liking their own snippet
      if (snippet.userId.toString() !== userId) {
        // Create notification
        const notification = await Notification.create({
          userId: snippet.userId,
          type: 'like',
          actorId: user._id,
          targetId: snippetId,
          message: `${user.username} liked your snippet`,
          read: false,
          metadata: {
            snippetId: snippetId,
            snippetTitle: snippet.title || 'Untitled Snippet'
          }
        });

        // Populate the notification with actor details immediately
        const populatedNotification = await Notification.findById(notification._id)
          .populate('actorId', 'username profileURL')
          .lean();

        // Broadcast the notification immediately
        if (populatedNotification) {
          broadcast({
            type: 'notification',
            data: {
              ...populatedNotification,
              actor: {
                _id: user._id.toString(),
                username: user.username,
                profileURL: user.profileURL || null
              },
              createdAt: new Date().toISOString()
            }
          }, snippet.userId.toString());
        }
      }
    } else {
      // Remove like
      snippet.likes.splice(userLikeIndex, 1);
    }

    await snippet.save();
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      liked: userLikeIndex === -1, // true if we just added the like
      likesCount: snippet.likes.length
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error processing like:", error);
    return NextResponse.json(
      { message: "Error processing like", success: false },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}
