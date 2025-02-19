"use client";

import { useEffect, useState } from "react";
import { Copy, Pencil, Share2, Trash2, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css"; // For light mode
import "highlight.js/styles/atom-one-dark.css"; // For dark mode
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { DeleteModal } from "@/components/ui/delete-modal";

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: string;
  isPublic: boolean;
}

const SnippetDetail = () => {
  const { viewcardDetails: id } = useParams(); // ✅ Extract correctly
  console.log("Extracted ID:", id); // Debugging

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch snippet data from API
  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/snippet/add-snippets/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch snippet");
        }

        const data = await response.json();
        if (data.success) {
          setSnippet(data.snippet);
        } else {
          throw new Error(data.message || "Failed to fetch snippet");
        }
      } catch (error) {
        console.error("Error fetching snippet:", error);
        toast({
          title: "Error",
          description: "Failed to load snippet. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSnippet();
    }
  }, [id, toast, BASE_URL]);

  // Handle delete snippet
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/add-snippets/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete snippet");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Snippet deleted successfully",
        });
        router.push("/dashboard/snippets");
        router.refresh();
      } else {
        throw new Error(data.message || "Failed to delete snippet");
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
      toast({
        title: "Error",
        description: "Failed to delete snippet. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Copy Code Handler
  const handleCopy = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVisibilityToggle = async () => {
    if (!snippet) return; // Early return if snippet is null

    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/add-snippets/${id}/visibility`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isPublic: !snippet.isPublic,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      const data = await response.json();
      if (data.success) {
        setSnippet((prev) => ({
          ...prev!,
          isPublic: !prev!.isPublic,
        }));
        toast({
          title: "Success",
          description: `Snippet is now ${
            !snippet.isPublic ? "public" : "private"
          }`,
        });
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update snippet visibility",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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

  if (!snippet) {
    return (
      <div className="p-6 text-red-500 text-center">Snippet not found.</div>
    );
  }

  return (
    <>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          // Responsive width and padding
          "w-full max-w-[98%] sm:max-w-[95%] lg:max-w-[85%] xl:max-w-[100%] mx-auto",
          "group/card relative overflow-hidden",
          "p-2 sm:p-4 lg:p-8", // Reduced padding on mobile
          "mt-5 sm:mt-2", // Reduced top margin on mobile
          "rounded-xl border",
          "bg-white/60 dark:bg-[#1C1917]/40",
          "shadow-xl",
          "backdrop-blur-[12px]",
          "border-green-200/20 dark:border-green-100/10",
          "space-y-2 sm:space-y-4", // Reduced spacing on mobile
          "hover:border-green-500/20 dark:hover:border-green-500/10",
          // Glow effect that follows cursor
          "before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition-opacity before:duration-500",
          "after:absolute after:inset-0 after:-z-10 after:opacity-0 after:transition-opacity after:duration-500",
          "after:bg-[radial-gradient(800px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(52,211,153,0.08),transparent_50%)]",
          "border-green-200/20 dark:border-green-100/10",
          "hover:shadow-lg hover:shadow-zinc-200/20 dark:hover:shadow-zinc-900/30",
          "hover:after:opacity-100",
          // Transition
          "transition-all duration-200"
        )}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--mouse-x",
            `${e.clientX - rect.left}px`
          );
          e.currentTarget.style.setProperty(
            "--mouse-y",
            `${e.clientY - rect.top}px`
          );
        }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
              {snippet.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-xs sm:text-sm font-medium bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20"
              >
                {snippet.language.toUpperCase()}
              </Badge>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {new Date(snippet.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-1 w-full sm:w-auto justify-end sm:justify-start">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const shareUrl = snippet.isPublic
                  ? `${window.location.origin}/dashboard/s/${id}`
                  : window.location.href;

                navigator
                  .share({
                    title: snippet.title,
                    text: snippet.description,
                    url: shareUrl,
                  })
                  .catch(() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast({
                      title: "Link Copied!",
                      description: "Share link has been copied to clipboard",
                    });
                  });
              }}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleVisibilityToggle}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
            >
              {snippet.isPublic ? (
                <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
              ) : (
                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                router.push(`/dashboard/snippets/editsnippets/${id}`)
              }
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
            >
              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
            </Button>
          </div>
        </div>

        {/* Description and Tags */}
        <div className="space-y-2 sm:space-y-3">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {snippet.description}
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {snippet.tags?.map((tag: string) => (
              <Badge
                key={tag}
                className={cn(
                  "px-1.5 sm:px-2 py-0.5",
                  "text-[10px] sm:text-xs",
                  "bg-zinc-100 dark:bg-zinc-800/50",
                  "hover:bg-zinc-200 dark:hover:bg-zinc-800",
                  "text-zinc-600 dark:text-zinc-400",
                  "border border-zinc-200/20 dark:border-zinc-700/30",
                  "transition-all duration-200",
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
            <div className="flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2 bg-[#F3F4F6] dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="ml-2 sm:ml-3 flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    {snippet.language}
                  </span>
                  <div className="h-2.5 sm:h-3 w-[1px] bg-zinc-300 dark:bg-zinc-700" />
                  <span className="text-[10px] sm:text-xs text-zinc-500">
                    {snippet.code.split("\n").length} lines
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-6 sm:h-7 transition-all duration-200",
                  copied
                    ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400"
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                )}
              >
                {copied ? (
                  <span className="text-[10px] sm:text-xs">Copied!</span>
                ) : (
                  <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                )}
              </Button>
            </div>

            {/* Code Content */}
            <div className="max-h-[300px] sm:max-h-[400px] overflow-hidden">
              <div
                className={cn(
                  "overflow-y-auto",
                  "overflow-x-hidden",
                  "max-h-[300px] sm:max-h-[400px]",
                  "p-2 sm:p-4",
                  "bg-[#F3F4F6] dark:bg-zinc-900",
                  "text-[11px] sm:text-sm leading-relaxed",
                  // Scrollbar styling
                  "scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700",
                  "scrollbar-track-transparent",
                  "hover:overflow-x-auto",
                  "[&::-webkit-scrollbar-horizontal]:hidden",
                  "[-ms-overflow-style:none]",
                  "[scrollbar-width:none]",
                  // ... (syntax highlighting classes)
                )}
              >
                <pre className="text-[11px] sm:text-sm leading-relaxed">
                  <code
                    className={`font-mono language-${snippet.language}`}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(snippet.code, {
                        language: snippet.language || "plaintext",
                      }).value,
                    }}
                  />
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default SnippetDetail;
