"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { User, Clock, Code, Edit } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
      <div className="flex items-center justify-center h-screen">
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
    <div className="max-h-screen p-6">
      <motion.div
        className="max-w-8xl mx-auto space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="space-y-4 dark:bg-[#161514] rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    className="w-16 h-16 rounded-full overflow-hidden"
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
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <h1 className="text-2xl font-bold">
                      {userData.user.username}
                    </h1>
                    <p className="text-zinc-400">{userData.user.email}</p>
                  </motion.div>
                </div>
                <motion.button
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link href="/dashboard/profile/edit">
                    <Edit className="w-5 h-5 text-emerald-600" />
                  </Link>
                </motion.button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring" }}
            >
              <Card className="dark:bg-[#161514]">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="text-emerald-500">{stat.icon}</div>
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
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
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Snippets</h2>
              <motion.div className="space-y-4" variants={containerVariants}>
                {userData.snippets.map((snippet) => (
                  <motion.div
                    key={snippet._id}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-zinc-800/50 transition-colors"
                    variants={itemVariants}
                  >
                    <motion.div
                      className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-600/20 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Code className="w-5 h-5 text-emerald-500" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{snippet.title}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {new Date(snippet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-zinc-500 mt-1">
                        {snippet.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
