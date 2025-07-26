import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/utils/auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Verify authentication
    const authUser = await getUserFromToken(request);
    if (!authUser || (typeof authUser === "object" && "status" in authUser)) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    // Get users with selected fields including bannerURL
    const users = await User.find()
      .select("username email profileURL bannerURL createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      users,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users", success: false },
      { status: 500 }
    );
  }
}
