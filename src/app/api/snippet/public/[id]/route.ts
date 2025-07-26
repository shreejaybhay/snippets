import { connectDB } from "@/lib/db";
import { Snippet } from "@/models/snippets";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

interface UserPopulated {
  _id: mongoose.Types.ObjectId;
  username: string;
  profileURL?: string;
}

interface SnippetDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  views: number;
  userId: UserPopulated;
}

interface FormattedSnippet {
  _id: mongoose.Types.ObjectId;
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  views: number;
  user: {
    _id: mongoose.Types.ObjectId;
    username: string;
    profileURL?: string;
  };
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // Await the params before using them
    const { id } = await context.params;

    // Ensure DB connection before any operations
    await connectDB();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid snippet ID" },
        { status: 400 }
      );
    }

    const snippet = await Snippet.findById(id)
      .populate<{ userId: UserPopulated }>("userId", "username profileURL")
      .lean<SnippetDocument>();

    if (!snippet) {
      return NextResponse.json(
        { success: false, message: "Snippet not found" },
        { status: 404 }
      );
    }

    if (!snippet.isPublic) {
      return NextResponse.json(
        { success: false, message: "This snippet is private" },
        { status: 403 }
      );
    }

    const formattedSnippet: FormattedSnippet = {
      _id: snippet._id,
      id: snippet._id.toString(),
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      isPublic: snippet.isPublic,
      createdAt: snippet.createdAt,
      views: snippet.views,
      user: {
        _id: snippet.userId._id,
        username: snippet.userId.username,
        profileURL: snippet.userId.profileURL,
      },
    };

    return NextResponse.json(
      { success: true, snippet: formattedSnippet },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/snippet/public/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching snippet" },
      { status: 500 }
    );
  }
}
