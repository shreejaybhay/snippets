"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, PlusCircle, Star, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const filteredFavorites = favoriteSnippets?.filter(
    (snippet) =>
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

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
      className="p-3 sm:p-6 mt-2 sm:mt-0" // Added mt-2 for mobile, sm:mt-0 to remove it on desktop
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Stats Cards Section */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {[
          {
            title: "All Favorites",
            count: favoriteSnippets?.length || 0,
            icon: <FileText size={20} className="text-green-500" />,
          },
          {
            title: "Today's Favs",
            count:
              favoriteSnippets?.filter(
                (snippet) =>
                  new Date(snippet.createdAt).toDateString() ===
                  new Date().toDateString()
              ).length || 0,
            icon: <PlusCircle size={20} className="text-blue-500" />,
          },
          {
            title: "Total Snippets",
            count: userData?.snippets.length || 0,
            icon: <Star size={20} className="text-yellow-500" />,
          },
          {
            title: "Recent",
            count: favoriteSnippets?.[0]?.title || "No favorites",
            icon: <Clock size={20} className="text-red-500" />,
            isRecent: true,
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="dark:bg-[#1C1917]/40 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border dark:border-green-100/10 flex flex-col relative"
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

      {/* Search Bar */}
      <motion.div
        className="mb-4 sm:mb-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Input
          type="text"
          placeholder="Search favorites..."
          className="w-full h-10 sm:h-12 text-base sm:text-lg dark:bg-[#1C1917]/40 dark:text-white border dark:border-green-100/10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {/* Favorites Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {filteredFavorites && filteredFavorites.length > 0 ? (
          filteredFavorites.map((snippet) => (
            <div key={snippet._id} className="group relative">
              <div
                className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                style={{ touchAction: "none" }} // Better touch handling
              >
                <FavoriteButton
                  snippetId={snippet._id}
                  isFavorited={true}
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
                    isFavorite: true,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10 px-4 text-center">
            <Star className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-400 text-lg mb-2">
              {searchTerm
                ? "No matching favorites found."
                : "No favorites yet."}
            </p>
            <p className="text-gray-500 text-sm">
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
