import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { Snippet } from "@/models/snippets";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Get the auth token from cookies first
    const cookieToken = request.cookies.get("authToken")?.value;
    
    // Then try to get from Authorization header as fallback
    const authHeader = request.headers.get("Authorization") || 
                      request.headers.get("authorization");
    const headerToken = authHeader?.startsWith("Bearer ") 
      ? authHeader.split(" ")[1] 
      : null;

    // Use cookie token first, fall back to header token
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized", success: false }, 
        { status: 401 }
      );
    }

    // Verify the JWT token
    const data = jwt.verify(token, process.env.JWT_KEY as string) as {
      _id: string;
    };

    // Fetch the user without the password field
    const user = await User.findById(data._id).select("-password");
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false }, 
        { status: 404 }
      );
    }

    // Fetch user's snippets
    const snippets = await Snippet.find({ userId: user._id }).select(
      "-__v -updatedAt"
    );

    return NextResponse.json({
      success: true,
      user,
      snippets,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { message: "Invalid token or session expired", success: false },
      { status: 401 }
    );
  }
}
