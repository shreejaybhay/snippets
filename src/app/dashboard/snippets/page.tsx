"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  PlusCircle,
  Star,
  Clock,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Heart,
  Eye,
  Plus,
  FolderPlus,
  Pin,
  Share2,
  BarChart3,
  Trophy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import SnippetCard from "@/components/SnippetCard";
import FavoriteButton from "@/components/FavoriteButton";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  userId: string;
  createdAt: string;
  likes?: string[]; // Array of user IDs who liked the snippet
  views?: number; // Number of views
  isPinned?: boolean; // Whether the snippet is pinned
}

interface UserData {
  user: {
    _id: string;
    username: string;
    email: string;
    favorites: string[];
  };
  snippets: Snippet[];
}

interface SortOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface Collection {
  _id: string;
  name: string;
  description: string;
  color: string;
}

const MySnippets = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Main search bar term
  const [languageSearchTerm, setLanguageSearchTerm] = useState(""); // Separate state for language search
  const [searchType, setSearchType] = useState<"title" | "tags" | "code">(
    "title"
  );
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [mostRecentSnippetTitle, setMostRecentSnippetTitle] =
    useState<string>("None");
  const router = useRouter();
  const { toast } = useToast();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const [collections, setCollections] = useState<Collection[]>([]);
  const [pinnedSnippets, setPinnedSnippets] = useState<Snippet[]>([]); // Updated type here
  const [showNewCollectionDialog, setShowNewCollectionDialog] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    color: "#4F46E5",
  });

  const sortOptions: SortOption[] = [
    {
      value: "newest",
      label: "Most Recent",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      value: "oldest",
      label: "Oldest",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      value: "most-liked",
      label: "Most Liked",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      value: "most-viewed",
      label: "Most Viewed",
      icon: <Eye className="w-4 h-4" />,
    },
  ];

  // Add handler for favorite changes
  const handleFavoriteChange = (snippetId: string, isFavorited: boolean) => {
    if (!userData) return;

    setUserData((prevData) => {
      if (!prevData) return null;

      const newFavorites = isFavorited
        ? [...prevData.user.favorites, snippetId]
        : prevData.user.favorites.filter((id) => id !== snippetId);

      return {
        ...prevData,
        user: {
          ...prevData.user,
          favorites: newFavorites,
        },
      };
    });
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        // Sort snippets by creation date (newest first)
        const sortedSnippets = [...data.snippets].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setUserData({
          ...data,
          snippets: sortedSnippets,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load snippets. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData?.snippets && userData.snippets.length > 0) {
      const sortedSnippets = [...userData.snippets].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMostRecentSnippetTitle(sortedSnippets[0].title);
    } else {
      setMostRecentSnippetTitle("None");
    }
  }, [userData?.snippets]);

  const filterAndSortSnippets = (
    snippets: Snippet[] | undefined
  ): Snippet[] => {
    if (!snippets || !Array.isArray(snippets)) return [];

    let filtered = [...snippets];

    // Search filtering
    if (searchTerm) {
      filtered = filtered.filter((snippet) => {
        switch (searchType) {
          case "title":
            return snippet.title
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          case "tags":
            return snippet.tags.some((tag: string) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            );
          case "code":
            return snippet.code
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          default:
            return true;
        }
      });
    }

    // Language filtering
    if (filterLanguage !== "all") {
      filtered = filtered.filter(
        (snippet) =>
          snippet.language.toLowerCase() === filterLanguage.toLowerCase()
      );
    }

    // First sort by pin status, then apply other sorting criteria
    filtered.sort((a, b) => {
      // Pinned snippets always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // If both snippets have the same pin status, apply the selected sort
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "most-liked":
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case "most-viewed":
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const fadeIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
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

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/collections`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const fetchPinnedSnippets = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/snippets?pinned=true`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setPinnedSnippets(data.snippets);
      }
    } catch (error) {
      console.error("Error fetching pinned snippets:", error);
    }
  };

  const handleCreateCollection = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newCollection),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Collection created successfully",
        });
        setCollections([...collections, data.collection]);
        setShowNewCollectionDialog(false);
        setNewCollection({ name: "", description: "", color: "#4F46E5" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <motion.div
        className="p-3 sm:p-4 lg:p-6 mt-2 sm:mt-0 max-w-[2000px] mx-auto relative"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        style={{
          overflow: loading ? "hidden" : "visible",
        }}
      >
        {/* Stats Cards Section - Improved Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {[
            {
              title: "All Snippets",
              count: userData?.snippets.length || 0,
              icon: <FileText size={20} className="text-green-500" />,
            },
            {
              title: "Today's",
              count:
                userData?.snippets.filter(
                  (snippet) =>
                    new Date(snippet.createdAt).toDateString() ===
                    new Date().toDateString()
                ).length || 0,
              icon: <PlusCircle size={20} className="text-blue-500" />,
            },
            {
              title: "Favorites",
              count: userData?.user.favorites.length || 0,
              icon: <Star size={20} className="text-yellow-500" />,
            },
            {
              title: "Recent",
              count: mostRecentSnippetTitle,
              icon: <Clock size={20} className="text-red-500" />,
              isRecent: true,
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="dark:bg-[#161514] bg-white p-4 sm:p-6 rounded-2xl shadow-lg border dark:border-green-100/10 flex flex-col relative"
            >
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                {item.icon}
              </div>
              <h2 className="text-sm sm:text-lg font-medium text-gray-600 dark:text-gray-300 line-clamp-1">
                {item.title}
              </h2>
              <h1
                className={`mt-1 sm:mt-2 font-bold ${
                  item.isRecent
                    ? "text-lg sm:text-2xl line-clamp-1"
                    : "text-2xl sm:text-4xl"
                } truncate`}
              >
                {item.count}
              </h1>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Search Bar & Filters - Improved Layout */}
        <motion.div
          className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 items-stretch sm:items-center mb-3 sm:mb-4 lg:mb-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={`Search by ${searchType}...`}
                className="h-9 sm:h-10 lg:h-12 text-sm sm:text-base lg:text-lg dark:bg-[#161514] dark:text-white border dark:border-green-100/10 pr-28"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={searchType}
                onValueChange={(value: "title" | "tags" | "code") =>
                  setSearchType(value)
                }
              >
                <SelectTrigger className="absolute right-1.5 top-1/2 -translate-y-1/2 w-24 sm:w-28 h-7 sm:h-8 dark:bg-[#161514]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="tags">Tags</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger className="w-32 sm:w-36 lg:w-40 h-9 sm:h-10 lg:h-12 dark:bg-[#161514]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] dark:bg-[#161514]">
                  <div className="p-2">
                    <Input
                      type="text"
                      placeholder="Search language..."
                      className="mb-2 dark:bg-[#161514] dark:focus:bg-[#1e1d1c]"
                      value={languageSearchTerm}
                      onChange={(e) => setLanguageSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <SelectItem
                    value="all"
                    className="dark:hover:bg-[#1e1d1c] dark:focus:bg-[#1e1d1c]"
                  >
                    All Languages
                  </SelectItem>
                  {[
                    "javascript",
                    "python",
                    "typescript",
                    "java",
                    "cpp",
                    "csharp",
                    "php",
                    "ruby",
                    "swift",
                    "go",
                    "rust",
                    "kotlin",
                    "sql",
                    "html",
                    "css",
                    "shell",
                  ]
                    .filter((lang) =>
                      lang
                        .toLowerCase()
                        .includes(languageSearchTerm.toLowerCase())
                    )
                    .map((language) => (
                      <SelectItem
                        key={language}
                        value={language}
                        className="dark:hover:bg-[#1e1d1c] dark:focus:bg-[#1e1d1c]"
                        onSelect={(e) => e.preventDefault()}
                      >
                        {language.charAt(0).toUpperCase() + language.slice(1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 sm:w-36 lg:w-40 h-9 sm:h-10 lg:h-12 dark:bg-[#161514]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#161514]">
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="dark:hover:bg-[#1e1d1c] dark:focus:bg-[#1e1d1c]"
                    >
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Analytics Button with improved contrast */}
          <Button
            onClick={() => router.push("/dashboard/snippets/analytics")}
            variant="outline"
            className="h-9 sm:h-10 lg:h-12 gap-2 bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/20 
            hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20 hover:border-emerald-500/30 dark:hover:border-emerald-500/30
            text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>

          {/* Leaderboard Button */}
          <Button
            onClick={() => router.push("/dashboard/leaderboard")}
            variant="outline"
            className="h-9 sm:h-10 lg:h-12 gap-2 bg-purple-500/10 dark:bg-purple-500/10 border-purple-500/20 dark:border-purple-500/20 
            hover:bg-purple-500/20 dark:hover:bg-purple-500/20 hover:border-purple-500/30 dark:hover:border-purple-500/30
            text-purple-700 dark:text-purple-400 text-xs sm:text-sm"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Button>
        </motion.div>

        {/* Snippet Grid - Updated Responsive Layout */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {(userData?.snippets ? filterAndSortSnippets(userData.snippets) : [])
            .length > 0 ? (
            (userData?.snippets
              ? filterAndSortSnippets(userData.snippets)
              : []
            ).map((snippet) => (
              <div key={snippet._id} className="group relative">
                <div
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  style={{ touchAction: "none" }}
                >
                  {/* Pin Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        const response = await fetch(
                          `${BASE_URL}/api/snippet/pin/${snippet._id}`,
                          {
                            method: "PATCH",
                            credentials: "include",
                            headers: {
                              "Content-Type": "application/json",
                            },
                          }
                        );

                        if (!response.ok) throw new Error("Failed to pin snippet");

                        const data = await response.json();
                        if (data.success) {
                          toast({
                            title: data.isPinned ? "Snippet pinned" : "Snippet unpinned",
                            description: data.isPinned
                              ? "Added to pinned snippets"
                              : "Removed from pinned snippets",
                          });
                          fetchUserData();
                        }
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to pin snippet",
                          variant: "destructive",
                        });
                      }
                    }}
                    className={cn(
                      "h-8 w-8 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-800",
                      "border border-zinc-200/50 dark:border-zinc-700/50",
                      "transition-all duration-200",
                      snippet.isPinned ? "text-blue-500" : "text-zinc-400"
                    )}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>

                  {/* Favorite Button */}
                  <FavoriteButton
                    snippetId={snippet._id}
                    isFavorited={userData?.user.favorites.includes(snippet._id) || false}
                    onFavoriteChange={handleFavoriteChange}
                  />
                </div>
                <div
                  onClick={() =>
                    router.push(`/dashboard/snippets/${snippet._id}`)
                  }
                  className="active:opacity-80 transition-opacity cursor-pointer" // Better touch feedback
                >
                  <SnippetCard
                    snippet={{
                      id: snippet._id,
                      title: snippet.title,
                      description: snippet.description,
                      language: snippet.language,
                      code: snippet.code,
                      tags: snippet.tags,
                      createdAt: snippet.createdAt,
                      isFavorite:
                        userData?.user.favorites.includes(snippet._id) || false,
                      isPinned: snippet.isPinned,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <motion.div
              className="col-span-full flex flex-col items-center justify-center p-12 bg-white/90 dark:bg-[#161514] rounded-xl border border-zinc-200 dark:border-zinc-200/10 backdrop-blur-[12px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="relative w-24 h-24 mb-6"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {/* Animated circles in the background */}
                <motion.div
                  className="absolute inset-0 bg-emerald-600/20 dark:bg-emerald-500/10 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-emerald-600/10 dark:bg-emerald-500/5 rounded-full"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.5, 0.3, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 10 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                >
                  <FileText className="w-12 h-12 text-emerald-700 dark:text-emerald-500" />
                </motion.div>
              </motion.div>

              <motion.h3
                className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {searchTerm ? "No matching snippets found" : "No snippets yet"}
              </motion.h3>

              <motion.p
                className="text-zinc-700 dark:text-zinc-400 text-center max-w-md mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {searchTerm
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "Start building your collection by creating your first code snippet."}
              </motion.p>

              <motion.button
                onClick={() => router.push("/dashboard/snippets/addsnippets")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-600/90 text-white 
                  hover:bg-emerald-700 dark:hover:bg-emerald-700 transition-colors shadow-sm
                  border border-emerald-600/30 dark:border-emerald-400/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Snippet</span>
              </motion.button>

              {/* Decorative dots */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-emerald-600/30 dark:bg-emerald-500/20"
                  style={{ left: "10%", top: "20%" }}
                  animate={{
                    y: [0, 20, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-emerald-600/30 dark:bg-emerald-500/20"
                  style={{ right: "15%", bottom: "30%" }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-emerald-600/30 dark:bg-emerald-500/20"
                  style={{ right: "30%", top: "15%" }}
                  animate={{
                    x: [0, 20, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-4 sm:bottom-6 lg:bottom-8 right-4 sm:right-6 lg:right-8 overflow-hidden">
          <motion.button
            onClick={() => router.push("/dashboard/snippets/addsnippets")}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
              dark:bg-emerald-600/90 dark:hover:bg-emerald-700 dark:active:bg-emerald-800
              text-white shadow-lg hover:shadow-xl
              rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
              flex items-center justify-center
              transform hover:scale-105 active:scale-95
              transition-all duration-200 ease-in-out
              border border-emerald-600/30 dark:border-emerald-400/20
              group z-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 2, // 3 seconds delay before appearing
              duration: 0.4,
              ease: "easeOut",
            }}
          >
            <PlusCircle
              className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 
              transform group-hover:rotate-90 transition-transform duration-200"
            />

            {/* Tooltip */}
            <span
              className="absolute right-full mr-3 px-2 py-1 
              bg-zinc-900/75 dark:bg-[#161514]/90 backdrop-blur-sm text-white text-sm
              rounded pointer-events-none whitespace-nowrap
              opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0
              transition-all duration-200 hidden sm:block
              border border-zinc-800/20 dark:border-zinc-100/10"
            >
              Create Snippet
            </span>
          </motion.button>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            className="fixed inset-0 bg-black/20 dark:bg-[#161514]/20 backdrop-blur-sm 
            flex items-center justify-center z-50"
          >
            <div className="relative w-4 h-8">
              <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-green-500 animate-loader"></div>
              <div className="absolute top-0 left-0 w-3.5 h-8 bg-green-500 animate-loader delay-150"></div>
              <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-green-500 animate-loader delay-300"></div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MySnippets;
