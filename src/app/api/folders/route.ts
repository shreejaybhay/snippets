import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import { Folder } from "@/models/folder";

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

    const folders = await Folder.find({ userId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      folders
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching folders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Folder name is required" },
        { status: 400 }
      );
    }

    const folder = await Folder.create({
      name,
      description,
      color,
      userId: user._id,
      snippetCount: 0
    });

    return NextResponse.json({
      success: true,
      folder,
      message: "Folder created successfully"
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { success: false, message: "Error creating folder" },
      { status: 500 }
    );
  }
}
