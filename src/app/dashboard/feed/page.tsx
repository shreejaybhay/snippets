"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Heart,
  MessageSquare,
  Share,
  Bookmark,
  Flag,
  MoreVertical,
  Copy,
  RefreshCw,
  Loader2,
  CodeIcon,
  Plus,
  Trash,
  GitFork,
  Lock,
  Users,
  UserPlus,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Link from "next/link";

// Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "@/hooks/use-toast";
import CommentSection from "@/components/CommentSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Types
interface Comment {
  _id: string;
  content: string;
  userId: {
    _id: string;
    username: string;
    profileURL?: string;
  };
  createdAt: string;
  likes: string[];
}

interface Snippet {
  _id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  userId: {
    _id: string;
    username: string;
    profileURL?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  comments: Comment[];
  showComments?: boolean;
}

interface FeedState {
  feed: Array<
    Snippet & {
      showComments: boolean;
    }
  >;
  loading: boolean;
  page: number;
  hasMore: boolean;
  commentSort: "latest" | "oldest" | "popular";
}

interface CurrentUser {
  _id: string;
  username: string;
  profileURL?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function FeedPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { copy } = useCopyToClipboard();
  const isDarkMode = theme === "dark";

  const [activeTab, setActiveTab] = useState<"following" | "global">(
    "following"
  );
  const [state, setState] = useState<FeedState>({
    feed: [],
    page: 1,
    hasMore: true,
    loading: false,
    commentSort: "latest",
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const fetchFeed = async (
    pageNum: number,
    feedType: "following" | "global"
  ) => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await fetch(
        `${BASE_URL}/api/feed?page=${pageNum}&limit=10&feedType=${feedType}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to fetch feed (${response.status})`
        );
      }

      if (data.success) {
        setState((prev) => ({
          ...prev,
          feed:
            pageNum === 1 ? data.snippets : [...prev.feed, ...data.snippets],
          page: pageNum,
          hasMore: data.hasMore,
          loading: false,
        }));
      } else {
        throw new Error(data.message || "Failed to fetch feed");
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch feed",
        variant: "destructive",
      });
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    const initializeFeed = async () => {
      try {
        await fetchCurrentUser();
        await fetchFeed(1, activeTab);
      } catch (error) {
        console.error("Error initializing feed:", error);
        toast({
          title: "Error",
          description: "Failed to initialize feed",
          variant: "destructive",
        });
      }
    };

