"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  Loader2,
  User,
  Code2,
  Share2,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn, getBaseUrl } from "@/lib/utils";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Progress } from "@/components/ui/progress";

interface AnalyticsStats {
  totalViews: number;
  totalLikes: number;
  totalSnippets: number;
  totalComments: number;
  engagementRate: number;
}

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    profileURL?: string;
  };
  snippetId: string;
  snippetTitle: string;
  likes: number;
}

interface SnippetAnalytics {
  _id: string;
  title: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  shareCount: number;
  createdAt: string;
  viewsHistory: { date: string; count: number }[];
  comments: Comment[];
}

interface StatBadgeProps {
  icon: React.ReactNode;
  value: number;
  color: string;
  formatNumber: (num: number) => string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<SnippetAnalytics[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalViews: 0,
    totalLikes: 0,
    totalSnippets: 0,
    totalComments: 0,
    engagementRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const BASE_URL = getBaseUrl();
  const router = useRouter();

  const getAllComments = () => {
    if (!analytics) return [];

    // Flatten all comments from all snippets into a single array
    const allComments = analytics.flatMap((snippet) =>
      (snippet.comments || []).map((comment) => ({
        ...comment,
        snippetTitle: snippet.title,
        snippetId: snippet._id,
        // Ensure userId has all required properties
        userId: {
          _id: comment.userId._id,
          username: comment.userId.username,
          profileURL: comment.userId.profileURL,
        },
      }))
    );

    // Sort by date, most recent first
    return allComments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/analytics`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.success) {
          console.log("Analytics data:", data);
          setAnalytics(data.analytics);
          const engagementRate =
            data.stats.engagementRate || calculateEngagementRate(data.stats);
          setStats({
            ...data.stats,
            engagementRate,
          });
        } else {
          console.error("Failed to fetch analytics:", data.message);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [BASE_URL]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative w-4 h-8 text-transparent">
          <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-[#10B981] animate-loader"></div>
          <div className="absolute top-0 left-0 w-3.5 h-8 bg-[#10B981] animate-loader delay-150"></div>
          <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-[#10B981] animate-loader delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[2000px]">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Header with Tabs */}
        <motion.div variants={itemVariants} className="flex flex-col space-y-6 ">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10">
                <BarChart3 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track performance and engagement of your code snippets
                </p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 dark:bg-[#161514] px-4 py-2 rounded-lg border border-border/30">
                    <Clock className="w-4 h-4" />
                    <span>
                      Last updated: {format(new Date(), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data is refreshed every 30 minutes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Tabs
            defaultValue="overview"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <div className="overflow-x-auto scrollbar-none -mx-3 sm:mx-0">
              <TabsList className="w-full min-w-[600px] sm:min-w-0 px-3 sm:px-0 dark:bg-[#161514] rounded-xl h-12 p-1.5">
                <TabsTrigger
                  value="overview"
                  className="flex-1 text-xs sm:text-sm data-[state=active]:text-emerald-500 data-[state=active]:shadow-md rounded-lg h-10 ml-2"
                >
                  <BarChart3 className="w-4 h-4 mr-2 sm:mr-3" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="snippets"
                  className="flex-1 text-xs sm:text-sm data-[state=active]:text-emerald-500 data-[state=active]:shadow-md rounded-lg h-10"
                >
                  <Code2 className="w-4 h-4 mr-2 sm:mr-3" />
                  Snippets
                </TabsTrigger>
                <TabsTrigger
                  value="engagement"
                  className="flex-1 text-xs sm:text-sm data-[state=active]:text-emerald-500 data-[state=active]:shadow-md rounded-lg h-10"
                >
                  <Activity className="w-4 h-4 mr-2 sm:mr-3" />
                  Engagement
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="flex-1 text-xs sm:text-sm data-[state=active]:text-emerald-500 data-[state=active]:shadow-md rounded-lg h-10 mr-2"
                >
                  <MessageSquare className="w-4 h-4 mr-2 sm:mr-3" />
                  Comments
                </TabsTrigger>
              </TabsList>
            </div>

            <style jsx global>{`
              /* Hide scrollbar for Chrome, Safari and Opera */
              .scrollbar-none::-webkit-scrollbar {
                display: none;
              }

              /* Hide scrollbar for IE, Edge and Firefox */
              .scrollbar-none {
                -ms-overflow-style: none; /* IE and Edge */
                scrollbar-width: none; /* Firefox */
              }
            `}</style>

            {/* Tab Contents */}
            <TabsContent value="overview" className="mt-8 space-y-8">
              {/* Stats Overview Cards */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {[
                  {
                    title: "Total Views",
                    icon: (
                      <Eye className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    ),
                    value: stats.totalViews,
                    trend: calculateGrowth(
                      stats.totalViews,
                      stats.totalViews * 0.8
                    ),
                    description: "Total number of views across all snippets",
                    color: "emerald",
                  },
                  {
                    title: "Total Likes",
                    icon: (
                      <Heart className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                    ),
                    value: stats.totalLikes,
                    trend: calculateGrowth(
                      stats.totalLikes,
                      stats.totalLikes * 0.8
                    ),
                    description: "Total number of likes received",
                    color: "pink",
                  },
                  {
                    title: "Total Comments",
                    icon: (
                      <MessageSquare className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    ),
                    value: stats.totalComments,
                    trend: calculateGrowth(
                      stats.totalComments,
                      stats.totalComments * 0.8
                    ),
                    description: "Total number of comments received",
                    color: "blue",
                  },
                  {
                    title: "Engagement Rate",
                    icon: (
                      <Activity className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                    ),
                    value: stats.engagementRate,
                    trend: calculateGrowth(
                      stats.engagementRate,
                      stats.engagementRate * 0.8
                    ),
                    description: "Average engagement rate across snippets",
                    isPercentage: true,
                    color: "purple",
                  },
                ].map((stat, index) => (
                  <Card
                    key={stat.title}
                    className="relative overflow-hidden dark:bg-[#161514] bg-white rounded-xl shadow-sm border dark:border-green-100/10 transition-all duration-200 hover:shadow-md group"
                  >
                    <CardHeader className="space-y-1 pb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg bg-${stat.color}-500/10`}
                        >
                          {stat.icon}
                        </div>
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {stat.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-bold dark:text-white text-gray-900">
                            {stat.isPercentage
                              ? `${(stat.value || 0).toFixed(1)}%`
                              : formatNumber(stat.value || 0)}
                          </span>
                          <Badge 
                            variant="static"
                            className={cn(
                              "text-xs mb-1",
                              stat.trend > 0
                                ? `bg-${stat.color}-500/10 dark:bg-${stat.color}-500/10 border-${stat.color}-500/20 dark:border-${stat.color}-500/20 text-${stat.color}-700 dark:text-${stat.color}-400`
                                : "bg-red-500/10 text-red-700 dark:text-red-400"
                            )}
                          >
                            {stat.trend > 0 ? "+" : "-"}
                            {Math.abs(stat.trend).toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {stat.description}
                        </p>
                      </div>
                    </CardContent>
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${stat.color}-500/40 to-${stat.color}-500/10 group-hover:from-${stat.color}-500/60 group-hover:to-${stat.color}-500/20 transition-all duration-300`}
                    />
                  </Card>
                ))}
              </motion.div>

              {/* Top Performing Snippets */}
              <motion.div variants={itemVariants} className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10">
                      <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold">
                      Top Performing Snippets
                    </h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/dashboard/snippets")}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  {analytics.length === 0 ? (
                    <Card className="p-8 text-center dark:bg-[#161514] border dark:border-green-100/10 rounded-xl">
                      <div className="flex flex-col items-center justify-center gap-4 py-8">
                        <div className="p-4 rounded-full bg-muted/50 dark:bg-[#1e1e1c]">
                          <TrendingUp className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-2 max-w-md">
                          <h3 className="font-medium text-lg">
                            No snippets yet
                          </h3>
                          <p className="text-sm text-muted-foreground mx-auto">
                            Create your first snippet to start tracking
                            performance analytics and gain insights into user
                            engagement.
                          </p>
                          <Button
                            className="mt-4"
                            onClick={() => router.push("/dashboard/create")}
                          >
                            Create Snippet
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {analytics.slice(0, 5).map((snippet, index) => (
                        <Card
                          key={snippet._id}
                          className="overflow-hidden border dark:border-green-100/10 dark:bg-[#161514] backdrop-blur transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer rounded-xl group"
                          onClick={() =>
                            router.push(`/dashboard/snippets/${snippet._id}`)
                          }
                        >
                          <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              <div className="flex-1 min-w-0 p-4 sm:p-5 border-r border-border/10">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 text-muted-foreground font-medium">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-lg truncate group-hover:text-primary transition-colors">
                                      {snippet.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>
                                          {format(
                                            new Date(snippet.createdAt),
                                            "MMM d, yyyy"
                                          )}
                                        </span>
                                      </div>
                                      <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
                                      <div className="flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5" />
                                        <span>
                                          {(
                                            ((snippet.likesCount +
                                              snippet.commentsCount) /
                                              (snippet.views || 1)) *
                                            100
                                          ).toFixed(1)}
                                          % engagement
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 sm:w-auto p-4">
                                <StatCard
                                  icon={
                                    <Eye className="w-4 h-4 text-emerald-500" />
                                  }
                                  value={snippet.views}
                                  label="Views"
                                  formatNumber={formatNumber}
                                />
                                <StatCard
                                  icon={
                                    <Heart className="w-4 h-4 text-pink-500" />
                                  }
                                  value={snippet.likesCount}
                                  label="Likes"
                                  formatNumber={formatNumber}
                                />
                                <StatCard
                                  icon={
                                    <MessageSquare className="w-4 h-4 text-blue-500" />
                                  }
                                  value={snippet.commentsCount}
                                  label="Comments"
                                  formatNumber={formatNumber}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="snippets" className="mt-8 space-y-8">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10">
                      <Code2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold">
                      Snippet Performance
                    </h2>
                  </div>
                </div>

                <div className="grid gap-6">
                  {analytics.length === 0 ? (
                    <EmptyState
                      icon={<Code2 className="h-10 w-10" />}
                      title="No snippets found"
                      description="Create your first snippet to start tracking performance metrics"
                      actionLabel="Create Snippet"
                      onAction={() => router.push("/dashboard/create")}
                    />
                  ) : (
                    analytics.map((snippet) => (
                      <Card
                        key={snippet._id}
                        className="dark:bg-[#161514] border dark:border-green-100/10 rounded-xl overflow-hidden"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium">
                              {snippet.title}
                            </CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/snippets/${snippet._id}`
                                )
                              }
                            >
                              View Details
                            </Button>
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Created on{" "}
                            {format(new Date(snippet.createdAt), "MMM d, yyyy")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-6">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-4">
                            <MetricCard
                              icon={
                                <Eye className="w-5 h-5 text-emerald-500" />
                              }
                              value={formatNumber(snippet.views)}
                              label="Views"
                              bgColor="bg-emerald-500/10"
                            />
                            <MetricCard
                              icon={<Heart className="w-5 h-5 text-pink-500" />}
                              value={formatNumber(snippet.likesCount)}
                              label="Likes"
                              bgColor="bg-pink-500/10"
                            />
                            <MetricCard
                              icon={
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                              }
                              value={formatNumber(snippet.commentsCount)}
                              label="Comments"
                              bgColor="bg-blue-500/10"
                            />
                            <MetricCard
                              icon={
                                <Share2 className="w-5 h-5 text-purple-500" />
                              }
                              value={formatNumber(snippet.shareCount)}
                              label="Shares"
                              bgColor="bg-purple-500/10"
                            />
                          </div>

                          <div className="mt-6 space-y-4">
                            <h4 className="text-sm font-medium">
                              Engagement Breakdown
                            </h4>
                            <div className="space-y-3">
                              <ProgressMetric
                                label="Like Rate"
                                value={
                                  (snippet.likesCount / (snippet.views || 1)) *
                                  100
                                }
                                color="bg-pink-500/25"
                              />
                              <ProgressMetric
                                label="Comment Rate"
                                value={
                                  (snippet.commentsCount /
                                    (snippet.views || 1)) *
                                  100
                                }
                                color="bg-blue-500/25"
                              />
                              <ProgressMetric
                                label="Share Rate"
                                value={
                                  (snippet.shareCount / (snippet.views || 1)) *
                                  100
                                }
                                color="bg-purple-500/25"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="engagement" className="mt-8 space-y-8">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10">
                      <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold">
                      Engagement Metrics
                    </h2>
                  </div>
                </div>

                <Card className="dark:bg-[#161514] border dark:border-green-100/10 rounded-xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">
                      Overall Engagement
                    </CardTitle>
                    <CardDescription>
                      Summary of engagement metrics across all snippets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Average Engagement Rate
                          </span>
                          <span className="text-lg font-bold">
                            {stats.engagementRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={stats.engagementRate}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentage of views that resulted in likes or comments
                        </p>
                      </div>

                      <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Like to View Ratio
                          </span>
                          <span className="text-lg font-bold">
                            {(
                              (stats.totalLikes / (stats.totalViews || 1)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (stats.totalLikes / (stats.totalViews || 1)) * 100
                          }
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentage of views that resulted in likes
                        </p>
                      </div>

                      <div className="space-y-2 p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Comment to View Ratio
                          </span>
                          <span className="text-lg font-bold">
                            {(
                              (stats.totalComments / (stats.totalViews || 1)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (stats.totalComments / (stats.totalViews || 1)) *
                            100
                          }
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentage of views that resulted in comments
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6">
                  {analytics.map((snippet) => {
                    const engagementRate = (
                      ((snippet.likesCount + snippet.commentsCount) /
                        (snippet.views || 1)) *
                      100
                    ).toFixed(1);
                    return (
                      <Card
                        key={snippet._id}
                        className="dark:bg-[#161514] border dark:border-green-100/10 rounded-xl overflow-hidden"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium">
                              {snippet.title}
                            </CardTitle>
                            <Badge 
                              className="bg-emerald-500/10 dark:bg-[#0C1D1A] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 dark:hover:bg-[#0C1D1A]"
                            >
                              {engagementRate}% Engagement
                            </Badge>
                          </div>
                          <CardDescription>
                            Created on{" "}
                            {format(new Date(snippet.createdAt), "MMM d, yyyy")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">
                                Views to Likes Ratio
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    Conversion Rate
                                  </span>
                                  <span className="font-medium">
                                    {(
                                      (snippet.likesCount /
                                        (snippet.views || 1)) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    (snippet.likesCount /
                                      (snippet.views || 1)) *
                                    100
                                  }
                                  className="h-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {snippet.likesCount} likes from{" "}
                                  {snippet.views} views
                                </p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">
                                Views to Comments Ratio
                              </h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">
                                    Conversion Rate
                                  </span>
                                  <span className="font-medium">
                                    {(
                                      (snippet.commentsCount /
                                        (snippet.views || 1)) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    (snippet.commentsCount /
                                      (snippet.views || 1)) *
                                    100
                                  }
                                  className="h-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {snippet.commentsCount} comments from{" "}
                                  {snippet.views} views
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 p-4 rounded-lg bg-muted/30 space-y-2">
                            <h4 className="text-sm font-medium">
                              Engagement Summary
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              This snippet has an engagement rate of{" "}
                              <span className="font-medium text-emerald-500">
                                {engagementRate}%
                              </span>
                              , which is{" "}
                              {parseFloat(engagementRate) > stats.engagementRate
                                ? "above"
                                : "below"}{" "}
                              the average engagement rate of
                              <span className="font-medium">
                                {" "}
                                {stats.engagementRate.toFixed(1)}%
                              </span>{" "}
                              across all snippets.
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-muted/20 py-3 px-6 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/snippets/${snippet._id}`)
                            }
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-8 space-y-8">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10">
                      <MessageSquare className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-semibold">Recent Comments</h2>
                  </div>
                </div>

                <div className="grid gap-4">
                  {getAllComments().length === 0 ? (
                    <EmptyState
                      icon={<MessageSquare className="h-10 w-10" />}
                      title="No comments yet"
                      description="Comments will appear here when users start engaging with your snippets"
                    />
                  ) : (
                    <AnimatePresence>
                      {getAllComments().map((comment, index) => (
                        <motion.div
                          key={comment._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="dark:bg-[#161514] border dark:border-green-100/10 rounded-xl overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-background">
                                  {comment.userId.profileURL ? (
                                    <AvatarImage
                                      src={comment.userId.profileURL}
                                      alt={comment.userId.username}
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {comment.userId.username
                                        .charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {comment.userId.username}
                                    </span>
                                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                                      {formatDistanceToNow(
                                        new Date(comment.createdAt)
                                      )}{" "}
                                      ago
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    commented on{" "}
                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/dashboard/snippets/${comment.snippetId}`
                                        )
                                      }
                                      className="font-medium text-primary hover:underline"
                                    >
                                      {comment.snippetTitle}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                              <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-4 flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                              >
                                <Heart className="h-4 w-4" />
                                <span>{comment.likes || 0} likes</span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                              >
                                <MessageSquare className="h-4 w-4" />
                                <span>Reply</span>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Stat Badge Component
const StatBadge = ({ icon, value, color, formatNumber }: StatBadgeProps) => (
  <div
    className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${color}-500/10`}
  >
    <div className={`text-${color}-500`}>{icon}</div>
    <span className="font-medium tabular-nums">{formatNumber(value)}</span>
  </div>
);

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  formatNumber: (num: number) => string;
}

const StatCard = ({ icon, value, label, formatNumber }: StatCardProps) => (
  <div className="flex flex-col items-center justify-center p-2 text-center">
    <div className="flex items-center justify-center mb-1">{icon}</div>
    <div className="font-bold text-lg">{formatNumber(value)}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

// Metric Card Component
interface MetricCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  bgColor: string;
}

const MetricCard = ({ icon, value, label, bgColor }: MetricCardProps) => (
  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 border border-border/20">
    <div className={`p-2 rounded-full ${bgColor} mb-2`}>{icon}</div>
    <div className="font-bold text-2xl">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

// Progress Metric Component
interface ProgressMetricProps {
  label: string;
  value: number;
  color: string;
}

const ProgressMetric = ({ label, value, color }: ProgressMetricProps) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value.toFixed(1)}%</span>
    </div>
    <Progress value={value} className={`h-1.5 ${color}`} />
  </div>
);

// Empty State Component
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <Card className="p-8 text-center dark:bg-[#161514] border dark:border-green-100/10 rounded-xl">
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="p-4 rounded-full bg-muted/50 dark:bg-[#1e1e1c]">
        {icon}
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mx-auto">{description}</p>
        {actionLabel && onAction && (
          <Button className="mt-4" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  </Card>
);

// Add this helper function
const calculateEngagementRate = (stats: AnalyticsStats): number => {
  if (stats.totalViews === 0) return 0;
  return ((stats.totalLikes + stats.totalComments) / stats.totalViews) * 100;
};
