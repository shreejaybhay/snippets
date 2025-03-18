import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Heart, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  profileURL?: string;
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

interface CommentSectionProps {
  snippetId: string;
  comments: Comment[];
  currentUser: User | null;
  onCommentAdded: (snippetId: string, content: string) => Promise<any>;
  onDeleteComment?: (snippetId: string, commentId: string) => Promise<void>;
  onLoadMore?: () => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
  commentSort?: 'latest' | 'oldest' | 'popular';  // Make it optional
  onSortChange: (sort: 'latest' | 'oldest' | 'popular') => void;
}

export default function CommentSection({ 
  snippetId, 
  comments = [],
  currentUser,
  onCommentAdded,
  onDeleteComment,
  onLoadMore,
  onLikeComment,
  commentSort = 'latest',  // Add default value here
  onSortChange 
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment content is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onCommentAdded(snippetId, newComment.trim());
      setNewComment('');
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSortText = () => {
    if (!commentSort) return 'Latest';
    return commentSort.charAt(0).toUpperCase() + commentSort.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Comment Input Section */}
      <div className={cn(
        "p-4",
        "bg-zinc-50/80 dark:bg-zinc-800/50",
        "border border-zinc-200 dark:border-zinc-200/10",
        "rounded-xl",
        "backdrop-blur-[12px]",
        "transition-all duration-200",
      )}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            {currentUser?.profileURL ? (
              <AvatarImage src={currentUser.profileURL} alt={currentUser.username} />
            ) : (
              <AvatarFallback>
                {currentUser?.username?.[0]?.toUpperCase() || <UserIcon className="h-4 w-4" />}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={cn(
                "min-h-[80px] resize-none",
                "bg-white/50 dark:bg-zinc-900/50",
                "border border-zinc-200/50 dark:border-zinc-700/50",
                "rounded-lg",
                "p-3",
                "text-sm",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                "focus:border-emerald-500/30 dark:focus:border-emerald-500/30",
                "transition-colors duration-200"
              )}
            />
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-200/10">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {newComment.length > 0 && (
                  <span>{newComment.length} characters</span>
                )}
              </div>
              <Button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
                size="sm"
                className={cn(
                  "px-4 h-8",
                  "bg-emerald-600 dark:bg-emerald-600/90",
                  "hover:bg-emerald-700 dark:hover:bg-emerald-700",
                  "text-white",
                  "text-xs font-medium",
                  "rounded-md",
                  "transition-all duration-200",
                  "disabled:opacity-50",
                  "border border-emerald-600/30 dark:border-emerald-400/20"
                )}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Posting</span>
                  </div>
                ) : (
                  <span>Post</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/30 pb-4">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Comments ({comments.length})
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-sm font-medium bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700/50"
            >
              {getSortText()}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="">
            <DropdownMenuItem 
              onClick={() => onSortChange('latest')}
              className={cn("cursor-pointer", commentSort === 'latest' && "bg-zinc-100 dark:bg-zinc-800")}
            >
              Latest
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onSortChange('oldest')}
              className={cn("cursor-pointer", commentSort === 'oldest' && "bg-zinc-100 dark:bg-zinc-800")}
            >
              Oldest
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onSortChange('popular')}
              className={cn("cursor-pointer", commentSort === 'popular' && "bg-zinc-100 dark:bg-zinc-800")}
            >
              Popular
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Comments List */}
      <div className="h-[400px] overflow-y-auto pr-2 space-y-4 comments-scrollbar">
        {comments.map((comment, index) => (
          <motion.div
            key={comment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              ease: [0.23, 1, 0.32, 1]
            }}
            className={cn(
              "p-4 rounded-lg",
              "bg-zinc-50 dark:bg-zinc-800/50",
              "border border-zinc-200 dark:border-zinc-700/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {comment.userId.profileURL ? (
                    <AvatarImage src={comment.userId.profileURL} alt={comment.userId.username} />
                  ) : (
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{comment.userId.username}</p>
                  <p className="text-xs text-zinc-500">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Like Button */}
                {onLikeComment && currentUser && (
                  <button
                    onClick={() => onLikeComment(comment._id)}
                    disabled={isSubmitting}
                    className={cn(
                      "flex items-center gap-2",
                      "px-2.5 py-1.5 rounded-md",
                      "bg-zinc-100 dark:bg-zinc-800",
                      "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                      "text-zinc-600 dark:text-zinc-300",
                      "transition-colors duration-200",
                      "text-sm",
                      "border border-zinc-200/50 dark:border-zinc-700/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 transition-colors",
                        comment.likes.includes(currentUser._id) && 
                        "fill-emerald-500 text-emerald-500"
                      )}
                    />
                    <span>{comment.likes.length}</span>
                  </button>
                )}

                {/* Delete Button - Only show for comment owner */}
                {currentUser && comment.userId._id === currentUser._id && onDeleteComment && (
                  <button
                    onClick={() => onDeleteComment(snippetId, comment._id)}
                    className={cn(
                      "flex items-center gap-2",
                      "px-2.5 py-1.5 rounded-md",
                      "bg-zinc-100 dark:bg-zinc-800",
                      "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                      "text-zinc-600 dark:text-zinc-300",
                      "transition-colors duration-200",
                      "text-sm",
                      "border border-zinc-200/50 dark:border-zinc-700/50",
                      "hover:text-red-500 dark:hover:text-red-400"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {onLoadMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onLoadMore()}
        >
          Load More Comments
        </Button>
      )}
    </div>
  );
}
