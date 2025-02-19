import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { Snippet } from "@/models/snippets";

export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const cookieToken = request.cookies.get("authToken")?.value;
    const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const data = jwt.verify(token, process.env.JWT_KEY as string) as { _id: string };
    const user = await User.findById(data._id).select("-password");
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    const snippets = await Snippet.find({ userId: user._id }).select("-__v -updatedAt");

    const response = NextResponse.json({
      success: true,
      user,
      snippets,
    });

    // Add cache headers
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { message: "Invalid token or session expired", success: false },
      { status: 401 }
    );
  }
}
