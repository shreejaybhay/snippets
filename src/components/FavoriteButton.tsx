"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  snippetId: string;
  isFavorited: boolean;
  onFavoriteChange?: (snippetId: string, isFavorited: boolean) => void;
}

export default function FavoriteButton({
  snippetId,
  isFavorited,
  onFavoriteChange,
}: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(isFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsLoading(true);

    try {
      const method = favorite ? "DELETE" : "POST";
      const response = await fetch("/api/snippet/favorite", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snippetId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      const newFavoriteState = !favorite;
      setFavorite(newFavoriteState);
      onFavoriteChange?.(snippetId, newFavoriteState);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={cn(
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "transition-all duration-200",
        favorite ? "text-yellow-500" : "text-zinc-400"
      )}
    >
      <Star
        className={cn(
          "h-5 w-5",
          favorite ? "fill-yellow-500" : "fill-none",
          "transition-all duration-200"
        )}
      />
      <span className="sr-only">
        {favorite ? "Remove from favorites" : "Add to favorites"}
      </span>
    </Button>
  );
}
