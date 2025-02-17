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
        "flex flex-wrap gap-2 rounded-md border bg-transparent p-1.5",
        "border-input focus-within:ring-2 focus-within:ring-emerald-500/20",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300
            hover:bg-emerald-500/20 transition-colors"
        >
          #{tag}
          <button
            type="button"
            className="ml-1 rounded-full outline-none hover:text-emerald-900 
              dark:hover:text-emerald-100 focus:text-emerald-900 
              dark:focus:text-emerald-100"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
          >
            <X className="h-3 w-3" />
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
        className="flex-1 border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground 
          focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        {...props}
      />
    </div>
  );
}