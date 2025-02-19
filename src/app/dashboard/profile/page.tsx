"use client";

import React, { useEffect, useState } from "react";
import { User, Clock, Code, Edit } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "../../../hooks/use-toast";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import Link from "next/link";

interface Snippet {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface UserData {
  success: boolean;
  user: {
    username: string;
    email: string;
    profileURL?: string;
    createdAt: string;
    _id: string;
  };
  snippets: Snippet[];
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15,
    },
  },
};

const Profile: React.FC = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

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

  const stats: StatItem[] = [
    {
      label: "Total Snippets",
      value: userData?.snippets?.length || 0,
      icon: <Code className="w-5 h-5" />,
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
      icon: <Clock className="w-5 h-5" />,
    },
  ];

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

  return (
    <div className="max-h-screen p-3 sm:p-6 mt-3 md:mt-0">
      <motion.div
        className="max-w-8xl mx-auto space-y-4 sm:space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="space-y-4 dark:bg-[#161514] rounded-xl relative">
              <div 
                className="flex items-center justify-between relative z-10 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => router.push('/dashboard/profile/edit')}
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <motion.div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {userData.user.profileURL ? (
                      <Image
                        src={userData.user.profileURL}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    )}
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <h1 className="text-xl sm:text-2xl font-bold">
                      {userData.user.username}
                    </h1>
                    <p className="text-sm sm:text-base text-zinc-400">
                      {userData.user.email}
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
                    className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center justify-center cursor-pointer"
                    role="button"
                    aria-label="Edit Profile"
                    onClick={(e) => e.stopPropagation()} // Prevent the parent's onClick from firing
                  >
                    <Edit className="w-5 h-5 text-emerald-600" />
                  </Link>
                </motion.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

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
                            {new Date(snippet.createdAt).toLocaleDateString()}
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
      </motion.div>
    </div>
  );
};

export default Profile;
