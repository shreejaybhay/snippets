import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/utils/auth";
import mongoose from 'mongoose';
import { ACHIEVEMENTS } from "@/config/achievements";

// Updated schema to match all possible metrics from our achievements config
const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  achievementId: { type: String, required: true },
  progress: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  unlockedAt: Date,
  lastUpdated: { type: Date, default: Date.now },
  metrics: {
    snippetsCreated: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    dailyStreak: { type: Number, default: 0 },
    commentsReceived: { type: Number, default: 0 },
    viewsReceived: { type: Number, default: 0 },
    joinDate: { type: Number, default: 0 }
  },
  type: String,
  title: String,
  description: String,
  threshold: Number,
  icon: String,
  rarity: String,
  color: String,
  category: String
});

const AchievementModel = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user || user instanceof NextResponse) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    // Get existing achievements
    let existingAchievements = await AchievementModel.find({ userId: user._id });

    // If no achievements exist or if the count doesn't match ACHIEVEMENTS config
    if (existingAchievements.length !== ACHIEVEMENTS.length) {
      // Create a map of existing achievements by ID
      const existingMap = new Map(existingAchievements.map(a => [a.achievementId, a]));
      
      // Create missing achievements
      const newAchievements = await Promise.all(ACHIEVEMENTS.map(async (achievement) => {
        const oldStyleId = achievement.id.toUpperCase().replace(/-/g, '_');
        if (!existingMap.has(achievement.id) && !existingMap.has(oldStyleId)) {
          return AchievementModel.create({
            userId: user._id,
            achievementId: achievement.id, // Use the new ID format
            type: achievement.criteria.metric,
            title: achievement.title,
            description: achievement.description,
            threshold: achievement.criteria.threshold,
            rarity: achievement.rarity,
            icon: achievement.icon,
            color: achievement.color,
            category: achievement.category,
            progress: 0,
            metrics: {
              snippetsCreated: 0,
              likesReceived: 0,
              dailyStreak: 0,
              commentsReceived: 0,
              viewsReceived: 0,
              joinDate: 0
            }
          });
        }
        return existingMap.get(achievement.id) || existingMap.get(oldStyleId);
      }));

      // Update existingAchievements with all achievements
      existingAchievements = await AchievementModel.find({ userId: user._id });
    }

    // Map the achievements to include all necessary data
    const fullAchievements = existingAchievements.map(achievement => {
      const configAchievement = ACHIEVEMENTS.find(a => a.id === achievement.achievementId);
      return {
        ...achievement.toObject(),
        ...configAchievement,
        metrics: achievement.metrics || {},
        unlockedAt: achievement.unlockedAt
      };
    });


    return NextResponse.json({
      success: true,
      achievements: fullAchievements
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { message: "Error fetching achievements", success: false },
      { status: 500 }
    );
  }
}
