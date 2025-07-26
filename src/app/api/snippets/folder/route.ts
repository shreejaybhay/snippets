import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Snippet } from "@/models/snippets";
import { Folder } from "@/models/folder";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
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

    const { snippetIds, folderId } = await req.json();

    if (!snippetIds || !Array.isArray(snippetIds) || !folderId) {
      return NextResponse.json(
        { success: false, message: "Invalid request data" },
        { status: 400 }
      );
    }

    // Validate folder ownership
    const folder = await Folder.findOne({
      _id: folderId,
      userId: user._id
    }).session(session);

    if (!folder) {
      return NextResponse.json(
        { success: false, message: "Folder not found" },
        { status: 404 }
      );
    }

    // Validate snippet ownership and update them
    const updateResults = await Promise.all(
      snippetIds.map(async (snippetId) => {
        const snippet = await Snippet.findOneAndUpdate(
          { _id: snippetId, userId: user._id },
          { folderId },
          { session, new: true }
        );
        return snippet;
      })
    );

    // Check if all snippets were updated successfully
    if (updateResults.some(result => !result)) {
      await session.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Some snippets could not be updated" },
        { status: 400 }
      );
    }

    // Update folder snippet count
    await Folder.findByIdAndUpdate(
      folderId,
      { $inc: { snippetCount: snippetIds.length } },
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Snippets added to folder successfully"
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error adding snippets to folder:", error);
    return NextResponse.json(
      { success: false, message: "Error adding snippets to folder" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

export async function PATCH(req: NextRequest) {
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

    const { snippetId, folderId } = await req.json();

    if (!snippetId) {
      return NextResponse.json(
        { success: false, message: "Snippet ID is required" },
        { status: 400 }
      );
    }

    // Validate snippet ownership
    const snippet = await Snippet.findOne({
      _id: snippetId,
      userId: user._id
    }).session(session);

    if (!snippet) {
      return NextResponse.json(
        { success: false, message: "Snippet not found" },
        { status: 404 }
      );
    }

    // If moving to a new folder, validate folder ownership
    if (folderId) {
      const folder = await Folder.findOne({
        _id: folderId,
        userId: user._id
      }).session(session);

      if (!folder) {
        return NextResponse.json(
          { success: false, message: "Folder not found" },
          { status: 404 }
        );
      }
    }

    // Update old folder count if snippet was in a folder
    if (snippet.folderId) {
      await Folder.findByIdAndUpdate(
        snippet.folderId,
        { $inc: { snippetCount: -1 } },
        { session }
      );
    }

    // Update new folder count if moving to a folder
    if (folderId) {
      await Folder.findByIdAndUpdate(
        folderId,
        { $inc: { snippetCount: 1 } },
        { session }
      );
    }

    // Update snippet
    await Snippet.findByIdAndUpdate(
      snippetId,
      { $set: { folderId: folderId || null } },
      { session }
    );

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "Snippet moved successfully"
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error moving snippet:", error);
    return NextResponse.json(
      { success: false, message: "Error moving snippet" },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const folderId = url.searchParams.get('folderId');

    if (!folderId) {
      return NextResponse.json(
        { success: false, message: "Folder ID is required" },
        { status: 400 }
      );
    }

    const snippets = await Snippet.find({
      userId: user._id,
      folderId
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      snippets
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching snippets" },
      { status: 500 }
    );
  }
}
