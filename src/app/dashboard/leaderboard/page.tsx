"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Trophy,
  Medal,
  Heart,
  Eye,
  MessageSquare,
  Code2,
  TrendingUp,
  Star,
  Calendar,
  Filter,
  Search,
  ArrowUpRight,
  Loader2,
  Users,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

interface Contributor {
  _id: string
  username: string
  profileURL?: string
  totalLikes: number
  totalViews: number
  totalComments: number
  totalSnippets: number
  rank: number
  score: number
  trend: number
  lastActive: string
  badges: string[]
  specializations: string[]
  userInfo?: {
    username: string
    profileURL?: string
  }
}

interface LeaderboardStats {
  totalContributors: number
  totalSnippets: number
  totalInteractions: number
  averageScore: number
}

interface CurrentUserStats {
  totalSnippets: number
  totalInteractions: number
  score: number
  rank: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [filteredContributors, setFilteredContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"all" | "month" | "week">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"rank" | "recent" | "trending">("rank")
  const [stats, setStats] = useState<LeaderboardStats>({
    totalContributors: 0,
    totalSnippets: 0,
    totalInteractions: 0,
    averageScore: 0,
  })
  const [currentUserStats, setCurrentUserStats] = useState<CurrentUserStats>({
    totalSnippets: 0,
    totalInteractions: 0,
    score: 0,
    rank: 0,
  })
  const debouncedSearch = useDebounce(searchTerm, 300)
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

  const handleProfileClick = (userId: string, e: React.MouseEvent) => {
    // Prevent event bubbling if clicking on specific elements
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("a")) {
      return
    }
    router.push(`/dashboard/users/profile/${userId}`)
  }

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/leaderboard?timeRange=${timeRange}`, {
          credentials: "include",
        })
        const data = await response.json()
        
        console.log("Leaderboard API Response:", data) // Debug log
        
        if (data.success) {
          const formattedContributors = data.contributors.map((contributor: any) => ({
            _id: contributor._id,
            username: contributor.userInfo?.username || 'Anonymous',
            profileURL: contributor.userInfo?.profileURL,
            totalLikes: contributor.totalLikes || 0,
            totalViews: contributor.totalViews || 0,
            totalComments: contributor.totalComments || 0,
            totalSnippets: contributor.totalSnippets || 0,
            rank: contributor.rank || 0,
            score: contributor.score || 0,
            trend: contributor.trend || 0,
            lastActive: contributor.lastActive || new Date().toISOString(),
            badges: contributor.badges || [],
            specializations: contributor.specializations || [],
          }));
          
          setContributors(formattedContributors);
          setFilteredContributors(formattedContributors);
          
          // Set current user stats
          if (data.currentUserStats) {
            setCurrentUserStats({
              totalSnippets: data.currentUserStats.totalSnippets || 0,
              totalInteractions: data.currentUserStats.totalInteractions || 0,
              score: data.currentUserStats.score || 0,
              rank: data.currentUserStats.rank || 0,
            })
          }

          // Set overall stats
          if (data.stats) {
            setStats(data.stats)
          } else {
            // Calculate stats from contributors data
            const totalContributors = data.contributors.length
            const totalSnippets = data.contributors.reduce(
              (sum: number, c: Contributor) => sum + c.totalSnippets, 
              0
            )
            const totalInteractions = data.contributors.reduce(
              (sum: number, c: Contributor) => 
                sum + c.totalLikes + c.totalViews + c.totalComments,
              0
            )
            const averageScore = totalContributors > 0
              ? data.contributors.reduce(
                  (sum: number, c: Contributor) => sum + c.score, 
                  0
                ) / totalContributors
              : 0

            setStats({
              totalContributors,
              totalSnippets,
              totalInteractions,
              averageScore,
            })
          }
        } else {
          console.error("Failed to fetch leaderboard:", data.message)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [timeRange, BASE_URL])

  // Filter and sort contributors when search term or sort method changes
  useEffect(() => {
    if (!contributors.length) return

    let results = [...contributors]

    // Apply search filter
    if (debouncedSearch) {
      results = results.filter(
        (contributor) =>
          contributor.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (contributor.specializations &&
            contributor.specializations.some((spec) => spec.toLowerCase().includes(debouncedSearch.toLowerCase()))),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "rank":
        results.sort((a, b) => a.rank - b.rank)
        break
      case "recent":
        results.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
        break
      case "trending":
        results.sort((a, b) => b.trend - a.trend)
        break
    }

    setFilteredContributors(results)
  }, [debouncedSearch, sortBy, contributors])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />
      default:
        return <span className="w-6 h-6 text-center font-medium">{rank}</span>
    }
  }

  const formatNumber = (num: number | string | undefined | null): string => {
    if (num === undefined || num === null) return '0';
    
    // Convert string to number if needed
    const value = typeof num === "string" ? Number.parseFloat(num) : num;
    
    // Check if value is a valid number
    if (isNaN(value)) return '0';

    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  // Add a safe getter function for user stats
  const getUserStat = (value: number | undefined) => {
    return value !== undefined ? value : 0;
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
    )
  }

  return (
    <div className="container mx-auto px-4  max-w-[2000px]  ">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-yellow-500/10">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contributor Leaderboard</h1>
            </div>

            <Tabs 
              defaultValue={timeRange} 
              onValueChange={(value) => setTimeRange(value as "all" | "month" | "week")}
              className="w-full"
            >
              <TabsList className="dark:bg-[#161514] border border-border/40">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:dark:bg-emerald-500/10"
                >
                  All Time
                </TabsTrigger>
                <TabsTrigger 
                  value="month"
                  className="data-[state=active]:dark:bg-emerald-500/10"
                >
                  This Month
                </TabsTrigger>
                <TabsTrigger 
                  value="week"
                  className="data-[state=active]:dark:bg-emerald-500/10"
                >
                  This Week
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              title: "Total Contributors",
              value: stats.totalContributors,
              userValue: getUserStat(currentUserStats?.rank),
              icon: <Users className="w-5 h-5 text-blue-500" />,
              color: "blue",
              userLabel: "Your Rank",
            },
            {
              title: "Total Snippets",
              value: stats.totalSnippets,
              userValue: getUserStat(currentUserStats?.totalSnippets),
              icon: <Code2 className="w-5 h-5 text-emerald-500" />,
              color: "emerald",
              userLabel: "Your Snippets",
            },
            {
              title: "Total Interactions",
              value: stats.totalInteractions,
              userValue: getUserStat(currentUserStats?.totalInteractions),
              icon: <TrendingUp className="w-5 h-5 text-purple-500" />,
              color: "purple",
              userLabel: "Your Interactions",
            },
            {
              title: "Average Score",
              value: stats.averageScore.toFixed(1),
              userValue: getUserStat(currentUserStats?.score),
              icon: <Star className="w-5 h-5 text-yellow-500" />,
              color: "yellow",
              userLabel: "Your Score",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="overflow-hidden border border-border/40 dark:bg-[#161514] bg-card/50 backdrop-blur 
                transition-all duration-200 hover:shadow-md dark:hover:shadow-emerald-500/5"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-md bg-${stat.color}-500/10`}>{stat.icon}</div>
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex flex-col gap-2">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {formatNumber(stat.value)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="bg-primary/5">
                      {stat.userLabel}: {formatNumber(stat.userValue)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contributors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 dark:bg-[#161514] border-border/40"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 dark:bg-[#161514]">
                <Filter className="w-4 h-4" />
                Sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-[#161514]">
              <DropdownMenuItem onClick={() => setSortBy("rank")}>Rank</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("recent")}>Recent Activity</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("trending")}>Trending</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Contributor Cards */}
        <motion.div variants={itemVariants} className="grid gap-4">
          {filteredContributors.length > 0 ? (
            filteredContributors.map((contributor) => (
              <Card
                key={contributor._id}
                className="overflow-hidden border border-border/40 dark:bg-[#161514] bg-card/50 backdrop-blur 
                  transition-all duration-200 hover:shadow-lg dark:hover:shadow-emerald-500/5 
                  dark:hover:border-emerald-500/20 hover:border-primary/20 cursor-pointer group"
                onClick={(e) => handleProfileClick(contributor._id, e)}
              >
                <CardContent className="p-6 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                    {/* Rank and Avatar section */}
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(contributor.rank)}
                      </div>
                      <Avatar
                        className="h-12 w-12 sm:h-10 sm:w-10 border-2 border-background group-hover:ring-2 
                          ring-offset-2 ring-offset-background group-hover:ring-primary/40 transition-all duration-300"
                      >
                        {contributor?.profileURL ? (
                          <AvatarImage 
                            src={contributor.profileURL} 
                            alt={contributor?.username || 'User'} 
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {contributor?.username ? contributor.username.charAt(0).toUpperCase() : 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>

                    {/* User info section */}
                    <div className="flex-1 space-y-3 sm:space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <h3 className="font-medium text-lg sm:text-base truncate group-hover:text-primary transition-colors">
                          {contributor.username}
                        </h3>
                        <div className="flex items-center gap-2">
                          {contributor.trend > 0 && (
                            <Badge variant="default" 
                              className="text-xs gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 
                              hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              Trending
                            </Badge>
                          )}
                          {contributor.badges && contributor.badges.length > 0 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs gap-1 dark:bg-[#161514] dark:hover:bg-[#161514]"
                            >
                              <Sparkles className="w-3 h-3" />
                              {contributor.badges[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Code2 className="w-4 h-4" />
                          {formatNumber(contributor.totalSnippets)} public snippets
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4" />
                          {formatNumber(contributor.score)} points
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState searchTerm={searchTerm} />
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

// Stat Badge Component
interface StatBadgeProps {
  icon: React.ReactNode
  value: number
  color: string
  formatNumber: (num: number) => string
}

const StatBadge = ({ icon, value, color, formatNumber }: StatBadgeProps) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${color}-500/10`}>
    <div className={`text-${color}-500`}>{icon}</div>
    <span className="font-medium tabular-nums text-sm">{formatNumber(value)}</span>
  </div>
)

// Empty State Component
interface EmptyStateProps {
  searchTerm: string
}

const EmptyState = ({ searchTerm }: EmptyStateProps) => (
  <Card className="p-8 text-center border border-border/40 bg-card/50 backdrop-blur">
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="p-3 rounded-full bg-muted">
        <Trophy className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="font-medium">{searchTerm ? "No contributors found" : "No contributors yet"}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {searchTerm
            ? `No contributors matching "${searchTerm}". Try adjusting your search terms.`
            : "Be the first to contribute and earn your place on the leaderboard!"}
        </p>
      </div>
    </div>
  </Card>
)

