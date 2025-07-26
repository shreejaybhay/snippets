import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { trackAchievementProgress } from "@/utils/achievementTracker";
import { User } from "@/models/User";

connectDB();

// Remove unused request parameter by using underscore
export async function GET(_: NextRequest): Promise<NextResponse> {
  try {
    const users = await User.find().select("-password");
    return NextResponse.json({ users, success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Couldn't find users", success: false },
      { status: 500 }
    );
  }
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  profileURL?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const {
      username,
      email,
      password,
      profileURL,
    }: RegisterRequest = await request.json();

    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters long",
          success: false,
        },
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(
      password,
      parseInt(process.env.BCRYPT_SALT || "10")
    );
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profileURL,
      joinDate: new Date() // Make sure this field exists in your User model
    });

    const createdUser = await user.save();

    // Track the registration achievement
    await trackAchievementProgress(
      createdUser._id.toString(),
      'joinDate',
      1 // For boolean achievements, 1 indicates completion
    );

    return NextResponse.json(
      { message: "Registration successful", user: createdUser, success: true },
      { status: 201 }
    );
  } catch (error) {
    // Replace any with proper error handling
    if (error instanceof Error) {
      if ('code' in error && error.code === 11000) {
        return NextResponse.json(
          { message: "This email is already registered", success: false },
          { status: 400 }
        );
      }
      console.error(error);
    }
    return NextResponse.json(
      { message: "Couldn't create user", success: false },
      { status: 500 }
    );
  }
}
