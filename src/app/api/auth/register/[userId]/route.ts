import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Snippet } from "@/models/snippets";
import bcrypt from "bcryptjs";
import { getUserFromToken } from "@/utils/auth";

async function verifyTokenAndUserId(
  request: NextRequest,
  userId: string
): Promise<NextResponse | null> {
  try {
    const authUser = await getUserFromToken(request);

    // Add debug logging
    console.log("Auth user:", authUser);

    // Check for null first
    if (!authUser) {
      return NextResponse.json(
        { message: "Authentication failed - No user found", success: false },
        { status: 401 }
      );
    }

    // Safely check if it's an error response
    if (authUser && typeof authUser === "object" && "status" in authUser) {
      return authUser as NextResponse;
    }

    // Now we know authUser is valid, check the ID match
    if (authUser._id.toString() !== userId) {
      return NextResponse.json(
        { message: "Unauthorized - User ID mismatch", success: false },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error("Error in verifyTokenAndUserId:", error);
    return NextResponse.json(
      { message: "Authentication error", success: false },
      { status: 500 }
    );
  }
}

interface Params {
  userId: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Params }
): Promise<NextResponse> {
  const params = await context.params; // Explicitly await params
  const userId = params?.userId; // Access userId safely

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required", success: false },
      { status: 400 }
    );
  }

  const authError = await verifyTokenAndUserId(request, userId);
  if (authError) return authError;

  await connectDB();
  console.log("Received userId:", userId);

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID", success: false },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select("-password");
    console.log("Fetched user from DB:", user);

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ user, success: true });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Params }
): Promise<NextResponse> {
  const params = await context.params;
  const userId = params?.userId;

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required", success: false },
      { status: 400 }
    );
  }

  const authError = await verifyTokenAndUserId(request, userId);
  if (authError) return authError;

  try {
    const { password }: { password: string } = await request.json();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Password is incorrect", success: false },
        { status: 400 }
      );
    }

    // Delete all snippets created by the user
    await Snippet.deleteMany({ userId });

    // Remove user's ID from favorites arrays of all users
    await User.updateMany(
      { favorites: userId },
      { $pull: { favorites: userId } }
    );

    // Finally delete the user
    await User.deleteOne({ _id: userId });

    return NextResponse.json({
      message: "User and all associated data deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { userId?: string } } // Mark userId as optional
): Promise<NextResponse> {
  const { userId } = await context.params; // ✅ Await context.params

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required", success: false },
      { status: 400 }
    );
  }

  // Authenticate the request
  const authError = await verifyTokenAndUserId(request, userId);
  if (authError) return authError;

  try {
    const { username, oldPassword, newPassword, profileURL } =
      await request.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // Update username & profile picture
    if (username) user.username = username;
    if (profileURL) user.profileURL = profileURL;

    // Handle password update
    if (newPassword && oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Old password is incorrect", success: false },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await user.save();
    const { password, ...userWithoutPassword } = updatedUser.toObject();

    return NextResponse.json({
      message: "User updated successfully",
      user: userWithoutPassword,
      success: true,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user", success: false },
      { status: 500 }
    );
  }
}
