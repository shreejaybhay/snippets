"use client";

import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import CodeMirror from "@uiw/react-codemirror";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Copy,
  Share2,
  Eye,
  Check,
  GitBranch,
  MessageSquare,
  Calendar,
  Code2,
} from "lucide-react";
import type { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { cn } from "@/lib/utils";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type React from "react";
import { useTheme } from "next-themes";

interface UserType {
  _id: string;
  username: string;
  profileURL?: string;
}

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isLikedByUser: boolean;
  likesCount: number;
  views: number;
  createdAt: string;
  comments: Comment[];
  user: {
    _id: string;
    username: string;
    profileURL?: string;
  };
}

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

// ApiResponse interface removed as it's not being used

const getLanguageExtension = (language: string): Extension => {
  switch (language.toLowerCase()) {
    case "javascript":
    case "typescript":
      return javascript({ jsx: true, typescript: true });
    case "python":
      return python();
    case "cpp":
    case "c++":
      return cpp();
    case "java":
      return java();
    case "html":
      return html();
    case "css":
      return css();
    case "json":
      return json();
    case "markdown":
    case "md":
      return markdown();
    default:
      return javascript();
  }
};

// Loading Skeleton Component removed as it's not being used

// Loading Animation Component
const LoadingAnimation = () => (
  <div
    className="fixed inset-0 bg-black/20 dark:bg-[#161514]/20 backdrop-blur-sm 
  flex items-center justify-center z-50"
  >
    <div className="relative w-4 h-8">
      <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-green-500 animate-loader"></div>
      <div className="absolute top-0 left-0 w-3.5 h-8 bg-green-500 animate-loader delay-150"></div>
      <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-green-500 animate-loader delay-300"></div>
    </div>
  </div>
);

