import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/notification";
import { getUserFromToken } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('actorId', 'username profileURL')
      .lean();

    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      targetId: notification.targetId,
      metadata: notification.metadata || {},
      actor: {
        _id: notification.actorId?._id || notification.actorId,
        username: notification.actorId?.username || 'Unknown User',
        profileURL: notification.actorId?.profileURL || null
      }
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching notifications" },
      { status: 500 }
    );
  }
}

// Create a new notification
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, type, actorId, targetId, message, metadata } = body;

    const notification = await Notification.create({
      userId,
      type,
      actorId,
      targetId,
      message,
      metadata
    });

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error("Notification creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create notification" },
      { status: 500 }
    );
  }
}
