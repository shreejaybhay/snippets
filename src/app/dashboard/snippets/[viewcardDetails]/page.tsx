"use client";

import { useEffect, useState } from "react";
import { Copy, Pencil, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css"; // ✅ Verified dark mode-friendly theme
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: string;
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

  // Fetch snippet data from API
  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/snippet/add-snippets/${id}`, {
          method: "GET",
          credentials: "include",
        });

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
      const response = await fetch(`${BASE_URL}/api/snippet/add-snippets/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        // Base card styles
        "group/card relative overflow-hidden",
        "p-3 sm:p-5 mt-5", // Added margin-top for mobile
        "rounded-xl border",
        "bg-white/60 dark:bg-[#1C1917]/40 shadow-md",
        "backdrop-blur-[12px]",
        "border-green-200/20 dark:border-green-100/10",
        "space-y-4 sm:space-y-6", // Adjusted spacing for mobile
        // Glow effect that follows cursor (desktop only)
        "sm:before:absolute sm:before:inset-0 sm:before:-z-10 sm:before:opacity-0 sm:before:transition-opacity sm:before:duration-500",
        "sm:after:absolute sm:after:inset-0 sm:after:-z-10 sm:after:opacity-0 sm:after:transition-opacity sm:after:duration-500",
        "sm:after:bg-[radial-gradient(600px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(52,211,153,0.06),transparent_80%)]",
        "dark:hover:border-zinc-700",
        "hover:shadow-lg dark:hover:shadow-zinc-900/30",
        "hover:after:opacity-100",
        // Transition
        "transition-all duration-200"
      )}
      onMouseMove={(e) => {
        if (window.innerWidth > 640) { // Only track mouse on desktop
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--mouse-x",
            `${e.clientX - rect.left}px`
          );
          e.currentTarget.style.setProperty(
            "--mouse-y",
            `${e.clientY - rect.top}px`
          );
        }
      }}
    >
      {/* Title Section with animation */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white break-words">
          {snippet.title}
        </h1>
        <Badge variant="outline" className="self-start sm:self-center text-gray-600 dark:text-gray-300">
          {snippet.language.toUpperCase()}
        </Badge>
      </motion.div>

      {/* Description with animation */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="text-base sm:text-lg text-gray-600 dark:text-gray-400"
      >
        {snippet.description}
      </motion.p>

      {/* Tags with animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        {snippet.tags?.map((tag: string) => (
          <Badge
            key={tag}
            className="text-sm bg-green-500/20 text-green-500 hover:bg-green-500/20"
          >
            #{tag}
          </Badge>
        ))}
      </motion.div>

      {/* Code Section with animation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="relative bg-zinc-900 text-white rounded-xl shadow-lg overflow-hidden">
          <CardContent className="p-3 sm:p-5">
            <div className="relative overflow-x-auto max-w-full rounded-lg scrollbar-hide">
              <pre className="relative p-2 sm:p-4 rounded-lg break-words whitespace-pre-wrap text-sm sm:text-base">
                <code
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlight(snippet.code, {
                      language: snippet.language || "plaintext",
                    }).value,
                  }}
                />
              </pre>
            </div>

            {/* Copy Button with animation */}
            <Button
              onClick={handleCopy}
              size="sm"
              className={cn(
                "absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5",
                copied ? "bg-green-500 text-white" : "bg-gray-800 text-gray-300"
              )}
            >
              {copied ? "Copied!" : <Copy className="h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Actions */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          Created on {new Date(snippet.createdAt).toLocaleDateString()}
        </motion.p>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Edit Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/dashboard/snippets/editsnippets/${id}`)}
            className="hover:bg-blue-500/10 text-gray-600 dark:text-gray-300 bg-[#252726]"
          >
            <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
          </Button>

          {/* Share Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              navigator.share({
                title: snippet.title,
                text: snippet.description,
                url: window.location.href,
              })
            }
            className="hover:bg-green-500/10 text-gray-600 dark:text-gray-300 bg-[#252726]"
          >
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Delete Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="bg-red-500/90 hover:bg-red-500 text-white dark:bg-red-600/90 dark:hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/20 dark:border-zinc-700/30 backdrop-blur-xl max-w-[90vw] sm:max-w-lg">
              <AlertDialogHeader className="space-y-3">
                <AlertDialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Delete Snippet
                </AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400 text-base">
                  Are you sure you want to delete this snippet? This action
                  cannot be undone and will permanently remove the snippet from
                  your collection.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-2 sm:gap-0">
                <AlertDialogCancel
                  className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 
                  text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 
                  transition-colors w-full sm:w-auto"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 
                  text-white transition-colors w-full sm:w-auto"
                >
                  Delete Snippet
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </motion.div>
  );
};

export default SnippetDetail;
