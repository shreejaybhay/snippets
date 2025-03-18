import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { calculateStreak } from "@/utils/streakCalculator";
import { trackAchievementProgress } from "@/utils/achievementTracker";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

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

    // Calculate current streak
    const currentStreak = user.dailyStreak || 0;
    const streakIncrement = calculateStreak(user.lastLoginDate);
    const newStreak = currentStreak + streakIncrement;

    // Update user's last login date and streak
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        lastLoginDate: new Date(),
        dailyStreak: newStreak
      },
      { new: true }
    );

    // Track streak-related achievements
    if (updatedUser) {
      await Promise.all([
        trackAchievementProgress(
          updatedUser._id.toString(),
          'streak-starter',
          newStreak
        ),
        trackAchievementProgress(
          updatedUser._id.toString(),
          'weekly-warrior',
          newStreak
        )
      ]);
    }

    const token = jwt.sign(
      { _id: user._id.toString(), email: user.email },
      process.env.JWT_KEY as string,
      { 
        expiresIn: "1d",
        algorithm: 'HS256' // Explicitly specify the algorithm
      }
    );

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      user: { 
        _id: user._id, 
        email: user.email, 
        profileURL: user.profileURL,
        dailyStreak: newStreak
      },
      token
    });

    // Set the cookie with proper settings
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60 // 1 day in seconds
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Login failed", success: false },
      { status: 500 }
    );
  }
}
