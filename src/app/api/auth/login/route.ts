import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { email, password }: LoginRequest = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", success: false },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid credentials", success: false },
        { status: 401 }
      );
    }

    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
      console.error("Error: JWT_KEY is not defined in environment variables.");
      return NextResponse.json(
        { message: "Server error, try again later", success: false },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id.toString(), email: user.email },
      jwtKey,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      user: { _id: user._id, email: user.email, profileURL: user.profileURL },
      token, // Keep this for debugging
    });

    // Set the cookie with proper security settings
    response.headers.set(
      "Set-Cookie",
      `authToken=${token}; HttpOnly; Secure=${
        process.env.NODE_ENV === "production"
      }; SameSite=Strict; Max-Age=86400; Path=/`
    );

    return response;
  } catch (error) {
    // Type the error properly
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Login error:", errorMessage);
    
    return NextResponse.json(
      { message: "Something went wrong", success: false },
      { status: 500 }
    );
  }
}
