"use client";

import { GithubIcon } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

const Footer = () => {
  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}        
      transition={{
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="w-full border-t border-zinc-200/20 dark:border-zinc-800/10 
        bg-white/80 dark:bg-zinc-900/70 backdrop-blur-2xl 
        supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-900/60"
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between h-16 px-6 lg:px-8">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-sm text-zinc-500 dark:text-zinc-400"
        >
          © 2024 Snippets. All rights reserved.
        </motion.span>

        <motion.a
          href="https://github.com/shreejaybhay"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/40 
            p-2 rounded-lg transition-colors duration-300"
        >
          <GithubIcon className="h-5 w-5" />
        </motion.a>
      </div>
    </motion.footer>
  );
};

export default Footer;
