"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;  // Make it optional
  onFollowToggle: (newIsFollowing: boolean) => void;
  onCountChange: (increment: boolean) => void;
}

export default function FollowButton({
  userId,
  initialIsFollowing = false,  // Provide default value
  onFollowToggle,
  onCountChange
}: FollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollow = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}/follow`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow user');
      }

      const data = await response.json();
      
      if (data.success) {
        setIsFollowing(data.isFollowing);
        onFollowToggle(data.isFollowing);
        onCountChange(data.isFollowing);
      } else {
        throw new Error(data.message || 'Failed to follow/unfollow user');
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast({
        title: "Error",
        description: "Failed to follow/unfollow user. Please try again.",
        variant: "destructive",
      });
      // Revert the state on error
      setIsFollowing(initialIsFollowing);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoading, onFollowToggle, onCountChange, initialIsFollowing]);

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      className={`w-32 ${
        isFollowing 
          ? "bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800" 
          : "bg-emerald-600 hover:bg-emerald-700 text-white"
      }`}
      onClick={handleFollow}
      disabled={isLoading}
      type="button"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}
