import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/User";
import { connectDB } from "@/lib/db";

interface JwtPayload {
  _id: string;
  [key: string]: any;
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_KEY as string
    ) as JwtPayload;
    
    await connectDB();
    const user = await User.findById(decoded._id).select("-password");
    return !!user;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

export async function getUserFromToken(request: NextRequest) {
  await connectDB();

  const cookieToken = request.cookies.get("authToken")?.value;
  const authHeader =
    request.headers.get("Authorization") ||
    request.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_KEY as string
    ) as JwtPayload;
    const user = await User.findById(decoded._id).select("-password");
    return user;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
