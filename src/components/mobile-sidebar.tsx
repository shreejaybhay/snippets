"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, FileText, Star, User, Settings, LogOut, Code, FolderIcon, Rss } from "lucide-react";
import { ModeToggle } from "./ui/mode-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const handleLogout = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      
      if (res.ok) {
        setIsOpen(false); // Close the mobile sidebar
        router.replace("/"); // Redirect to home page
      } else {
        console.error("Logout failed:", await res.text());
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    // Check authentication status
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
      }
    };
    
    checkAuth();
  }, []);

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
    <div className="md:hidden fixed top-0 left-0 right-0 z-[9999] bg-white dark:bg-[#1C1917]">
      {/* Main header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-green-100/10">
        <div className="flex items-center gap-3">
          <Code className="h-6 w-6 text-emerald-500" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Snippets</h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} className="text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-[#1C1917] shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Drawer header with proper layout */}
                <div className="p-4 border-b border-gray-200 dark:border-green-100/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Code className="h-6 w-6 text-emerald-500" />
                      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Snippets</h1>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                      aria-label="Close menu"
                    >
                      <X size={24} className="text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto">
                  {isAuthenticated && menuItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className="outline-none block"
                    >
                      <div
                        className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                          pathname === item.path
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <div className={pathname === item.path ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}>
                          {item.icon}
                        </div>
                        <span className="ml-3 text-[15px] font-medium">
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Bottom Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="mt-auto w-full flex flex-col items-center border-t border-gray-200 dark:border-green-100/10 py-4 bg-white dark:bg-[#1C1917]"
                >
                  <div className="w-full flex justify-center">
                    <ModeToggle />
                  </div>

                  {isAuthenticated ? (
                    <button
                      onClick={handleLogout}
                      className="mt-4 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center w-5/6 justify-center transition-colors"
                    >
                      <LogOut size={20} className="mr-2" />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <div className="mt-4 w-5/6 space-y-2">
                      <Link href="/login" className="w-full block">
                        <Button
                          variant="outline"
                          className="w-full justify-center"
                          onClick={() => setIsOpen(false)}
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup" className="w-full block">
                        <Button
                          className="w-full justify-center bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileSidebar;
