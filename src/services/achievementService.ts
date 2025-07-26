import { Achievement } from '@/models/Achievement';
import { ACHIEVEMENTS } from '@/config/achievements';
import { showAchievementUnlock } from '@/components/AchievementNotification';

export class AchievementService {
  static async trackProgress(userId: string, metric: string, value: number) {
    try {
      // Get all user achievements
      let userAchievements = await Achievement.find({ userId });
      
      // Create missing achievements
      const existingIds = userAchievements.map(a => a.achievementId);
      const missingAchievements = ACHIEVEMENTS.filter(a => !existingIds.includes(a.id));
      
      if (missingAchievements.length > 0) {
        const newAchievements = missingAchievements.map(a => ({
          userId,
          achievementId: a.id,
          progress: 0,
          current: 0
        }));
        await Achievement.insertMany(newAchievements);
        userAchievements = await Achievement.find({ userId });
      }

      // Update achievements based on metric
      const updates = [];
      for (const achievement of userAchievements) {
        const config = ACHIEVEMENTS.find(a => a.id === achievement.achievementId);
        if (!config || config.criteria.metric !== metric) continue;

        let newProgress = 0;
        switch (config.criteria.type) {
          case 'count':
            newProgress = Math.min((value / config.criteria.threshold) * 100, 100);
            break;
          case 'streak':
            newProgress = Math.min((value / config.criteria.threshold) * 100, 100);
            break;
          case 'boolean':
            newProgress = value >= config.criteria.threshold ? 100 : 0;
            break;
        }

        if (newProgress !== achievement.progress) {
          updates.push({
            updateOne: {
              filter: { _id: achievement._id },
              update: {
                $set: {
                  progress: newProgress,
                  current: value,
                  ...(newProgress === 100 && { unlockedAt: new Date() }),
                  [`metrics.${metric}`]: value
                }
              }
            }
          });
        }
      }

      if (updates.length > 0) {
        await Achievement.bulkWrite(updates);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error tracking achievement progress:', error);
      return false;
    }
  }
}