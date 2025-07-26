import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Snippet } from "@/models/snippets";
import mongoose from "mongoose";

export async function PATCH(
  req: NextRequest,
  context: { params: { snippetId: string } }
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

    const { snippetId } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(snippetId)) {
      return NextResponse.json(
        { success: false, message: "Invalid snippet ID" },
        { status: 400 }
      );
    }

    const { isPublic } = await req.json();

    // Explicitly set isPublic in the update
    const snippet = await Snippet.findOneAndUpdate(
      {
        _id: snippetId,
        userId: user._id
      },
      { 
        $set: { 
          isPublic: !!isPublic,
          updatedAt: new Date()
        } 
      },
      { 
        new: true,
        // Explicitly tell MongoDB to return all fields
        projection: {
          _id: 1,
          title: 1,
          description: 1,
          code: 1,
          language: 1,
          userId: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
          isPublic: 1,
          __v: 1
        }
      }
    ).lean();

    if (!snippet) {
      return NextResponse.json(
        { success: false, message: "Snippet not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Snippet is now ${isPublic ? 'public' : 'private'}`,
      snippet
    });
  } catch (error) {
    console.error("Error updating visibility:", error);
    return NextResponse.json(
      { success: false, message: "Error updating visibility" },
      { status: 500 }
    );
  }
}
