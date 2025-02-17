"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, FileText, Star, User, Settings, LogOut, Code } from "lucide-react";
import { ModeToggle } from "./ui/mode-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const menuItems = [
    {
      name: "Snippets",
      icon: <FileText size={22} />,
      path: "/dashboard/snippets",
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
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-[9999]"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-white dark:bg-[#1C1917] border-l border-gray-200 dark:border-green-100/10 shadow-xl flex flex-col z-[10000]"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-green-100/10 bg-white dark:bg-[#1C1917]">
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

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto py-4 px-2 bg-white dark:bg-[#1C1917]">
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.path;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link 
                        href={item.path} 
                        onClick={() => setIsOpen(false)} 
                        className="outline-none block"
                      >
                        <div
                          className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <div className={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}>
                            {item.icon}
                          </div>
                          <span className="ml-3 text-[15px] font-medium">
                            {item.name}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

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

                <button
                  onClick={handleLogout}
                  className="mt-4 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center w-5/6 justify-center transition-colors"
                >
                  <LogOut size={20} className="mr-2" />
                  <span>Logout</span>
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileSidebar;
