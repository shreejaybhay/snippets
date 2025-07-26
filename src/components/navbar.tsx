"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { CodeIcon, Menu, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface User {
  _id: string;
  email: string;
  username: string;
  profileURL?: string;
}

interface NavbarProps {
  user?: User;
}

export function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <motion.header
      layout
      layoutRoot
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="fixed top-0 z-50 w-full border-b border-zinc-200/20 dark:border-zinc-800/10
        bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60"
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex items-center gap-3"
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <CodeIcon className="h-6 w-6 text-emerald-500 group-hover:text-emerald-400 
                transition-colors duration-500" />
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl 
                group-hover:blur-2xl transition-all duration-500 
                opacity-0 group-hover:opacity-100" />
            </div>
            <span className="font-semibold text-lg bg-clip-text text-transparent 
              bg-gradient-to-r from-zinc-800 to-zinc-600 
              dark:from-white dark:to-zinc-200 group-hover:to-emerald-500 
              transition-all duration-500">
              Snippets
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="hidden md:flex items-center gap-6"
        >
          {!user && (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-4 text-zinc-600 dark:text-zinc-300
                    hover:text-zinc-900 dark:hover:text-white
                    hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30
                    transition-all duration-300"
                >
                  Log In
                </Button>
              </Link>

              <Link href="/signup">
                <Button
                  size="sm"
                  className="relative px-4 bg-emerald-500 hover:bg-emerald-600
                    text-white font-medium group overflow-hidden transition-all duration-300"
                >
                  <span className="relative z-10">Sign Up Free</span>
                  <div
                    className="absolute inset-0 -translate-y-full group-hover:translate-y-0
                      bg-gradient-to-r from-emerald-400 to-emerald-500
                      transition-transform duration-300"
                  />
                  <div
                    className="absolute inset-0 translate-y-full group-hover:translate-y-0
                      bg-gradient-to-r from-emerald-500 to-emerald-400
                      transition-transform duration-300"
                  />
                </Button>
              </Link>
            </>
          )}

          <div className="pl-3 border-l border-zinc-200/30 dark:border-zinc-700/30">
            <ModeToggle />
          </div>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="md:hidden flex items-center gap-4"
        >
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-zinc-200/20 dark:border-zinc-800/10"
          >
            <div className="px-4 py-4 space-y-3 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl">
              {!user && (
                <>
                  <Link href="/login" onClick={toggleMenu}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-zinc-600 dark:text-zinc-300
                        hover:text-zinc-900 dark:hover:text-white
                        hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30
                        transition-all duration-300"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={toggleMenu}>
                    <Button
                      size="sm"
                      className="w-full justify-center bg-emerald-500 hover:bg-emerald-600
                        text-white font-medium transition-all duration-300"
                    >
                      Sign Up Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
