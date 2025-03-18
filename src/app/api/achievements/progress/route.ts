import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Achievement } from "@/models/Achievement";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { achievementId, progress, current } = await request.json();

    const achievement = await Achievement.findOneAndUpdate(
      { userId: user._id, achievementId },
      {
        $set: {
          progress,
          current,
          lastUpdated: new Date(),
          ...(progress === 100 && { unlockedAt: new Date() })
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, achievement });
  } catch (error) {
    console.error("Error updating achievement progress:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update achievement progress" },
      { status: 500 }
    );
  }
}