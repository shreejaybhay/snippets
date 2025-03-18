"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: string;
  isFavorite?: boolean;
  isPinned?: boolean;
}

interface SnippetCardProps {
  snippet: Snippet;
  onMove?: (snippetId: string) => Promise<void>; // Make it optional with '?'
}

const SnippetCard: React.FC<SnippetCardProps> = ({ snippet }) => {
  const router = useRouter();

  if (!snippet) {
    return <p className="text-red-500">Error: Snippet data is missing.</p>;
  }

  return (
    <div
      key={snippet.id}
      onClick={() => router.push(`/dashboard/snippets/${snippet.id}`)}
      className={cn(
        // Base card styles
        "group/card relative overflow-hidden",
        "p-5 rounded-xl border",
        "bg-white/60 dark:bg-[#161514]",
        "backdrop-blur-[12px]",
        "border-green-200/20 dark:border-green-100/10 shadow-md",
        // Make card content more readable in single column
        "md:max-w-3xl md:mx-auto md:w-full",
        // Glow effect that follows cursor
        "before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition-opacity before:duration-500",
        "after:absolute after:inset-0 after:-z-10 after:opacity-0 after:transition-opacity after:duration-500",
        "after:bg-[radial-gradient(600px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(52,211,153,0.06),transparent_40%)]",
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
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="mt-1 shrink-0">
            <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-500/10">
              <Code2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 pr-8 truncate">
              {snippet.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
              {snippet.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              {snippet.language}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex flex-wrap gap-2 max-h-6 overflow-hidden">
              {snippet.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors truncate max-w-[150px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;
