"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  FileText,
  Star,
  User,
  Settings,
  Code,
  LogOut,
  LogIn,
  UserPlus,
  FolderIcon,
  Rss,
} from "lucide-react";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Changed to null initially
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Handle resize effect
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle authentication check
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(data.success);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Show loading state
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="fixed top-0 left-0 bottom-0 w-64 dark:bg-[#161514] text-sidebar-foreground border-r border-sidebar-border flex flex-col shadow-lg">
        {/* Header with logo skeleton */}
        <div className="flex items-center h-14 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 w-full">
            <div className="h-7 w-7 rounded-md bg-emerald-500/20 animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700/50 animate-pulse rounded-md" />
          </div>
        </div>

        {/* Menu items skeleton */}
        <div className="flex-1 p-4 space-y-3">
          {/* Navigation items */}
          <div className="space-y-2 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700/50 animate-pulse rounded" />
              </div>
            ))}
          </div>

          {/* Bottom section skeleton */}
          <div className="absolute bottom-4 left-4 right-4 space-y-3">
            <div className="h-8 w-8 mx-auto rounded-md bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-emerald-500/20 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setIsAuthenticated(false);
        router.replace("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      name: "Snippets",
      icon: <FileText size={22} />,
      path: "/dashboard/snippets",
    },
    {
      name: "Feed",
      icon: <Rss size={22} />,
      path: "/dashboard/feed",
    },
    {
      name: "Folders",
      icon: <FolderIcon size={22} />,
      path: "/dashboard/folders",
    },
    {
      name: "Favorites",
      icon: <Star size={22} />,
      path: "/dashboard/favorites",
    },
    { 
      name: "Profile", 
      icon: <User size={22} />, 
      path: "/dashboard/profile" 
    },
    {
      name: "Settings",
      icon: <Settings size={22} />,
      path: "/dashboard/settings",
    },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? (isMobile ? 0 : 64) : 256 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
      className={`h-screen dark:bg-[#161514] text-sidebar-foreground border-r border-sidebar-border flex flex-col shadow-lg ${
        isMobile && collapsed ? "hidden" : "block"
      }`}
    >
      <div className="flex items-center h-14 px-3 border-b border-sidebar-border relative">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <Code className="h-6 w-6 text-emerald-500 transition-colors duration-500" />
            <h1 className="text-lg font-semibold">Snippets</h1>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-sidebar-accent transition flex items-center justify-center absolute right-3"
        >
          <Menu size={22} />
        </motion.button>
      </div>

      {isAuthenticated ? (
        <nav className="flex flex-col mt-4 space-y-2 mx-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={item.path} className="outline-none">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center ${
                      collapsed ? "justify-center" : "px-4"
                    } py-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "bg-green-100/80 dark:bg-green-100/10 text-green-600 dark:text-green-400"
                        : "dark:hover:bg-green-100/10 hover:bg-green-100/80 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 1, x: 0 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 text-[15px]"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      ) : (
        <div className="flex-1" />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mt-auto w-full flex flex-col items-center border-t border-sidebar-border py-4"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-full flex justify-center"
        >
          <ModeToggle />
        </motion.div>

        {isAuthenticated ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={handleLogout}
            className={`mt-4 ${
              collapsed ? "px-2" : "px-4"
            } py-3 bg-[#0d9e6e] text-white rounded-lg flex items-center ${
              collapsed ? "w-14" : "w-5/6"
            } justify-center hover:bg-[#10B981] transition`}
          >
            <LogOut size={22} />
            {!collapsed && <span className="ml-3">Logout</span>}
          </motion.button>
        ) : (
          <div className={`mt-4 ${collapsed ? "w-14" : "w-5/6"} space-y-2`}>
            <Link href="/login" className="w-full block">
              <Button variant="outline" className="w-full justify-center">
                {collapsed ? <LogIn size={22} /> : "Login"}
              </Button>
            </Link>
            <Link href="/signup" className="w-full block">
              <Button className="w-full justify-center bg-emerald-600 hover:bg-emerald-700">
                {collapsed ? <UserPlus size={22} /> : "Sign Up"}
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AppSidebar;