    initializeFeed();
  }, [activeTab]); // Add activeTab to the dependency array

  const copyToClipboard = async (text: string) => {
    const success = await copy(text);
    if (success) {
      toast({
        title: "Copied to clipboard",
        description: "The code has been copied to your clipboard.",
      });
    }
  };

  const handleLike = async (snippetId: string) => {
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You must be logged in to like snippets",
      });
      return;
    }

    // Prevent liking own snippets
    const snippet = state.feed.find((s) => s._id === snippetId);
    if (snippet?.userId._id === currentUser._id) {
      toast({
        title: "Cannot like own snippet",
        description: "You cannot like your own snippets",
      });
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/public/${snippetId}/like`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          feed: prev.feed.map((snippet) =>
            snippet._id === snippetId
              ? {
                  ...snippet,
                  isLikedByMe: data.liked,
                  likesCount: data.likesCount,
                }
              : snippet
          ),
        }));
      }
    } catch (error) {
      console.error("Error liking snippet:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to like the snippet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleComments = async (snippetId: string) => {
    setState((prev) => ({
      ...prev,
      feed: prev.feed.map((snippet) =>
        snippet._id === snippetId
          ? { ...snippet, showComments: !snippet.showComments }
          : snippet
      ),
    }));

    // Fetch comments when showing them
    const snippet = state.feed.find((s) => s._id === snippetId);
    if (!snippet?.showComments) {
      try {
        const response = await fetch(
          `${BASE_URL}/api/snippet/public/${snippetId}/comments`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();

        if (data.success) {
          setState((prev) => ({
            ...prev,
            feed: prev.feed.map((s) =>
              s._id === snippetId
                ? { ...s, comments: sortComments(data.comments) }
                : s
            ),
          }));
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error",
          description: "Failed to fetch comments",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddComment = async (snippetId: string, content: string) => {
    if (!content?.trim()) {
      toast({
        title: "Error",
        description: "Comment content is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/public/${snippetId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ content: content.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add comment");
      }

      // Update state with new comment
      setState((prev) => ({
        ...prev,
        feed: prev.feed.map((snippet) =>
          snippet._id === snippetId
            ? {
                ...snippet,
                comments: [...(snippet.comments || []), data.comment],
                commentsCount: (snippet.commentsCount || 0) + 1,
              }
            : snippet
        ),
      }));

      return data.comment;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      });
      throw error; // Rethrow to handle in CommentSection
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to like comments",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the snippet that contains this comment
      const snippet = state.feed.find((s) =>
        s.comments?.some((c) => c._id === commentId)
      );

      if (!snippet) return;

      // Find the comment to check if it's already liked
      const comment = snippet.comments?.find((c) => c._id === commentId);
      if (!comment) return;

      // Check if the comment is already liked by the current user
      const isLiked = comment.likes.includes(currentUser._id);

      const response = await fetch(
        `${BASE_URL}/api/snippet/public/${snippet._id}/comments/${commentId}/like`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          feed: prev.feed.map((s) => ({
            ...s,
            comments: (s.comments || []).map((c) =>
              c._id === commentId
                ? {
                    ...c,
                    likes: isLiked
                      ? c.likes.filter((id) => id !== currentUser._id) // Unlike
                      : [...c.likes, currentUser._id], // Like
                  }
                : c
            ),
          })),
        }));
      } else {
        throw new Error(data.message || "Failed to like comment");
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (snippetId: string, commentId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/public/${snippetId}/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete comment");
      }

      // Update the UI by removing the deleted comment
      setState((prev) => ({
        ...prev,
        feed: prev.feed.map((s) =>
          s._id === snippetId
            ? {
                ...s,
                comments: (s.comments || []).filter((c) => c._id !== commentId),
                commentsCount: Math.max(0, (s.commentsCount || 0) - 1),
              }
            : s
        ),
      }));

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const loadMore = () => {
    if (!state.loading && state.hasMore) {
      fetchFeed(state.page + 1, activeTab);
    }
  };

  const sortComments = (comments: Comment[]): Comment[] => {
    if (!Array.isArray(comments)) return [];

    const sortedComments = [...comments];

    switch (state.commentSort) {
      case "latest":
        return sortedComments.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return sortedComments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "popular":
        return sortedComments.sort((a, b) => b.likes.length - a.likes.length);
      default:
        return sortedComments;
    }
  };

  const fetchComments = async (snippetId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/public/${snippetId}/comments`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setState((prev) => ({
          ...prev,
          feed: prev.feed.map((s) =>
            s._id === snippetId ? { ...s, comments: data.comments } : s
          ),
        }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    const newTab = value as "following" | "global";
    setActiveTab(newTab);
    setState((prev) => ({
      ...prev,
      feed: [],
      page: 1,
      hasMore: true,
      loading: true,
    }));
    fetchFeed(1, newTab);
  };

  const handleShare = async (snippetId: string) => {
    // For share, we use window.location.origin to get the frontend URL
    const url = `${window.location.origin}/dashboard/s/${snippetId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success",
        description: "Snippet URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const handleFork = async (snippetId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/fork/${snippetId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Snippet forked successfully",
        });
        router.push(`/dashboard/snippets`);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fork snippet",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (snippetId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/add-snippets/${snippetId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Snippet deleted successfully",
        });
        // Remove the deleted snippet from the feed
        setState((prev) => ({
          ...prev,
          feed: prev.feed.filter((s) => s._id !== snippetId),
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete snippet",
        variant: "destructive",
      });
    }
  };

  const handleMakePrivate = async (snippetId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/add-snippets/${snippetId}/visibility`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isPublic: false }),
        }
      );
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Snippet is now private",
        });
        // Remove the snippet from the feed since it's now private
        setState((prev) => ({
          ...prev,
          feed: prev.feed.filter((s) => s._id !== snippetId),
        }));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to make snippet private",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 scrollbar-gutter-stable">
      <Tabs
        defaultValue="following"
        value={activeTab}
        onValueChange={handleTabChange}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="following"
            className={cn(
              "data-[state=active]:bg-emerald-500/10",
              "data-[state=active]:text-emerald-700",
              "dark:data-[state=active]:text-emerald-400"
            )}
          >
            Following
          </TabsTrigger>
          <TabsTrigger
            value="global"
            className={cn(
              "data-[state=active]:bg-emerald-500/10",
              "data-[state=active]:text-emerald-700",
              "dark:data-[state=active]:text-emerald-400"
            )}
          >
            Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="mt-6">
          <div className="space-y-6">{renderFeedContent()}</div>
        </TabsContent>

        <TabsContent value="global" className="mt-6">
          <div className="space-y-6">{renderFeedContent()}</div>
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderFeedContent() {
    if (state.loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="relative w-4 h-8 text-transparent">
            <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-[#10B981] animate-loader"></div>
            <div className="absolute top-0 left-0 w-3.5 h-8 bg-[#10B981] animate-loader delay-150"></div>
            <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-[#10B981] animate-loader delay-300"></div>
          </div>
        </div>
      );
    }

    if (state.feed.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          {activeTab === "following" ? (
            <>
              <div className="flex flex-col items-center justify-center space-y-4">
                <Users className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  No posts from people you follow
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  Start following people to see their snippets here
                </p>
                <motion.button
                  onClick={() => router.push("/dashboard/users")}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-600/90 text-white hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors shadow-sm border border-emerald-600/30 dark:border-emerald-400/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Discover People to Follow</span>
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                No posts available
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Be the first to share a snippet with the community.
              </p>
            </>
          )}
        </motion.div>
      );
    }

    return (
      <div className="space-y-6">
        {state.feed.map((snippet) => (
          <motion.article
            key={snippet._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 dark:bg-[#161514] rounded-xl border border-zinc-200 dark:border-zinc-200/10 backdrop-blur-[12px] overflow-hidden"
          >
            {/* Snippet Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <Link
                  href={`/dashboard/users/profile/${snippet.userId._id}`}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={snippet.userId.profileURL} />
                    <AvatarFallback>
                      {snippet.userId.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {snippet.userId.username}
                    </h3>
                    <time className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(snippet.createdAt))} ago
                    </time>
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare(snippet._id)}>
                      <Share className="mr-2 h-4 w-4" /> Share
                    </DropdownMenuItem>
                    {currentUser?._id !== snippet.userId._id && (
                      <DropdownMenuItem onClick={() => handleFork(snippet._id)}>
                        <GitFork className="mr-2 h-4 w-4" /> Fork
                      </DropdownMenuItem>
                    )}
                    {currentUser?._id === snippet.userId._id && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleMakePrivate(snippet._id)}
                        >
                          <Lock className="mr-2 h-4 w-4" /> Make Private
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(snippet._id)}
                          className="text-red-600 focus:text-red-600 dark:focus:text-red-500"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {snippet.title}
              </h2>
              {snippet.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {snippet.description}
                </p>
              )}
            </div>

            {/* Code Block */}
            <div className="relative dark:bg-[#1E2127] bg-[#E9ECEF] p-4 mx-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <Button
                  onClick={() => copyToClipboard(snippet.code)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-2 text-xs font-medium",
                    "bg-zinc-200/80 hover:bg-zinc-200 dark:bg-zinc-700/50 dark:hover:bg-zinc-700",
                    "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
                    "transition-colors duration-200",
                    "rounded-md",
                    "flex items-center gap-1.5"
                  )}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
              <div className="max-h-[400px] overflow-y-auto rounded-xl">
                <SyntaxHighlighter
                  language={snippet.language.toLowerCase()}
                  style={isDarkMode ? oneDark : oneLight}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    background: isDarkMode ? "#282C34" : "#F8F9FA",
                    maxHeight: "none",
                  }}
                >
                  {snippet.code}
                </SyntaxHighlighter>
              </div>
            </div>

            {/* Snippet Footer */}
            <div className="px-6 py-4 mt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-200/10">
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center space-x-2",
                    snippet.isLikedByMe &&
                      "text-emerald-500 hover:text-emerald-600",
                    snippet.userId._id === currentUser?._id &&
                      "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                  onClick={() => handleLike(snippet._id)}
                  disabled={snippet.userId._id === currentUser?._id}
                >
                  {snippet.isLikedByMe ? (
                    <Heart className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                  <span>{snippet.likesCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => toggleComments(snippet._id)}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{snippet.commentsCount}</span>
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                >
                  {snippet.language}
                </Badge>
              </div>
            </div>

            {/* Comment Section */}
            {snippet.showComments && (
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-200/10">
                <CommentSection
                  snippetId={snippet._id}
                  comments={sortComments(snippet.comments || [])}
                  currentUser={currentUser}
                  onCommentAdded={handleAddComment}
                  onLikeComment={handleLikeComment}
                  commentSort={state.commentSort}
                  onSortChange={(sort) =>
                    setState((prev) => ({ ...prev, commentSort: sort }))
                  }
                  onLoadMore={undefined} // Add if you implement pagination
                  onDeleteComment={handleDeleteComment} // Add if you implement deletion
                />
              </div>
            )}
          </motion.article>
        ))}
        {/* Load More Button */}
        {state.hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={loadMore}
              disabled={state.loading}
              className="h-9 sm:h-10 lg:h-12 gap-2 bg-emerald-500/10 dark:bg-emerald-500/10 
              border-emerald-500/20 dark:border-emerald-500/20 
              hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 
              text-emerald-700 dark:text-emerald-400"
            >
              {state.loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }
}