// Error Component
const ErrorView = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/80"
  >
    <Card className="w-full max-w-md mx-4 border-0 shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full w-fit mx-auto">
            <Eye className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold">Snippet Not Available</h2>
          <p className="text-muted-foreground">
            This snippet is either private or doesn't exist.
          </p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const PublicSnippetView = () => {
  const { theme } = useTheme();
  const params = useParams();
  const snippetId = params.id as string;
  const { toast } = useToast();
  const Router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Group all useState hooks together at the top
  const [loading, setLoading] = useState(true);
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likeState, setLikeState] = useState({
    isLiked: false,
    likesCount: 0,
  });
  const [viewTracked, setViewTracked] = useState(false);
  const [commentSort, setCommentSort] = useState<
    "latest" | "oldest" | "popular"
  >("latest");

  // Add this sorting function
  const sortComments = (commentsToSort: Comment[]): Comment[] => {
    return [...commentsToSort].sort((a, b) => {
      switch (commentSort) {
        case "latest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "popular":
          return b.likes.length - a.likes.length;
        default:
          return 0;
      }
    });
  };

  // Group all useEffect hooks together
  useEffect(() => {
    const fetchSnippet = async () => {
      if (!snippetId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/snippet/public/${snippetId}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.success && data.snippet) {
          setSnippet(data.snippet);
        } else {
          setError(data.message || "Failed to load snippet");
        }
      } catch (error) {
        setError("Failed to load snippet");
        console.error("Error fetching snippet:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [snippetId, BASE_URL]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (response.status === 401) {
          // User is not logged in, which is fine
          setCurrentUser(null);
          return;
        }
        const data = await response.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, [BASE_URL]);

  useEffect(() => {
    const fetchLikeState = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/snippet/public/${snippetId}/like`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setLikeState({
              isLiked: data.liked,
              likesCount: data.likesCount,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching like state:", error);
      }
    };

    if (snippetId && currentUser) {
      // Only fetch like state if user is logged in
      fetchLikeState();
    } else {
      // If user is not logged in, just show the total likes
      setLikeState((prev) => ({
        ...prev,
        isLiked: false,
      }));
    }
  }, [snippetId, currentUser, BASE_URL]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/snippet/public/${snippetId}/comments`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        if (data.success) {
          setComments(data.comments);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (snippetId) {
      fetchComments();
    }
  }, [snippetId, BASE_URL]);

  useEffect(() => {
    const trackView = async () => {
      if (viewTracked) return;

      const storageKey = `snippet_view_${snippetId}`;
      const now = Date.now();
      const lastViewTime = localStorage.getItem(storageKey);
      const viewExpiry = 24 * 60 * 60 * 1000; // 24 hours

      if (!lastViewTime || now - Number.parseInt(lastViewTime) > viewExpiry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(
            `${BASE_URL}/api/snippet/public/${snippetId}/view`,
            {
              method: "POST",
              credentials: "include",
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            localStorage.setItem(storageKey, now.toString());
            const data = await response.json();
            if (data.success && snippet) {
              setSnippet((prev) =>
                prev ? { ...prev, views: data.views } : prev
              );
            }
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") {
            console.log("View tracking request timed out");
          } else {
            console.error("Error tracking view:", err);
          }
        }
      }
      setViewTracked(true);
    };

    if (snippet && snippetId && !viewTracked) {
      trackView();
    }
  }, [snippet, snippetId, viewTracked, BASE_URL]);

  // Helper functions
  const handleLikeStateChange = (isLiked: boolean, likesCount: number) => {
    setLikeState({ isLiked, likesCount });
    setSnippet((prev) =>
      prev
        ? {
            ...prev,
            isLikedByUser: isLiked,
            likesCount: likesCount,
          }
        : null
    );
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 2000);
      toast({
        title: "Link copied!",
        description: "Share this snippet with others",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    if (!snippet?.code) return;

    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Success",
        description: "Code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  const handleFork = async () => {
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
        // Redirect to the forked snippet
        Router.push(`/dashboard/snippets/${data.snippet._id}`);
      } else {
        throw new Error(data.message || "Failed to fork snippet");
      }
    } catch (error) {
      console.error("Error forking snippet:", error);
      toast({
        title: "Error",
        description: "Failed to fork snippet. Please try again later.",
        variant: "destructive",
      });
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
      // Find the comment to check if it's already liked
      const comment = comments.find((c) => c._id === commentId);
      if (!comment) return;

      // Check if the comment is already liked by the current user
      const isLiked = comment.likes.includes(currentUser._id);

      const response = await fetch(
        `${BASE_URL}/api/snippet/public/${snippetId}/comments/${commentId}/like`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? {
                  ...c,
                  likes: isLiked
                    ? c.likes.filter((id) => id !== currentUser._id) // Unlike
                    : [...c.likes, currentUser._id], // Like
                }
              : c
          )
        );
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

      if (data.success) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId)
        );
        toast({
          title: "Success",
          description: "Comment deleted successfully",
        });
      } else {
        throw new Error(data.message || "Failed to delete comment");
      }
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

  const formatViewCount = (count: number | undefined): string => {
    if (!count) return "0";

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error || !snippet) {
    return <ErrorView />;
  }

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-12"
        >
          <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "w-full max-w-[95%] lg:max-w-[85%] xl:max-w-[100%] mx-auto",
                "group/card relative overflow-hidden",
                "p-4 sm:p-6 lg:p-8",
                "rounded-xl border",
                "bg-white/60 dark:bg-[#1C1917]/40",
                "shadow-xl",
                "backdrop-blur-[12px]",
                "border-green-200/20 dark:border-green-100/10",
                "space-y-6"
              )}
            >
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 ring-2 ring-emerald-500/20 transition-all duration-300 hover:ring-emerald-500/40">
                    <AvatarImage
                      src={snippet?.user?.profileURL || ""}
                      alt={snippet?.user?.username || "User"}
                    />
                    <AvatarFallback className="bg-emerald-500/10">
                      <User className="h-6 w-6 text-emerald-500" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
                      {snippet?.user?.username || "Anonymous"}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      {snippet?.createdAt
                        ? format(new Date(snippet.createdAt), "MMM d, yyyy")
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleShare}
                        className={cn(
                          "h-9 gap-2 px-3 rounded-full",
                          "bg-zinc-100 dark:bg-zinc-800/50",
                          "hover:bg-zinc-200 dark:hover:bg-zinc-700/50",
                          "text-zinc-600 dark:text-zinc-400",
                          "transition-all duration-200",
                          showShareNotification &&
                            "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20"
                        )}
                      >
                        {showShareNotification ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span className="text-xs font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Share</span>
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share this snippet</p>
                    </TooltipContent>
                  </Tooltip>

                  {snippet &&
                    currentUser &&
                    snippet.user &&
                    snippet.user._id !== currentUser._id && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleFork}
                            size="sm"
                            variant="ghost"
                            className={cn(
                              "h-9 gap-2 px-3 rounded-full",
                              "bg-zinc-100 dark:bg-zinc-800/50",
                              "hover:bg-zinc-200 dark:hover:bg-zinc-700/50",
                              "text-zinc-600 dark:text-zinc-400",
                              "transition-all duration-200"
                            )}
                          >
                            <GitBranch className="h-4 w-4" />
                            <span className="text-xs font-medium">Fork</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Create your own copy of this snippet</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                </div>
              </div>

              {/* Description and Tags */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
                    {snippet?.title}
                  </h1>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {snippet?.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {snippet?.tags?.map((tag: string) => (
                    <Badge
                      key={tag}
                      className={cn(
                        "px-2.5 py-0.5",
                        "bg-emerald-50 dark:bg-emerald-900/20",
                        "hover:bg-emerald-100 dark:hover:bg-emerald-800/30",
                        "text-emerald-700 dark:text-emerald-400",
                        "border border-emerald-200/20 dark:border-emerald-700/30",
                        "transition-all duration-200",
                        "text-xs",
                        "font-medium",
                        "rounded-full"
                      )}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 py-2 px-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Eye className="h-4 w-4" />
                  <span>{formatViewCount(snippet?.views)} views</span>
                </div>
                <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700"></div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <MessageSquare className="h-4 w-4" />
                  <span>{comments.length} comments</span>
                </div>
                <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700"></div>
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Code2 className="h-4 w-4" />
                  <span>{snippet?.code?.split("\n").length || 0} lines</span>
                </div>
              </div>

              {/* iOS-style Code Window */}
              <div className="relative">
                <Card className="relative bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg">
                  {/* Window Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#F3F4F6] dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                            {snippet?.language}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleCopy}
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "h-7 transition-all duration-200",
                            copied
                              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400"
                              : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          {copied ? (
                            <span className="text-xs">Copied!</span>
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy code to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Code Content */}
                  <div className="overflow-x-auto">
                    <CodeMirror
                      value={snippet?.code || ""}
                      height="auto"
                      extensions={[
                        getLanguageExtension(snippet?.language || "javascript"),
                      ]}
                      editable={false}
                      theme={theme === "light" ? "light" : "dark"}
                      className="[&_.cm-gutters]:bg-[#F3F4F6] dark:[&_.cm-gutters]:bg-zinc-900"
                    />
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Engagement Section */}
            <div className="flex flex-wrap items-center gap-4 mt-6 px-4 py-3 bg-white/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm shadow-sm">
              <LikeButton
                snippetId={snippet.id}
                initialLiked={likeState.isLiked}
                initialLikesCount={likeState.likesCount}
                onLikeStateChange={handleLikeStateChange}
              />
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="text-sm">
                  {formatViewCount(snippet?.views)} views
                </span>
              </div>
            </div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 bg-white/60 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 backdrop-blur-sm shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-500" />
                Comments ({comments.length})
              </h3>

              {/* Comment Box */}
              <CommentSection
                snippetId={snippetId}
                comments={sortComments(comments)}
                currentUser={currentUser}
                onCommentAdded={async (snippetId: string, content: string) => {
                  try {
                    const response = await fetch(
                      `${BASE_URL}/api/snippet/public/${snippetId}/comments`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({ content }),
                      }
                    );

                    const data = await response.json();
                    if (!response.ok) {
                      throw new Error(data.message || "Failed to add comment");
                    }

                    setComments((prev) => [data.comment, ...prev]);
                    return data.comment;
                  } catch (error) {
                    throw error;
                  }
                }}
                onLikeComment={handleLikeComment}
                onDeleteComment={handleDeleteComment}
                onSortChange={(sort) => {
                  setCommentSort(sort);
                }}
                commentSort={commentSort}
              />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default PublicSnippetView;
