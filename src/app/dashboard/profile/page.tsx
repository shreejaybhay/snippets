"use client";

import React, { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import { 
  Code, 
  Clock, 
  User, 
  Edit, 
  Award, 
  Heart, 
  MessageSquare, 
  Eye 
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "../../../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Achievement, ApiAchievement } from '@/types/achievements';
import { ACHIEVEMENTS } from '@/config/achievements';
import { Progress } from "@/components/ui/progress";
import FollowList from "@/components/FollowList";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface Snippet {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
  views?: number;
  language?: string;
}

interface UserData {
  success: boolean;
  user: {
    username: string;
    email: string;
    profileURL?: string;
    bannerURL?: string;
    createdAt: string;
    _id: string;
    followersCount: number;
    followingCount: number;
    followers?: {
      _id: string;
      username: string;
      profileURL?: string;
    }[];
    following?: {
      _id: string;
      username: string;
      profileURL?: string;
    }[];
  };
  snippets: Snippet[];
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface Activity {
  id: string;
  type: "snippet" | "like" | "comment" | "achievement" | "profile";
  date: string;
  title: string;
  icon: React.ReactNode;
  details?: string;
  snippetId?: string;
  metadata?: {
    likes?: number;
    comments?: number;
    views?: number;
    language?: string;
    rarity?: string;
    category?: string;
  };
}

interface AchievementCardProps {
  achievement: {
    id?: string;
    achievementId?: string;
    title: string;
    description: string;
    icon: keyof typeof LucideIcons;
    progress: number;
    current?: number;
    target?: number;
    rarity: string;
    color: string;
    unlockedAt?: string;
    category: string;
  };
  index: number;
}

const convertAchievement = (apiAchievement: ApiAchievement): AchievementCardProps['achievement'] => {
  // Find the matching achievement config
  const configAchievement = ACHIEVEMENTS.find(a => {
    // Match both new and old ID formats
    return a.id === apiAchievement.achievementId || 
           a.id.toUpperCase().replace(/-/g, '_') === apiAchievement.achievementId;
  });

  if (!configAchievement) {
    console.warn('No matching config found for achievement:', apiAchievement);
    return {
      title: apiAchievement.title || 'Unknown Achievement',
      description: apiAchievement.description || '',
      icon: 'Award' as keyof typeof LucideIcons,
      progress: 0,
      rarity: apiAchievement.rarity || 'Common',
      color: 'gray',
      category: 'unknown',
    };
  }

  const metric = apiAchievement.type || configAchievement.criteria.metric;
  const currentValue = typeof apiAchievement.current === 'number' ? apiAchievement.current : 0;
  const threshold = apiAchievement.threshold || configAchievement.criteria.threshold;
  const criteriaType = configAchievement.criteria.type;

  // Calculate progress based on the achievement type
  let progress = 0;
  if (criteriaType === 'boolean') {
    progress = currentValue >= threshold ? 100 : 0;
  } else {
    progress = Math.min(100, Math.floor((currentValue / threshold) * 100));
  }

  // If progress is 100 but no unlockedAt, use lastUpdated
  const unlockedDate = apiAchievement.unlockedAt || 
    (progress === 100 ? apiAchievement.lastUpdated : undefined);

  return {
    id: configAchievement.id,
    achievementId: configAchievement.id,
    title: configAchievement.title,
    description: configAchievement.description,
    icon: configAchievement.icon as keyof typeof LucideIcons,
    progress: progress,
    current: currentValue,
    target: threshold,
    rarity: configAchievement.rarity,
    color: configAchievement.color,
    category: configAchievement.category,
    unlockedAt: unlockedDate?.toString()
  };
};

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      when: "beforeChildren"
    }
  }
};

const sharedVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.8
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1] // Custom easing for smooth animation
    }
  }
};

// Use the same variants for both dots and items
const itemVariants = sharedVariants;
const dotVariants = sharedVariants;

