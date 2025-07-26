"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, UserMinus, Search, Users, Clock, Link2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  profileURL?: string;
  bannerURL?: string;
  createdAt: string;
  isFollowing?: boolean;
  snippetsCount?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users`, {
        credentials: "include", // Important for getting authenticated user's following status
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.users.map((user: any) => ({
          ...user,
          isFollowing: user.isFollowing || false // Make sure this property exists
        })));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/${userId}/follow`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        ));
        toast({
          title: "Success",
          description: data.isFollowing ? "User followed successfully" : "User unfollowed successfully",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to follow/unfollow user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#161514]/80 backdrop-blur-lg pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 w-full bg-gray-100 dark:bg-[#1e1d1c] border-none rounded-xl"
          />
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Users className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No users found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search terms
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#161514] rounded-xl p-4 flex items-center justify-between gap-4 border border-gray-100 dark:border-gray-800 hover:border-emerald-500/20 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Link href={`/dashboard/users/profile/${user._id}`}>
                  <Avatar className="h-16 w-16 rounded-full ring-2 ring-offset-2 dark:ring-offset-[#161514] ring-emerald-500/20">
                    <AvatarImage src={user.profileURL} className="object-cover" />
                    <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-xl">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/dashboard/users/profile/${user._id}`}
                    className="hover:text-emerald-500 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {user.username}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {user.snippetsCount || 0} snippets
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={user.isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleFollow(user._id)}
                  className={`
                    ${user.isFollowing 
                      ? 'bg-transparent hover:bg-red-500/10 hover:text-red-500 border-gray-200 dark:border-gray-700 group' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
                    transition-all duration-200
                  `}
                >
                  {user.isFollowing ? (
                    <>
                      <span className="group-hover:hidden">Following</span>
                      <span className="hidden group-hover:inline">Unfollow</span>
                    </>
                  ) : (
                    "Follow"
                  )}
                </Button>
                
                <Link href={`/dashboard/users/profile/${user._id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-emerald-500"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 bg-white dark:bg-[#161514] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 space-y-2"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {users.length} Total Users
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {users.filter(user => user.isFollowing).length} Following
          </span>
        </div>
      </motion.div>
    </div>
  );
}
