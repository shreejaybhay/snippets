import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Snippet } from '@/models/snippets';
import { getUserFromToken } from '@/utils/auth';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();
    
    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await params before using id
    const { id } = await params;

    // Find the original snippet
    const originalSnippet = await Snippet.findById(id);
    if (!originalSnippet) {
      return NextResponse.json(
        { success: false, message: 'Snippet not found' },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the snippet
    if (originalSnippet.userId.toString() === user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Cannot fork your own snippet' },
        { status: 400 }
      );
    }

    // Create new snippet with original content
    const forkedSnippet = new Snippet({
      title: `${originalSnippet.title} (forked)`,
      description: originalSnippet.description,
      code: originalSnippet.code,
      language: originalSnippet.language,
      tags: originalSnippet.tags,
      userId: user._id,
      forkedFrom: originalSnippet._id,
      isPublic: false, // Set to private by default
      views: 0,
      likes: [],
      likesCount: 0,
      commentsCount: 0
    });

    await forkedSnippet.save();

    return NextResponse.json({
      success: true,
      snippet: forkedSnippet
    });
  } catch (error) {
    console.error('Error forking snippet:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fork snippet' },
      { status: 500 }
    );
  }
}
