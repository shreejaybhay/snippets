import { Notification } from "@/models/notification";

interface CreateNotificationParams {
  type: 'like' | 'follow' | 'comment' | 'mention' | 'achievement';
  recipientId: string;
  actorId: string;
  targetId?: string;
  metadata?: {
    snippetId?: string;
    snippetTitle?: string;
    [key: string]: any;
  };
}

export async function createNotification({
  type,
  recipientId,
  actorId,
  targetId,
  metadata
}: CreateNotificationParams) {
  try {
    // Generate appropriate message based on type
    const message = getNotificationMessage(type, metadata?.snippetTitle);

    const notification = await Notification.create({
      type,
      userId: recipientId, // This was missing - userId is recipientId
      actorId,
      targetId,
      message, // This was missing
      metadata,
      read: false,
      createdAt: new Date()
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

function getNotificationMessage(type: string, snippetTitle?: string): string {
  const snippetRef = snippetTitle ? ` "${snippetTitle}"` : '';
  
  switch (type) {
    case 'like':
      return `liked your snippet${snippetRef}`;
    case 'follow':
      return 'started following you';
    case 'comment':
      return `commented on your snippet${snippetRef}`;
    case 'mention':
      return `mentioned you in a snippet${snippetRef}`;
    case 'achievement':
      return 'earned a new achievement';
    default:
      return 'sent you a notification';
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await Notification.findByIdAndUpdate(notificationId, { read: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId: Types.ObjectId) {
  try {
    const response = await fetch("/api/notifications/mark-all-read", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
}
