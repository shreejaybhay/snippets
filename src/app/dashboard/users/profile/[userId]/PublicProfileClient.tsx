"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Heart, MessageSquare, Eye, Calendar, Code } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/FollowButton";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

interface Snippet {
  _id: string;
  title: string;
  description: string;
  language: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  code: string;
  isPublic: boolean;
  userId: string;
}

interface Profile {
  user: {
    _id: string;
    username: string;
    profileURL?: string;
    bannerURL?: string;
    createdAt: string;
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
    snippetsCount: number;
  };
  snippets: Snippet[];
}

interface SerializedUser {
  _id: string;
  username: string;
  email: string;
  profileURL: string | null;
  bannerURL: string | null;
  createdAt: string;
  updatedAt: string;
  followers: string[];
  following: string[];
  followersCount: number;
  followingCount: number;
  favorites: string[];
}

interface PublicProfileClientProps {
  userId: string;
  currentUser: SerializedUser;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function PublicProfileClient({ 
  userId, 
  currentUser
}: PublicProfileClientProps) {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const handleFollowToggle = (newIsFollowing: boolean) => {
    if (profile) {
      setProfile({
        ...profile,
        user: {
          ...profile.user,
          isFollowing: newIsFollowing
        }
      });
    }
  };

  const handleFollowCountChange = (increment: boolean) => {
    if (profile) {
      setProfile({
        ...profile,
        user: {
          ...profile.user,
          followersCount: profile.user.followersCount + (increment ? 1 : -1)
        }
      });
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/users/${userId}/profile`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, BASE_URL]);

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

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-gray-500 text-center mb-4">
          {error || "The user profile you're looking for doesn't exist or has been removed."}
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 relative">
      <motion.div 
        className="max-w-4xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <Card className="dark:bg-[#161514] overflow-hidden">
            {/* Banner Section */}
            {profile.user.bannerURL ? (
              <div 
                className="h-32 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${profile.user.bannerURL})`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover'
                }}
              />
            ) : (
              <div className="h-32 bg-gradient-to-r from-emerald-500 to-emerald-600" />
            )}
            
            <CardHeader className="relative p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-[#161514] -mt-16">
                  {profile.user.profileURL ? (
                    <AvatarImage src={profile.user.profileURL} alt={profile.user.username} />
                  ) : (
                    <AvatarFallback className="bg-emerald-600">
                      <User className="w-12 h-12 text-white" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{profile.user.username}</h1>
                    <div className="flex items-center gap-2">
                      <FollowButton
                        userId={profile.user._id}
                        initialIsFollowing={profile.user.isFollowing}
                        onFollowToggle={handleFollowToggle}
                        onCountChange={handleFollowCountChange}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {format(new Date(profile.user.createdAt), "MMMM d, yyyy")}</span>
                  </div>
                  
                  {/* Stats Section */}
                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{profile.user.snippetsCount}</span>
                      <span className="text-gray-500">Snippets</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{profile.user.followersCount}</span>
                      <span className="text-gray-500">Followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{profile.user.followingCount}</span>
                      <span className="text-gray-500">Following</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Snippets Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Public Snippets</h2>
            <span className="text-sm text-gray-500">
              {profile.snippets.length} snippet{profile.snippets.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="grid gap-4">
            {profile.snippets.length > 0 ? (
              profile.snippets.map((snippet) => (
                <Link key={snippet._id} href={`/dashboard/s/${snippet._id}`}>
                  <Card 
                    className="dark:bg-[#161514] transform-gpu transition-all duration-200 ease-out hover:shadow-lg hover:translate-y-[-2px] will-change-transform"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg group-hover:text-emerald-500 transition-colors">
                            {snippet.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {snippet.description}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="ml-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        >
                          {snippet.language}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{snippet.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{snippet.commentsCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{snippet.views}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(snippet.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="dark:bg-[#161514]">
                <CardContent className="p-8 text-center">
                  <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Public Snippets</h3>
                  <p className="text-gray-500">
                    {profile.user.username} hasn't published any public snippets yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </motion.div>
      {/* Remove the floating message button */}
      {/* {showMessageButton && (
        <Button
          onClick={handleMessageClick}
          className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Message</span>
        </Button>
      )} */}
    </div>
  );
}
