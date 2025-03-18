import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Snippet } from '@/models/snippets';
import { getUserFromToken } from '@/utils/auth';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const user = await getUserFromToken(request);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const snippet = await Snippet.findOne({
      _id: id,
      userId: user._id
    }).select('isPinned');

    if (!snippet) {
      return NextResponse.json(
        { success: false, message: 'Snippet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isPinned: snippet.isPinned || false
    });
  } catch (error) {
    console.error('Error fetching pin status:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const user = await getUserFromToken(request);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Await the params before using them
    const { id } = await context.params;

    const snippet = await Snippet.findOne({
      _id: id,
      userId: user._id
    });

    if (!snippet) {
      return NextResponse.json(
        { success: false, message: 'Snippet not found' },
        { status: 404 }
      );
    }

    snippet.isPinned = !snippet.isPinned;
    await snippet.save();

    return NextResponse.json({
      success: true,
      isPinned: snippet.isPinned
    });
  } catch (error) {
    console.error('Error updating pin status:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
