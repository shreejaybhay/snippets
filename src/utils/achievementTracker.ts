import { Achievement } from "@/models/Achievement";
import { ACHIEVEMENTS } from "@/config/achievements";

export async function trackAchievementProgress(userId: string, metric: string, value: number) {
  try {
    console.log(`Tracking achievement progress for user ${userId}, metric: ${metric}, value: ${value}`);

    // Find the achievement config
    const achievementConfig = ACHIEVEMENTS.find(a => 
      a.id === metric || 
      a.id.toLowerCase() === metric.toLowerCase() ||
      a.id.toUpperCase().replace(/-/g, '_') === metric.toUpperCase().replace(/-/g, '_')
    );

    if (!achievementConfig) {
      console.log(`No achievement configuration found for metric: ${metric}`);
      return;
    }

    const threshold = achievementConfig.criteria.threshold;
    const type = achievementConfig.criteria.metric;

    // Use the new createOrUpdate method
    const updatedAchievement = await Achievement.createOrUpdate(
      userId,
      achievementConfig.id, // Use the canonical ID from config
      value,
      threshold,
      type
    );

    console.log('Achievement updated:', {
      id: updatedAchievement._id,
      achievementId: updatedAchievement.achievementId,
      current: updatedAchievement.current,
      progress: updatedAchievement.progress,
      threshold: updatedAchievement.threshold,
      unlockedAt: updatedAchievement.unlockedAt
    });

    return updatedAchievement;

  } catch (error) {
    console.error('Error tracking achievement progress:', error);
    throw error;
  }
}
