import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Folder } from "@/models/folder";
import { Snippet } from "@/models/snippets";
import mongoose from "mongoose";

type RouteParams = {
  params: Promise<{ folderId: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { folderId } = await params;
    await connectDB();
    
    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const folder = await Folder.findOne({
      _id: folderId,
      userId: user._id
    });

    if (!folder) {
      return NextResponse.json(
        { success: false, message: "Folder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      folder
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching folder" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, description, color } = await req.json();
    const { folderId } = await params;

    const folder = await Folder.findOneAndUpdate(
      { _id: folderId, userId: user._id },
      { name, description, color },
      { new: true }
    );

    if (!folder) {
      return NextResponse.json(
        { success: false, message: "Folder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      folder,
      message: "Folder updated successfully"
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error updating folder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();
    
    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { folderId } = await params;

    const folder = await Folder.findOneAndDelete({
      _id: folderId,
      userId: user._id
    }).session(session);

    if (!folder) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Folder not found" },
        { status: 404 }
      );
    }

    // Update all snippets in this folder to have no folder
    await Snippet.updateMany(
      { folderId },
      { $unset: { folderId: "" } },
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully"
    });
  } catch (error) {
    await session.abortTransaction();
    return NextResponse.json(
      { success: false, message: "Error deleting folder" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
