"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import CodeMirror from "@uiw/react-codemirror";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Clock, Copy, Share2, Tag, Eye, Check } from "lucide-react";
import { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { cn } from "@/lib/utils";

interface UserType {
  _id: string;
  username: string;
  profileURL?: string;
}

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  views: number;
  user: UserType;
}

interface ApiResponse {
  success: boolean;
  snippet?: Snippet;
  message?: string;
}

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

// Loading Skeleton Component
const SnippetSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
        {/* Header Section Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-1">
            <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-700 rounded-md animate-pulse" />
            <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-700 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Title and Description Skeleton */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-8 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Code Window Skeleton */}
        <div className="relative">
          <Card className="relative bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F3F4F6] dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-[1px] bg-zinc-300 dark:bg-zinc-700" />
                  <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-7 w-7 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Code Content */}
            <div className="p-4">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
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
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);
  const { toast } = useToast();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const fetchController = useRef<AbortController | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchSnippet = async () => {
      if (!mounted.current) return;

      if (!id) {
        setLoading(false);
        setError(true);
        return;
      }

      if (fetchController.current) {
        fetchController.current.abort();
      }

      fetchController.current = new AbortController();

      try {
        const response = await fetch(`${BASE_URL}/api/snippet/public/${id}`, {
          signal: fetchController.current.signal,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!mounted.current) return;

        if (!response.ok) {
          throw new Error("Failed to fetch snippet");
        }

        const data: ApiResponse = await response.json();

        if (data.success && data.snippet) {
          setSnippet(data.snippet);
          setError(false);
        } else {
          setError(true);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        if (mounted.current) {
          console.error("Error fetching snippet:", error);
          setError(true);
          toast({
            title: "Error",
            description: "Failed to load snippet",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted.current) {
          setTimeout(() => {
            setLoading(false);
          }, 100);
        }
      }
    };

    fetchSnippet();

    return () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, [id, BASE_URL, toast]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareNotification(true);
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
      console.error("Failed to copy:", error);
      toast({
        title: "Error",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      });
    }
  };

  if (loading || error === null) {
    return <SnippetSkeleton />;
  }

  if (error) {
    return <ErrorView />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-b from-background to-background/80"
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
                <Avatar className="h-12 w-12 ring-2 ring-emerald-500/20">
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
                    <Clock className="mr-1 h-4 w-4" />
                    {snippet?.createdAt
                      ? format(new Date(snippet.createdAt), "MMM d, yyyy")
                      : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className={cn(
                    "h-8 gap-2 px-3",
                    "bg-transparent",
                    "hover:bg-zinc-200 dark:hover:bg-zinc-700/50",
                    "text-zinc-600 dark:text-zinc-400",
                    "transition-all duration-200",
                    showShareNotification && "text-green-600 dark:text-green-400"
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
              </div>
            </div>

            {/* Description and Tags */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
                  {snippet?.title}
                </h1>
                <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                  {snippet?.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {snippet?.tags?.map((tag: string) => (
                  <Badge
                    key={tag}
                    className={cn(
                      "px-2 py-0.5",
                      "bg-zinc-100 dark:bg-zinc-800/50",
                      "hover:bg-zinc-200 dark:hover:bg-zinc-800",
                      "text-zinc-600 dark:text-zinc-400",
                      "border border-zinc-200/20 dark:border-zinc-700/30",
                      "transition-all duration-200",
                      "text-xs",
                      "font-medium"
                    )}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* iOS-style Code Window */}
            <div className="relative">
              <Card className="relative bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
                {/* Window Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#F3F4F6] dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        {snippet?.language}
                      </span>
                      <div className="h-3 w-[1px] bg-zinc-300 dark:bg-zinc-700" />
                      <span className="text-xs text-zinc-500">
                        {snippet?.code?.split("\n").length || 0} lines
                      </span>
                    </div>
                  </div>
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
                    theme="dark"
                    className="[&_.cm-gutters]:bg-[#F3F4F6] dark:[&_.cm-gutters]:bg-zinc-900"
                  />
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PublicSnippetView;
