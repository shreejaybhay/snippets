import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Snippet } from "@/models/snippets";
import mongoose from "mongoose";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function POST(req: NextRequest) {
  try {
    console.log("🟢 Connecting to database...");
    await connectDB();

    console.log("🟢 Authenticating user...");
    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return user; // If it's a NextResponse, return it
    }

    console.log("🟢 Parsing request body...");
    const { title, description, code, language, tags } = await req.json();

    if (!title || !code || !language) {
      return NextResponse.json(
        { message: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    console.log("🟢 Formatting tags...");
    const formattedTags = Array.isArray(tags) 
      ? tags.filter((tag) => typeof tag === "string" && tag.trim() !== "").map((tag) => tag.trim()) 
      : [];

    console.log("🟢 Creating snippet...");
    const snippet = await Snippet.create({
      title,
      description,
      code,
      language,
      userId: user._id,
      tags: formattedTags, // ✅ Correctly formatted tags
    });

    console.log("✅ Snippet created successfully!");
    return NextResponse.json({
      message: "Snippet created successfully",
      snippet,
      success: true,
    });
  } catch (error) {
    console.error("🔴 Error creating snippet:", error);
    return NextResponse.json(
      { message: "Error creating snippet", success: false },
      { status: 500 }
    );
  }
}
