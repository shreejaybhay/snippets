import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function GET(request: NextRequest): Promise<NextResponse> {
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const {
      username,
      email,
      password,
      profileURL,
    }: {
      username: string;
      email: string;
      password: string;
      profileURL?: string;
    } = await request.json();

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
    });

    const createdUser = await user.save();
    return NextResponse.json(
      { message: "Registration successful", user: createdUser, success: true },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return NextResponse.json(
        { message: "This email is already registered", success: false },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: "Couldn't create user", success: false },
      { status: 500 }
    );
  }
}
