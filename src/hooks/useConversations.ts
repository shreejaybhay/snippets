import { useState, useEffect } from 'react';
import { MessagesService } from '@/services/messages';

export function useConversations(currentUserId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    // Subscribe to direct messages
    const unsubscribe = MessagesService.subscribeToMessages(
      { senderId: currentUserId },
      (messages) => {
        const conversationMap = new Map<string, Conversation>();

        messages.forEach(message => {
          const otherId = message.senderId === currentUserId 
            ? message.receiverId 
            : message.senderId;

          if (!otherId) return;

          const existing = conversationMap.get(otherId);
          const isUnread = !message.isRead && message.senderId !== currentUserId;

          if (!existing || message.timestamp > existing.lastMessage.timestamp) {
            conversationMap.set(otherId, {
              id: otherId,
              name: otherId, // You'll need to fetch user details separately
              isGroup: false,
              isPinned: existing?.isPinned || false,
              lastMessage: message,
              unreadCount: (existing?.unreadCount || 0) + (isUnread ? 1 : 0),
              online: false // You'll need to implement online status separately
            });
          }
        });

        setConversations(Array.from(conversationMap.values()));
      }
    );

    return () => unsubscribe();
  }, [currentUserId]);

  const markConversationAsRead = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || conversation.unreadCount === 0) return;

    // Update local state immediately
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 } 
          : conv
      )
    );

    // Mark messages as read in Firebase
    await MessagesService.markMessagesAsRead([conversation.lastMessage._id]);
  };

  return { conversations, markConversationAsRead };
}