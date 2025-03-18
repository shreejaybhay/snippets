import type { Achievement } from '@/types/achievements';

export const ACHIEVEMENTS = [
  {
    id: 'early-adopter',
    title: "Early Adopter",
    description: "Joined in the first month of launch",
    icon: "Award",
    rarity: 'Rare',
    color: 'yellow',
    category: 'milestone',
    criteria: {
      type: 'boolean',
      metric: 'joinDate',
      threshold: 1
    }
  },
  {
    id: 'snippet-creator',
    title: "Snippet Creator",
    description: "Created your first code snippet",
    icon: 'Code',
    rarity: 'Common',
    color: 'blue',
    category: 'milestone',
    criteria: {
      type: 'boolean',
      metric: 'snippetsCreated',
      threshold: 1
    }
  },
  {
    id: 'discussion-starter',
    title: "Discussion Starter",
    description: "Received your first comment",
    icon: 'MessageSquare',
    rarity: 'Common',
    color: 'violet',
    category: 'engagement',
    criteria: {
      type: 'boolean',
      metric: 'commentsReceived',
      threshold: 1
    }
  },
  {
    id: 'getting-noticed',
    title: "Getting Noticed",
    description: "Snippet viewed 10 times",
    icon: 'Eye',
    rarity: 'Common',
    color: 'indigo',
    category: 'engagement',
    criteria: {
      type: 'count',
      metric: 'viewsReceived',
      threshold: 10
    }
  },
  {
    id: 'streak-starter',
    title: "Streak Starter",
    description: "Maintain a 3-day login streak",
    icon: 'Flame',
    rarity: 'Common',
    color: 'orange',
    category: 'streak',
    criteria: {
      type: 'count',
      metric: 'dailyStreak',
      threshold: 3
    }
  },
  {
    id: 'weekly-warrior',
    title: "Weekly Warrior",
    description: "Maintain a 7-day login streak",
    icon: 'Flame',
    rarity: 'Rare',
    color: 'red',
    category: 'streak',
    criteria: {
      type: 'count',
      metric: 'dailyStreak',
      threshold: 7
    }
  },
  {
    id: 'popular-creator',
    title: "Popular Creator",
    description: "Get 5 likes on your snippets",
    icon: 'Heart',
    rarity: 'Common',
    color: 'pink',
    category: 'engagement',
    criteria: {
      type: 'count',
      metric: 'likesReceived',
      threshold: 5
    }
  },
  {
    id: 'rising-star',
    title: "Rising Star",
    description: "Get 50 likes on your snippets",
    icon: 'Trophy',
    rarity: 'Epic',
    color: 'purple',
    category: 'engagement',
    criteria: {
      type: 'count',
      metric: 'likesReceived',
      threshold: 50
    }
  },
  {
    id: 'snippet-collector',
    title: "Snippet Collector",
    description: "Create 5 snippets",
    icon: 'FolderPlus',
    rarity: 'Common',
    color: 'emerald',
    category: 'milestone',
    criteria: {
      type: 'count',
      metric: 'snippetsCreated',
      threshold: 5
    }
  },
  {
    id: 'code-master',
    title: "Code Master",
    description: "Create 20 snippets",
    icon: 'Code2',
    rarity: 'Rare',
    color: 'cyan',
    category: 'milestone',
    criteria: {
      type: 'count',
      metric: 'snippetsCreated',
      threshold: 20
    }
  },
  {
    id: 'conversation-starter',
    title: "Conversation Starter",
    description: "Receive 10 comments on your snippets",
    icon: 'MessagesSquare',
    rarity: 'Common',
    color: 'blue',
    category: 'engagement',
    criteria: {
      type: 'count',
      metric: 'commentsReceived',
      threshold: 10
    }
  },
  {
    id: 'viral-sensation',
    title: "Viral Sensation",
    description: "Get 100 views on your snippets",
    icon: "TrendingUp",
    rarity: 'Epic',
    color: 'amber',
    category: 'engagement',
    criteria: {
      type: 'count',
      metric: 'viewsReceived',
      threshold: 100
    }
  }
] as const;

export type AchievementId = typeof ACHIEVEMENTS[number]['id'];
