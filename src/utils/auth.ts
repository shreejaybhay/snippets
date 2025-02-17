import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/User";
import { connectDB } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function getUserFromToken(request: NextRequest) {
  await connectDB();

  // First try to get token from cookie
  const cookieToken = request.cookies.get("authToken")?.value;
  
  // Then try to get from Authorization header
  const authHeader = request.headers.get("Authorization") || 
                    request.headers.get("authorization");
  
  const headerToken = authHeader?.startsWith("Bearer ") 
    ? authHeader.split(" ")[1] 
    : null;

  // Use cookie token first, fall back to header token
  const token = cookieToken || headerToken;

  if (!token) {
    console.warn("🔴 No token found in either cookie or header");
    return null;
  }

  try {
    const jwtSecret = process.env.JWT_KEY;
    if (!jwtSecret) {
      throw new Error("Missing JWT secret in environment variables");
    }

    const decoded: any = jwt.verify(token, jwtSecret);
    console.log("🔹 Decoded Token:", decoded);

    const userId = decoded._id;
    if (!userId) {
      console.warn("🔴 No user ID found in token.");
      return null;
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.warn("🔴 User not found in database.");
      return null;
    }

    return user;
  } catch (error) {
    console.error("🔴 JWT verification failed:", error);
    return null;
  }
}
