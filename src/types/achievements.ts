import { LucideProps } from 'lucide-react';

export type AchievementRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type AchievementCategory = 'milestone' | 'engagement' | 'streak';
export type AchievementColor = 'yellow' | 'blue' | 'violet' | 'indigo' | 'orange' | 'red' | 'pink' | 'purple' | 'emerald' | 'cyan' | 'amber';
export type AchievementIcon = keyof typeof import('lucide-react');

export interface AchievementCriteria {
  type: 'boolean' | 'count';
  metric: string;
  threshold: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  rarity: AchievementRarity;
  color: AchievementColor;
  category: AchievementCategory;
  criteria: AchievementCriteria;
}

// Add this new interface for API responses
export interface ApiAchievement extends Achievement {
  _id?: string;
  userId?: string;
  achievementId: string;
  type?: string;
  current?: number;
  threshold?: number;
  progress: number;
  unlockedAt?: Date;
  lastUpdated?: Date;
  metrics?: {
    snippetsCreated: number;
    likesReceived: number;
    dailyStreak: number;
    commentsReceived: number;
    viewsReceived: number;
    joinDate: number;
  };
}
