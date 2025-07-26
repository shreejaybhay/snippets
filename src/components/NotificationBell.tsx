"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, Heart, UserPlus, MessageSquare, AtSign, Trophy, X, User } from "lucide-react";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSSE } from '@/hooks/use-sse';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface NotificationActor {
  _id: string;
  username: string;
  profileURL: string | null;
}

interface Notification {
  _id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'achievement';
  actorId: string;
  targetId: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata: {
    snippetId?: string;
    snippetTitle?: string;
    commentContent?: string;
    achievementId?: string;
    achievementTitle?: string;
    [key: string]: any;
  };
  actor: NotificationActor;
}

interface NotificationItemProps {
  notification: Notification;
  markAsRead: (notificationId: string) => Promise<void>;
  onClose: () => void;
}

const NotificationItem = ({ notification, markAsRead, onClose }: NotificationItemProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const getActionColor = (type: Notification['type']) => {
    switch (type) {
      case 'like': return 'text-red-500';
      case 'follow': return 'text-blue-500';
      case 'comment': return 'text-green-500';
      case 'mention': return 'text-purple-500';
      case 'achievement': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getActionIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3 h-3 fill-current" />;
      case 'follow':
        return <UserPlus className="w-3 h-3" />;
      case 'comment':
        return <MessageSquare className="w-3 h-3" />;
      case 'mention':
        return <AtSign className="w-3 h-3" />;
      case 'achievement':
        return <Trophy className="w-3 h-3" />;
      default:
        return <Bell className="w-3 h-3" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    try {
      await markAsRead(notification._id);

      switch (notification.type) {
        case 'follow':
          if (notification.actor?._id) {
            router.push(`/dashboard/users/profile/${notification.actor._id}`);
          }
          break;

        case 'achievement':
          router.push('/dashboard/achievements');
          break;

        case 'like':
        case 'comment':
        case 'mention': {
          // First try to get snippetId from metadata
          let snippetId = notification.metadata?.snippetId;
          
          // If not found in metadata, try targetId
          if (!snippetId && notification.targetId) {
            snippetId = notification.targetId;
          }

          if (!snippetId) {
            console.error('Missing snippet reference in notification:', {
              notificationId: notification._id,
              type: notification.type,
              metadata: notification.metadata,
              targetId: notification.targetId
            });
            
            toast({
              title: "Error",
              description: `Unable to find the referenced snippet${notification.metadata?.snippetTitle ? ` "${notification.metadata.snippetTitle}"` : ''}`,
              variant: "destructive",
            });
            return;
          }

          router.push(`/dashboard/snippets/${snippetId}`);
          break;
        }

        default:
          console.warn('Unknown notification type:', notification.type);
      }

      onClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast({
        title: "Error",
        description: "Failed to process the notification",
        variant: "destructive",
      });
    }
  };

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.actor?._id) {
      router.push(`/dashboard/users/profile/${notification.actor._id}`);
      onClose();
    }
  };

  const renderNotification = (notification: Notification) => {
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    
    return (
      <div
        key={notification._id}
        className={cn(
          "flex items-start gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors bg-red-500",
          !notification.read && "bg-accent/20"
        )}
        onClick={handleClick}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={notification.actor?.profileURL || ''} />
          <AvatarFallback>{notification.actor?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <p className="text-sm">
            <span className="font-medium">{notification.actor?.username}</span>
            {' '}
            {getNotificationMessage(notification)}
          </p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>

        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-primary" />
        )}
      </div>
    );
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return 'started following you!';

      case 'like':
        return 'liked your snippet!';

      case 'comment':
        return 'commented on your snippet!';

      case 'mention':
        return 'mentioned you!';

      case 'achievement':
        return 'earned a new achievement!';

      default:
        return 'New notification!'; // Fallback for unknown types
    }
  };

  // Validate notification before rendering
  if (!notification || !notification.type) {
    console.error('Invalid notification data:', notification);
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        "p-4 hover:bg-muted/50 transition-all cursor-pointer relative group border-b border-border",
        !notification.read && "bg-muted/20 border-l-4 border-primary"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          {notification.actor?.profileURL ? (
            <div className="relative w-10 h-10 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-background ring-muted">
              <Image
                src={notification.actor.profileURL}
                alt={notification.actor.username}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-background ring-muted">
              <User className="w-6 h-6" />
            </div>
          )}
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full p-1.5",
            "shadow-lg ring-2 ring-background",
            notification.type === 'like' ? "bg-red-500" :
            notification.type === 'comment' ? "bg-green-500" :
            notification.type === 'follow' ? "bg-blue-500" :
            notification.type === 'mention' ? "bg-purple-500" :
            "bg-yellow-500"
          )}>
            <span className="text-white flex items-center justify-center">
              {getActionIcon(notification.type)}
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUsernameClick}
              className="font-semibold hover:underline focus:outline-none"
            >
              {notification.actor?.username || 'Unknown User'}
            </button>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {notification.createdAt ? formatTimeAgo(notification.createdAt) : ''}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {notification.message || 'New notification'}
          </p>
        </div>
        
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification._id);
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Mark as read</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<'markAll' | 'clear' | null>(null);
  const { toast } = useToast();
  interface SSENotificationData {
    type: 'notification';
    data: Omit<Notification, 'actor'> & {
      actor?: {
        _id: string;
        username: string;
        profileURL?: string;
      };
    };
  }

  const { data: sseData, error: sseError } = useSSE<SSENotificationData>(`${BASE_URL}/api/notifications/sse`);

  useEffect(() => {
    if (sseError) {
      console.log('SSE connection error:', sseError);
      // Handle error if needed
    }
  }, [sseError]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications", {
        credentials: "include"
      });
      const data = await res.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ read: true })
      });

      if (!res.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Update the local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress('markAll');
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Failed to mark all as read");
      }

      // Update local state immediately instead of refetching
      setNotifications(prev => prev.map(notification => ({
        ...notification,
        read: true
      })));
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const clearNotifications = async () => {
    if (actionInProgress) return;

    try {
      setActionInProgress('clear');
      const res = await fetch("/api/notifications/clear", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to clear notifications");
      }

      // Update local state immediately
      setNotifications([]);
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications cleared",
      });
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clear notifications",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(null);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sseData?.type === 'notification') {
      const formattedNotification: Notification = {
        ...sseData.data,
        actor: sseData.data.actor ? {
          _id: sseData.data.actor._id,
          username: sseData.data.actor.username,
          profileURL: sseData.data.actor.profileURL || null
        } : {
          _id: '',
          username: 'Unknown User',
          profileURL: null
        }
      };
      
      // Update notifications and unread count in a single state update
      setNotifications(prev => {
        const exists = prev.some(n => n._id === formattedNotification._id);
        if (exists) return prev;
        
        // If notification doesn't exist, increment unread count
        setUnreadCount(count => count + 1);
        
        return [formattedNotification, ...prev];
      });
    }
  }, [sseData]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "relative w-10 h-10 transition-all",
              unreadCount > 0 ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted/50 bg-muted/30"
            )}
          >
            <Bell className={cn(
              "h-[22px] w-[22px] transition-colors",
              unreadCount > 0 && "text-primary animate-bounce"
            )} />
          </Button>
        </PopoverTrigger>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium flex items-center justify-center text-white ring-2 ring-background"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <PopoverContent 
        className="w-[420px] p-0 shadow-lg border-none rounded-lg overflow-hidden"
        align="end"
        sideOffset={5}
      >
        <div className="flex items-center justify-between p-4 bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
          <h4 className="font-semibold text-lg">Notifications</h4>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={actionInProgress !== null}
                    className={cn(
                      "text-xs font-medium hover:bg-primary/10 hover:text-primary transition-all",
                      actionInProgress === 'markAll' && "opacity-70"
                    )}
                  >
                    {actionInProgress === 'markAll' ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : null}
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  disabled={actionInProgress !== null}
                  className={cn(
                    "text-xs font-medium hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-all",
                    actionInProgress === 'clear' && "opacity-70"
                  )}
                >
                  {actionInProgress === 'clear' ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  ) : null}
                  Clear all
                </Button>
              </>
            )}
          </div>
        </div>
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm mt-1">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification}
                  markAsRead={markAsRead}
                  onClose={() => setIsOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}


