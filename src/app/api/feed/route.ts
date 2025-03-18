import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Snippet } from "@/models/snippets";
import { getUserFromToken } from "@/utils/auth";
import { Types } from "mongoose";

// Move the helper function outside the main handler
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { success: false, message: "Failed to connect to database" },
        { status: 500 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const feedType = searchParams.get('feedType') || 'following';
    const skip = (page - 1) * limit;

    // Get current user with error handling
    let user;
    try {
      user = await getUserFromToken(request);
    } catch (error) {
      console.error('Auth error:', error);
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 401 }
      );
    }

    // Handle following feed without login
    if (feedType === 'following' && !user) {
      return NextResponse.json({
        success: true,
        snippets: [],
        hasMore: false,
        message: "Login required for following feed"
      });
    }

    const followingIds = user?.following || [];

    try {
      let snippets;
      const totalLimit = limit * 2; // Double the limit to fetch both types
      
      if (feedType === 'following' && user) {
        // Fetch following feed
        snippets = await Snippet.find({ 
          isPublic: true,
          userId: { $in: followingIds }
        })
          .populate('userId', 'username profileURL _id')
          .select('title description code language userId likes likesCount comments commentsCount createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec();
      } else if (feedType === 'global') {
        // Fetch popular posts (based on likes and comments)
        const popularSnippets = await Snippet.find({ 
          isPublic: true,
        })
          .populate('userId', 'username profileURL _id')
          .select('title description code language userId likes likesCount comments commentsCount createdAt')
          .sort({ 
            likesCount: -1,
            commentsCount: -1 
          })
          .limit(Math.floor(totalLimit / 2))  // Get half of the total limit for popular posts
          .lean()
          .exec();

        // Fetch latest posts
        const latestSnippets = await Snippet.find({
          isPublic: true,
          _id: { $nin: popularSnippets.map(s => s._id) } // Exclude already fetched popular posts
        })
          .populate('userId', 'username profileURL _id')
          .select('title description code language userId likes likesCount comments commentsCount createdAt')
          .sort({ createdAt: -1 })
          .limit(Math.floor(totalLimit / 2))  // Get half of the total limit for latest posts
          .lean()
          .exec();

        // Combine and shuffle the results
        snippets = shuffleArray([...popularSnippets, ...latestSnippets]);
      } else {
        // Handle case when not logged in or invalid feed type
        snippets = await Snippet.find({ isPublic: true })
          .populate('userId', 'username profileURL _id')
          .select('title description code language userId likes likesCount comments commentsCount createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec();
      }

      // Get total count for pagination
      const totalCount = await Snippet.countDocuments(
        feedType === 'following' && user 
          ? { isPublic: true, userId: { $in: followingIds } }
          : { isPublic: true }
      );

      // Transform snippets
      const enhancedSnippets = snippets.map((snippet: any) => ({
        _id: snippet._id,
        title: snippet.title || '',
        description: snippet.description,
        code: snippet.code || '',
        language: snippet.language || 'text',
        createdAt: snippet.createdAt,
        userId: {
          _id: snippet.userId?._id || snippet.userId,
          username: snippet.userId?.username || 'Unknown User',
          profileURL: snippet.userId?.profileURL,
          isFollowing: user ? followingIds.includes(snippet.userId?._id?.toString()) : false
        },
        isLikedByMe: user ? (snippet.likes || []).some((id: any) => 
          id.toString() === user._id.toString()
        ) : false,
        likesCount: (snippet.likes || []).length,
        commentsCount: snippet.commentsCount || 0,
        comments: snippet.comments || [],
        savesCount: (snippet.saves || []).length,
        // Add these fields to help with debugging
        isPopular: snippet.likesCount > 0 || snippet.commentsCount > 0,
        engagement: snippet.likesCount + snippet.commentsCount
      }));

      return NextResponse.json({
        success: true,
        snippets: enhancedSnippets,
        hasMore: skip + snippets.length < totalCount,
        totalCount
      });
    } catch (error) {
      console.error('Database query error:', {
        error,
        feedType,
        skip,
        limit,
        userLoggedIn: !!user,
        followingCount: followingIds.length
      });
      return NextResponse.json(
        { 
          success: false, 
          message: "Database query failed", 
          details: process.env.NODE_ENV === 'development' ? 
            (error instanceof Error ? error.message : String(error)) : 
            undefined 
        },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : 
          undefined 
      },
      { status: 500 }
    );
  }
}
