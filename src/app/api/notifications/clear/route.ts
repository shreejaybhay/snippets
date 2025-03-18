import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/notification";
import { getUserFromToken } from "@/utils/auth";

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await Notification.deleteMany({ userId: user._id });

    return NextResponse.json({
      success: true,
      message: "All notifications cleared"
    });

  } catch (error) {
    console.error("Clear notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear notifications" },
      { status: 500 }
    );
  }
}