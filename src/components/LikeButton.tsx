import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  snippetId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  onLikeStateChange: (isLiked: boolean, likesCount: number) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  snippetId,
  initialLiked,
  initialLikesCount,
  onLikeStateChange,
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const { toast } = useToast();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    setIsLiked(initialLiked);
    setLikesCount(initialLikesCount);
  }, [initialLiked, initialLikesCount]);

  const handleLike = async () => {
    if (!snippetId) return;

    try {
      const response = await fetch(`${BASE_URL}/api/snippet/public/${snippetId}/like`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      
      if (data.success) {
        setIsLiked(data.liked);
        setLikesCount(data.likesCount);
        onLikeStateChange(data.liked, data.likesCount);
      } else {
        toast({
          title: "Error",
          description: "Failed to update like status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating like status:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      disabled={!snippetId}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isLiked && "fill-current text-red-500"
        )}
      />
      <span className="text-sm">{likesCount}</span>
    </button>
  );
};

export default LikeButton;
