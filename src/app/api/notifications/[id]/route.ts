import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Notification } from "@/models/notification";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Wait for params to be available
    const { id } = await Promise.resolve(context.params);
    const notificationId = id;
    
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    // Update the notification as read
    notification.read = true;
    await notification.save();

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { success: false, message: "Error updating notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromToken(request);
    
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notificationId = params.id;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    // Verify the notification belongs to the user
    if (notification.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the notification
    await notification.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting notification" },
      { status: 500 }
    );
  }
}




