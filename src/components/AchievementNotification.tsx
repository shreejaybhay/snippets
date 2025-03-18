
import { Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Achievement } from '@/types/achievements';
import { createNotification } from '@/utils/notifications';

export async function showAchievementUnlock(achievement: Achievement, userId: string) {
  const { toast } = useToast();
  
  // Show toast notification
  toast({
    title: "Achievement Unlocked!",
    description: (
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-yellow-500" />
        <span>{achievement.title}</span>
      </div>
    ),
    duration: 5000,
    className: "achievement-toast",
  });

  // Create notification in database
  try {
    await createNotification({
      userId,
      actorId: userId, // self notification for achievements
      type: 'achievement',
      metadata: {
        achievementId: achievement.id,
        achievementTitle: achievement.title
      }
    });
  } catch (error) {
    console.error('Failed to create achievement notification:', error);
  }
}
