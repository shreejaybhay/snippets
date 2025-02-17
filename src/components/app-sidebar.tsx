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
} from "lucide-react";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/ui/mode-toggle";

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
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
      name: "Favorites",
      icon: <Star size={22} />,
      path: "/dashboard/favorites",
    },
    { name: "Profile", icon: <User size={22} />, path: "/dashboard/profile" },
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
      className={`h-screen dark:bg-[#1C1917]/40 text-sidebar-foreground border-r border-sidebar-border flex flex-col shadow-lg ${
        isMobile && collapsed ? "hidden" : "block"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border">
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
          className="p-2 rounded-md hover:bg-sidebar-accent transition flex items-center justify-center"
        >
          <Menu size={22} />
        </motion.button>
      </div>

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
                  className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition ${
                    collapsed ? "justify-center" : "justify-start"
                  } ${
                    isActive
                      ? "bg-green-100/80 dark:bg-green-100/10 text-green-600 dark:text-green-400"
                      : "dark:hover:bg-green-100/10 hover:bg-green-100/80 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <div>{item.icon}</div>
                  {!collapsed && (
                    <span className="ml-3 text-[15px]">{item.name}</span>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

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

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          onClick={handleLogout}
          className="mt-4 px-4 py-3 bg-[#0d9e6e] text-white rounded-lg flex items-center w-5/6 justify-center hover:bg-[#10B981] transition"
        >
          <LogOut size={22} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default AppSidebar;
