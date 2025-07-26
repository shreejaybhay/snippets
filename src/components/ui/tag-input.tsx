"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag...",
  className,
  ...props
}: TagInputProps) {
  const [pendingTag, setPendingTag] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      trimmedTag.length >= 2 &&
      trimmedTag.length <= 20
    ) {
      onChange([...value, trimmedTag]);
    }
    setPendingTag("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(pendingTag);
    } else if (e.key === "Backspace" && !pendingTag && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleBlur = () => {
    if (pendingTag) {
      addTag(pendingTag);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 sm:gap-2 rounded-md border-2 border-input bg-background px-3 py-2",
        "dark:bg-[#1C1917]/60 bg-background/50",
        "placeholder:text-muted-foreground",
        "outline-none focus:outline-none focus-visible:outline-none",
        "ring-0 focus:ring-0 focus-visible:ring-0",
        "focus-within:border-emerald-500/20 dark:focus-within:border-emerald-500/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all duration-200",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          className="px-2 sm:px-2.5 py-0.5 h-6 sm:h-7 text-xs sm:text-sm 
            bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300
            border border-emerald-500/20 transition-colors duration-200"
        >
          #{tag}
          <button
            type="button"
            className="ml-1 cursor-pointer hover:text-emerald-900 dark:hover:text-emerald-100"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
          >
            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </button>
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={pendingTag}
        onChange={(e) => setPendingTag(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="flex-1 min-w-[100px] sm:min-w-[120px] h-6 sm:h-7 
          bg-transparent border-0 p-0 text-xs sm:text-sm 
          placeholder:text-muted-foreground text-foreground
          focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        {...props}
      />
    </div>
  );
}
