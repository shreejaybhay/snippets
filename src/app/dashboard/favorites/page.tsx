"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  PlusCircle,
  Star,
  Clock,
  SortAsc,
  SortDesc,
  Calendar,
  AlarmClock,
  Tags,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SnippetCard from "@/components/SnippetCard";
import FavoriteButton from "@/components/FavoriteButton";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  userId: string;
  createdAt: string;
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

const FavoritesPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const router = useRouter();
  const { toast } = useToast();

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
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        const data = await response.json();
        if (data.success) {
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
          description: "Failed to load favorites. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [toast, BASE_URL]);

  // Get favorite snippets
  const favoriteSnippets = userData?.snippets.filter((snippet) =>
    userData.user.favorites.includes(snippet._id)
  );

  // Calculate filtered favorite snippets
  const getFilteredFavorites = (snippets: Snippet[]) => {
    if (!snippets) return [];

    return snippets.filter(
      (snippet) =>
        (filterLanguage === "all" || snippet.language === filterLanguage) &&
        (snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          snippet.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          snippet.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    );
  };

  // Add this sorting function
  const getSortedFavorites = (snippets: Snippet[]) => {
    if (!snippets) return [];

    switch (sortBy) {
      case "oldest":
        return [...snippets].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "alphabetical":
        return [...snippets].sort((a, b) => a.title.localeCompare(b.title));
      case "most-tags":
        return [...snippets].sort((a, b) => b.tags.length - a.tags.length);
      default: // newest
        return [...snippets].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="relative w-4 h-8 text-transparent">
          <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-[#10B981] animate-loader"></div>
          <div className="absolute top-0 left-0 w-3.5 h-8 bg-[#10B981] animate-loader delay-150"></div>
          <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-[#10B981] animate-loader delay-300"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-background"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Stats Cards Section */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-2 md:mt-0"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {[
          {
            title: "All Favorites",
            count: favoriteSnippets?.length || 0,
            icon: <FileText size={18} className="text-green-500" />,
          },
          {
            title: "Today's Favs",
            count:
              favoriteSnippets?.filter(
                (snippet) =>
                  new Date(snippet.createdAt).toDateString() ===
                  new Date().toDateString()
              ).length || 0,
            icon: <PlusCircle size={18} className="text-blue-500" />,
          },
          {
            title: "Total Snippets",
            count: userData?.snippets.length || 0,
            icon: <Star size={18} className="text-yellow-500" />,
          },
          {
            title: "Recent",
            count: favoriteSnippets?.[0]?.title || "No favorites",
            icon: <Clock size={18} className="text-red-500" />,
            isRecent: true,
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="bg-white/60 dark:bg-[#161514] p-3 sm:p-6 rounded-xl shadow-sm border border-green-200/20 dark:border-green-100/10 flex flex-col relative backdrop-blur-[12px] hover:bg-white/80 dark:hover:bg-[#1c1c1a] transition-colors"
          >
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
              {item.icon}
            </div>
            <h2 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 line-clamp-1">
              {item.title}
            </h2>
            <h1
              className={`mt-1 sm:mt-2 font-bold ${
                item.isRecent
                  ? "text-sm sm:text-xl line-clamp-1"
                  : "text-lg sm:text-2xl"
              } truncate`}
            >
              {item.count}
            </h1>
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Search Bar & Filters */}
      <motion.div
        className="space-y-3 sm:space-y-0 sm:flex sm:gap-3 lg:gap-4 items-stretch sm:items-center"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Search Input */}
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search favorites..."
            className="h-10 sm:h-10 lg:h-12 text-sm sm:text-base bg-white/60 dark:bg-[#161514] border-green-200/20 dark:border-green-100/10 backdrop-blur-[12px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters Container */}
        <div className="flex gap-3 sm:gap-3">
          <Select value={filterLanguage} onValueChange={setFilterLanguage}>
            <SelectTrigger className="flex-1 sm:w-36 lg:w-40 h-10 sm:h-10 lg:h-12 bg-white/60 dark:bg-[#161514] border-green-200/20 dark:border-green-100/10 backdrop-blur-[12px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#161514] border-green-200/20 dark:border-green-100/10">
              <SelectItem value="all">All Languages</SelectItem>
              {["javascript", "python", "typescript", "java", "cpp", "ruby", "go"].map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 sm:w-36 lg:w-40 h-10 sm:h-10 lg:h-12 bg-white/60 dark:bg-[#161514] border-green-200/20 dark:border-green-100/10 backdrop-blur-[12px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#161514] border-green-200/20 dark:border-green-100/10">
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 h-4" />
                  <span>Newest</span>
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  <span>Oldest</span>
                </div>
              </SelectItem>
              <SelectItem value="alphabetical">
                <div className="flex items-center gap-2">
                  <AlarmClock className="w-4 h-4" />
                  <span>A-Z</span>
                </div>
              </SelectItem>
              <SelectItem value="most-tags">
                <div className="flex items-center gap-2">
                  <Tags className="w-4 h-4" />
                  <span>Most Tags</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Favorites Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {getFilteredFavorites(getSortedFavorites(favoriteSnippets || []))?.length > 0 ? (
          getFilteredFavorites(getSortedFavorites(favoriteSnippets || [])).map((snippet) => (
            <div key={snippet._id} className="group relative">
              <div
                className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
                style={{ touchAction: "none" }}
              >
                <FavoriteButton
                  snippetId={snippet._id}
                  isFavorited={true}
                  onFavoriteChange={handleFavoriteChange}
                />
              </div>
              <div
                onClick={() => router.push(`/dashboard/snippets/${snippet._id}`)}
                className="active:opacity-80 transition-opacity cursor-pointer"
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
                    isFavorite: true,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-8 sm:py-10 px-4 text-center bg-white/60 dark:bg-[#161514] rounded-xl border border-green-200/20 dark:border-green-100/10 backdrop-blur-[12px]">
            <Star className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-2">
              {searchTerm ? "No matching favorites found." : "No favorites yet."}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Start adding favorites by clicking the star icon on any snippet."}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FavoritesPage;
