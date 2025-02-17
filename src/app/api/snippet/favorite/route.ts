import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { getUserFromToken } from "@/utils/auth";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  await connectDB();
  const user = await getUserFromToken(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { snippetId } = await req.json();   
  if (!snippetId)
    return NextResponse.json({ error: "Snippet ID required" }, { status: 400 });

  await User.findByIdAndUpdate(user._id, {
    $addToSet: { favorites: snippetId },
  });

  return NextResponse.json({ message: "Snippet added to favorites" });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const user = await getUserFromToken(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { snippetId } = await req.json();
  if (!snippetId)
    return NextResponse.json({ error: "Snippet ID required" }, { status: 400 });

  await User.findByIdAndUpdate(user._id, { $pull: { favorites: snippetId } });

  return NextResponse.json({ message: "Snippet removed from favorites" });
}

export async function GET(req: NextRequest) {
  await connectDB();
  const user = await getUserFromToken(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userData = await User.findById(user._id).populate("favorites");
  return NextResponse.json(userData.favorites);
}
