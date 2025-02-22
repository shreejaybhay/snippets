import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Snippet } from "@/models/snippets";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: { snippetId: string } }
) {
  try {
    console.log("🟢 Connecting to database...");
    await connectDB();

    const { snippetId } = await context.params;

    console.log("🟢 Fetching snippet...");
    const snippet = await Snippet.findById(snippetId).lean();

    if (!snippet) {
      return NextResponse.json(
        { message: "Snippet not found", success: false },
        { status: 404 }
      );
    }

    // Ensure isPublic is included in the response
    if (typeof snippet.isPublic === 'undefined') {
      snippet.isPublic = false;
    }

    return NextResponse.json({ snippet, success: true });
  } catch (error) {
    console.error("🔴 Error fetching snippet:", error);
    return NextResponse.json(
      { message: "Error fetching snippet", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { snippetId: string } }
) {
  try {
    console.log("🟢 Connecting to database...");
    await connectDB();

    console.log("🟢 Awaiting params...");
    const { snippetId } = await context.params;

    console.log("🟢 Validating snippet ID...");
    if (!mongoose.Types.ObjectId.isValid(snippetId.trim())) {
      return NextResponse.json(
        { message: "Invalid snippet ID", success: false },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, code, language, tags } = body;

    console.log("🟢 Formatting tags...");
    const formattedTags: string[] = Array.isArray(tags) ? tags.map(String) : [];

    console.log("🟢 Updating snippet...");
    const snippet = await Snippet.findByIdAndUpdate(
      snippetId.trim(),
      { title, description, code, language, tags: formattedTags },
      { new: true }
    );

    if (!snippet) {
      return NextResponse.json(
        { message: "Snippet not found", success: false },
        { status: 404 }
      );
    }

    console.log("✅ Snippet updated successfully!");
    return NextResponse.json({ success: true, snippet });
  } catch (error) {
    console.error("🔴 Error updating snippet:", error);
    return NextResponse.json(
      { message: `Server error: ${(error as Error).message}`, success: false },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: { snippetId: string } }
) {
  try {
    console.log("🟢 Connecting to database...");
    await connectDB();

    console.log("🟢 Authenticating user...");
    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return user;
    }

    console.log("🟢 Validating snippet ID...");
    const { snippetId } = await params;
    const cleanedSnippetId = snippetId.trim();
    if (!mongoose.Types.ObjectId.isValid(cleanedSnippetId)) {
      return NextResponse.json(
        { message: "Invalid snippet ID", success: false },
        { status: 400 }
      );
    }

    console.log("🟢 Finding and deleting snippet...");
    const snippet = await Snippet.findOneAndDelete({
      _id: cleanedSnippetId,
      userId: user._id,
    });

    if (!snippet) {
      console.log("🔴 Snippet not found or unauthorized");
      return NextResponse.json(
        { message: "Snippet not found or unauthorized", success: false },
        { status: 404 }
      );
    }

    console.log("✅ Snippet deleted successfully!");
    return NextResponse.json({
      message: "Snippet deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("🔴 Error deleting snippet:", error);
    return NextResponse.json(
      { message: "Error deleting snippet", success: false },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: { snippetId: string } }
) {
  try {
    await connectDB();
    const { snippetId } = context.params;
    const body = await req.json();
    const { isPublic } = body;

    const snippet = await Snippet.findByIdAndUpdate(
      snippetId,
      { isPublic },
      { new: true }
    );

    if (!snippet) {
      return NextResponse.json(
        { message: "Snippet not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, snippet });
  } catch (error) {
    console.error("Error updating snippet visibility:", error);
    return NextResponse.json(
      { message: "Error updating snippet", success: false },
      { status: 500 }
    );
  }
}