const Profile: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [achievements, setAchievements] = useState<ApiAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast, router, BASE_URL]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/api/achievements`);
        const data = await response.json();
        console.log('Raw achievement data:', data); // Debug log
        
        if (data.success && data.achievements) {
          setAchievements(data.achievements);
        } else {
          throw new Error(data.message || 'Failed to load achievements');
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const stats: StatItem[] = [
    {
      label: "Total Snippets",
      value: userData?.snippets?.length || 0,
      icon: <LucideIcons.Code className="w-5 h-5" />,
    },
    {
      label: "Days Active",
      value: userData?.user
        ? Math.ceil(
            (new Date().getTime() -
              new Date(userData.user.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
      icon: <LucideIcons.Clock className="w-5 h-5" />,
    },
    {
      label: "Followers",
      value: userData?.user?.followersCount || 0,
      icon: <LucideIcons.Users className="w-5 h-5" />,
      onClick: () => setActiveTab("connections")
    },
    {
      label: "Following",
      value: userData?.user?.followingCount || 0,
      icon: <LucideIcons.UserPlus className="w-5 h-5" />,
      onClick: () => setActiveTab("connections")
    },
  ];

  const getActivityHistory = (): Activity[] => {
    const activities: Activity[] = [
      // Snippet creation activities
      ...(userData?.snippets?.map((snippet: any) => ({
        id: `snippet-${snippet._id}`,
        type: "snippet" as const,
        date: snippet.createdAt || new Date().toISOString(),
        title: "Created a new snippet",
        details: snippet.title || "Untitled Snippet",
        icon: <Code className="w-4 h-4 text-emerald-500" />,
        snippetId: snippet._id,
        metadata: {
          likes: Number(snippet.likesCount) || 0,
          comments: Number(snippet.commentsCount) || 0,
          views: Number(snippet.views) || 0,
          language: snippet.language || 'text'
        }
      })) || []),

      // Achievement activities
      ...(achievements
        .filter((achievement: ApiAchievement) => achievement.unlockedAt)
        .map((achievement: ApiAchievement) => {
          // Find the matching achievement in ACHIEVEMENTS config
          const configAchievement = ACHIEVEMENTS.find(a => 
            a.id === achievement.achievementId || 
            a.id.toUpperCase().replace(/-/g, '_') === achievement.achievementId
          );

          if (!configAchievement) {
            console.warn('No matching achievement found for:', achievement.achievementId);
            return undefined;
          }

          // Get the specific icon component from LucideIcons
          const IconComponent = LucideIcons[configAchievement.icon as keyof typeof LucideIcons] as React.ElementType;
          
          if (!IconComponent) {
            console.warn('No matching icon found for:', configAchievement.icon);
            return undefined;
          }

          return {
            id: `achievement-${achievement.achievementId}`,
            type: "achievement" as const,
            date: achievement.unlockedAt?.toString() || new Date().toISOString(),
            title: "Earned achievement",
            details: configAchievement.title,
            icon: (
              <div className={cn(
                "p-1 rounded",
                `bg-${configAchievement.color}-500/10`
              )}>
                <IconComponent 
                  className={cn(
                    "w-4 h-4",
                    `text-${configAchievement.color}-500`
                  )}
                />
              </div>
            ),
            metadata: {
              rarity: configAchievement.rarity,
              category: configAchievement.category
            }
          } as Activity;
        })
        .filter((activity): activity is Activity => activity !== undefined) || []),

      // Profile activities
      {
        id: 'profile-created',
        type: "profile" as const,
        date: userData?.user.createdAt || new Date().toISOString(),
        title: "Joined Snippets",
        icon: <User className="w-4 h-4 text-blue-500" />,
        details: `Welcome ${userData?.user.username}!`
      }
    ];

    // Sort activities by date (most recent first)
    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="relative w-4 h-8 text-transparent">
          <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-[#10B981] animate-loader"></div>
          <div className="absolute top-0 left-0 w-3.5 h-8 bg-[#10B981] animate-loader delay-150"></div>
          <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-[#10B981] animate-loader delay-300"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const AchievementCard: React.FC<AchievementCardProps> = ({
    achievement,
    index,
  }) => {
    const IconComponent = LucideIcons[achievement.icon] as React.FC<{
      className?: string;
    }>;

    // Calculate progress percentage
    const progressPercentage = achievement.current !== undefined && achievement.target !== undefined
      ? Math.min(100, Math.floor((achievement.current / achievement.target) * 100))
      : achievement.progress;

    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        custom={index}
        className="h-full"
      >
        <Card className="overflow-hidden dark:bg-[#161514] group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
          <CardContent className="p-6 flex flex-col flex-1">
            <div className="flex flex-col h-full justify-between space-y-4">
              {/* Header section with icon and title */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      {
                        'bg-yellow-500/10': achievement.color === 'yellow',
                        'bg-blue-500/10': achievement.color === 'blue',
                        'bg-violet-500/10': achievement.color === 'violet',
                        'bg-indigo-500/10': achievement.color === 'indigo',
                        'bg-orange-500/10': achievement.color === 'orange',
                        'bg-red-500/10': achievement.color === 'red',
                        'bg-pink-500/10': achievement.color === 'pink',
                        'bg-purple-500/10': achievement.color === 'purple',
                        'bg-emerald-500/10': achievement.color === 'emerald',
                        'bg-cyan-500/10': achievement.color === 'cyan',
                        'bg-amber-500/10': achievement.color === 'amber',
                      }
                    )}
                  >
                    <IconComponent
                      className={cn(
                        "w-6 h-6",
                        {
                          'text-yellow-500': achievement.color === 'yellow',
                          'text-blue-500': achievement.color === 'blue',
                          'text-violet-500': achievement.color === 'violet',
                          'text-indigo-500': achievement.color === 'indigo',
                          'text-orange-500': achievement.color === 'orange',
                          'text-red-500': achievement.color === 'red',
                          'text-pink-500': achievement.color === 'pink',
                          'text-purple-500': achievement.color === 'purple',
                          'text-emerald-500': achievement.color === 'emerald',
                          'text-cyan-500': achievement.color === 'cyan',
                          'text-amber-500': achievement.color === 'amber',
                        }
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress section */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {progressPercentage === 100 ? "Completed" : "In Progress"}
                  </span>
                  {achievement.current !== undefined && achievement.target !== undefined && (
                    <span>
                      {achievement.current} / {achievement.target}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress 
                    value={progressPercentage}
                    className="h-2 bg-muted/30"
                    indicatorClassName={cn(
                      "transition-all",
                      {
                        'bg-yellow-500': achievement.color === 'yellow',
                        'bg-blue-500': achievement.color === 'blue',
                        'bg-violet-500': achievement.color === 'violet',
                        'bg-indigo-500': achievement.color === 'indigo',
                        'bg-orange-500': achievement.color === 'orange',
                        'bg-red-500': achievement.color === 'red',
                        'bg-pink-500': achievement.color === 'pink',
                        'bg-purple-500': achievement.color === 'purple',
                        'bg-emerald-500': achievement.color === 'emerald',
                        'bg-cyan-500': achievement.color === 'cyan',
                        'bg-amber-500': achievement.color === 'amber',
                      }
                    )}
                  />
                </div>
              </div>

              {/* Footer with rarity badge */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    achievement.rarity === "Common" && "bg-zinc-200 dark:bg-zinc-800",
                    achievement.rarity === "Rare" && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
                    achievement.rarity === "Epic" && "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                  )}
                >
                  {achievement.rarity}
                </Badge>
                {achievement.unlockedAt && (
                  <span className="text-xs text-muted-foreground">
                    Unlocked {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const AchievementsContent: React.FC<{
    isLoading: boolean;
    error: string | null;
    achievements: ApiAchievement[];
  }> = ({ isLoading, error, achievements }) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`loading-${i}`} className="dark:bg-[#161514]">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="dark:bg-[#161514]">
          <CardContent className="p-6 text-center">
            <LucideIcons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Achievements</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      );
    }

    if (!achievements || achievements.length === 0) {
      return (
        <Card className="col-span-full dark:bg-[#161514]">
          <CardContent className="p-6 text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start creating and sharing snippets to earn achievements!
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements
          .map((achievement) => convertAchievement(achievement))
          .filter((achievement): achievement is NonNullable<typeof achievement> => achievement !== null)
          .map((achievement, index) => (
            <AchievementCard
              key={achievement.achievementId || `achievement-${index}`} // Use achievementId as key, fallback to index
              achievement={achievement}
              index={index}
            />
          ))}
      </div>
    );
  };

  const renderActivityCard = (activity: Activity) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case "snippet":
          return <Code className="w-4 h-4 text-emerald-500" />;
        case "achievement": {
          // Find the matching achievement config
          const configAchievement = ACHIEVEMENTS.find(a => 
            a.id === activity.id.replace('achievement-', '') || 
            a.id.toUpperCase().replace(/-/g, '_') === activity.id.replace('achievement-', '')
          );

          if (!configAchievement) return <Award className="w-4 h-4 text-yellow-500" />;

          const IconComponent = LucideIcons[configAchievement.icon as keyof typeof LucideIcons] as React.ElementType;
          
          return (
            <div className={cn(
              "p-1 rounded",
              `bg-${configAchievement.color}-500/10`
            )}>
              <IconComponent 
                className={cn(
                  "w-4 h-4",
                  `text-${configAchievement.color}-500`
                )} 
              />
            </div>
          );
        }
        case "profile":
          return <User className="w-4 h-4 text-blue-500" />;
        default:
          return activity.icon;
      }
    };

    return (
      <div className="group relative flex flex-col gap-2 rounded-lg border p-3 hover:bg-accent transition-colors">
        <div className="flex items-center gap-3">
          {getActivityIcon()}
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.title}</p>
            <p className="text-sm text-muted-foreground">{activity.details}</p>
            {activity.metadata && activity.type === "snippet" && (
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {activity.metadata.likes}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {activity.metadata.comments}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {activity.metadata.views}
                </div>
              </div>
            )}
          </div>
          <time className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
          </time>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 mt-3 md:mt-0">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[2000px] mx-auto space-y-6"
      >
        {/* Profile Header Card */}
        <motion.div variants={itemVariants}>
          <Card className="dark:bg-[#161514] overflow-hidden">
            {/* Banner Section */}
            <div className="relative h-48 w-full">
              {userData.user.bannerURL ? (
                <Image
                  src={userData.user.bannerURL}
                  alt="Profile banner"
                  fill
                  className="object-cover w-full"
                  priority
                  sizes="100vw"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-emerald-600 relative">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                </div>
              )}
            </div>

            <CardHeader className="space-y-4 dark:bg-[#161514] rounded-xl relative">
              <div
                className="flex items-center justify-between relative z-10 cursor-pointer transition-opacity -mt-12"
                onClick={() => router.push("/dashboard/profile/edit")}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <motion.div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white dark:border-[#161514] bg-white dark:bg-[#161514]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {userData.user.profileURL ? (
                      <Image
                        src={userData.user.profileURL}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                        <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                    )}
                  </motion.div>
                  <motion.div variants={itemVariants} className="pt-8">
                    <h1 className="text-xl sm:text-2xl font-bold">
                      {userData.user.username}
                    </h1>
                    <p className="text-sm sm:text-base text-zinc-400">
                      {userData.user.email}
                    </p>
                    <p className="text-sm text-zinc-400 mt-1">
                      Joined{" "}
                      {format(
                        new Date(userData.user.createdAt),
                        "MMMM d, yyyy"
                      )}
                    </p>
                  </motion.div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative z-50"
                >
                  <Link
                    href="/dashboard/profile/edit"
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-zinc-800 transition-colors inline-flex items-center justify-center cursor-pointer"
                    role="button"
                    aria-label="Edit Profile"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-5 h-5 text-emerald-500" />
                  </Link>
                </motion.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px] dark:bg-[#161514]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6 pb-6">
              {/* Stats Grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                variants={containerVariants}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring" }}
                    onClick={stat.onClick}
                    className={cn(
                      "cursor-pointer",
                      stat.onClick && "hover:opacity-80 transition-opacity"
                    )}
                  >
                    <Card className="dark:bg-[#161514]">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center space-x-3">
                          <div className="text-emerald-500">{stat.icon}</div>
                          <div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {stat.label}
                            </p>
                            <p className="text-xl sm:text-2xl font-bold">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Recent Snippets */}
              <motion.div variants={itemVariants}>
                <Card className="dark:bg-[#161514]">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Recent Snippets
                      </h2>
                      {userData.snippets.length > 5 && (
                        <Link
                          href="/dashboard/snippets"
                          className="text-sm text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          View all
                        </Link>
                      )}
                    </div>
                    <motion.div
                      className="space-y-3 sm:space-y-4"
                      variants={containerVariants}
                    >
                      {[...userData.snippets]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .slice(0, 5) // Only take the first 5 snippets
                        .map((snippet) => (
                          <motion.div
                            key={snippet._id}
                            onClick={() =>
                              router.push(`/dashboard/snippets/${snippet._id}`)
                            }
                            className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg 
                            bg-white/50 dark:bg-zinc-800/50 
                            hover:bg-white/70 dark:hover:bg-zinc-800/70 
                            border border-zinc-200/20 dark:border-zinc-700/50
                            transition-colors cursor-pointer
                            active:opacity-80"
                            variants={itemVariants}
                          >
                            <motion.div
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 dark:bg-emerald-600/20 flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Code className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium truncate">
                                  {snippet.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 ml-2 flex-shrink-0">
                                  {new Date(
                                    snippet.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="text-xs sm:text-sm text-zinc-500 mt-1 truncate">
                                {snippet.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      {userData.snippets.length === 0 && (
                        <div className="text-center py-6 text-zinc-500 dark:text-zinc-400">
                          No snippets yet
                        </div>
                      )}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Share Profile Section */}
              <motion.div variants={itemVariants}>
                <Card className="dark:bg-[#161514] w-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LucideIcons.Share2 className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-lg font-semibold">Share Profile</h3>
                      </div>
                      <Button
                        variant="outline"
                        className="dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70"
                        onClick={() => {
                          // Use the proper route format: /dashboard/users/profile/[userId]
                          const profileUrl = `${window.location.origin}/dashboard/users/profile/${userData.user._id}`;
                          navigator.clipboard.writeText(profileUrl);
                          toast({
                            title: "Profile link copied!",
                            description: "Share your profile with others.",
                          });
                        }}
                      >
                        Copy Link
                      </Button>
                    </div>
                    <p className="text-sm text-zinc-400 mt-2">
                      Share your profile to showcase your code snippets and
                      achievements
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <AchievementsContent
                isLoading={isLoading}
                error={error}
                achievements={achievements}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card className="dark:bg-[#161514]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <CardTitle>Activity History</CardTitle>
                  </div>
                  <CardDescription>
                    Track your journey and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative">
                    {/* Timeline vertical line */}
                    <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-border" />
                    <motion.div 
                      className="space-y-8"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {getActivityHistory().map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          variants={itemVariants}
                          className="relative flex gap-4 group"
                        >
                          {/* Timeline dot */}
                          <motion.div 
                            variants={dotVariants}
                            className="absolute left-4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 
                                    border-background bg-emerald-500 ring-[3px] ring-background 
                                    dark:ring-[#161514] hover:scale-110 transition-transform"
                            whileHover={{ scale: 1.2 }}
                          />  
                          {/* Activity content */}
                          <motion.div 
                            className="ml-12 flex-1"
                            whileHover={{ 
                              x: 5,
                              transition: { type: "spring", stiffness: 300, damping: 20 }
                            }}
                          >
                            {renderActivityCard(activity)}
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  {getActivityHistory().length === 0 && (
                    <motion.div 
                      className="text-center py-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <motion.div 
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.3
                        }}
                      >
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </motion.div>
                      <motion.h3 
                        className="font-medium text-lg mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        No activity yet
                      </motion.h3>
                      <motion.p 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        Your activities will appear here once you start creating
                        snippets and earning achievements.
                      </motion.p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="connections" className="mt-6">
              <Card className="dark:bg-[#161514]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LucideIcons.Users className="w-5 h-5 text-emerald-500" />
                    Connections
                  </CardTitle>
                  <CardDescription>
                    Your followers and people you follow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userData?.user?._id && (
                    <FollowList 
                      userId={userData.user._id} 
                      key={userData.user._id}
                      onFollowUpdate={async (targetUserId: string, isFollowing: boolean) => {
                        setUserData(prev => {
                          if (!prev) return null;

                          // Update the count immediately for better UX
                          return {
                            ...prev,
                            user: {
                              ...prev.user,
                              followingCount: prev.user.followingCount + (isFollowing ? 1 : -1)
                            }
                          };
                        });

                        // Fetch updated user data
                        try {
                          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
                            credentials: 'include'
                          });
                          const data = await response.json();
                          
                          if (data.success) {
                            setUserData(data);
                          }
                        } catch (error) {
                          console.error('Error updating user data:', error);
                        }
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
