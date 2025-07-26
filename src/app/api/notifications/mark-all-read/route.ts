import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/notification";
import { getUserFromToken } from "@/utils/auth";

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await Notification.updateMany(
      { userId: user._id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
