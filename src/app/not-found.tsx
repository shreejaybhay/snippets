"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Code2, Home, MoveLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-2xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* 404 Code Icon */}
        <motion.div 
          className="mb-6 flex justify-center"
          variants={itemVariants}
        >
          <div className="relative">
            <Code2 className="w-20 h-20 text-[#22C55E]" />
            <motion.div
              className="absolute -top-2 -right-2 bg-[#22C55E] text-black font-bold px-2 py-1 rounded"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
            >
              404
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-4xl font-bold text-white mb-4"
          variants={itemVariants}
        >
          Snippet Not Found
        </motion.h1>

        {/* Description */}
        <motion.p 
          className="text-gray-400 mb-8 text-lg"
          variants={itemVariants}
        >
          Oops! It seems the code snippet you&apos;re looking for has gone missing in the matrix.
        </motion.p>

        {/* Code Block */}
        <motion.div 
          className="mb-8 text-left"
          variants={itemVariants}
        >
          <div className="bg-[#1C1917]/40 p-4 rounded-lg border border-[#2a2a2a] font-mono text-sm">
            <div className="text-gray-400">
              <span className="text-[#22C55E]">const</span>{" "}
              <span className="text-blue-400">findSnippet</span> = {" "}
              <span className="text-[#22C55E]">()</span> {"=>"} {"{"}
            </div>
            <div className="text-gray-400 pl-4">
              <span className="text-[#22C55E]">return</span>{" "}
              <span className="text-orange-400">&apos;404: Page Not Found&apos;</span>;
            </div>
            <div className="text-gray-400">{"};"}</div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex gap-4 justify-center"
          variants={itemVariants}
        >
          <Button
            variant="outline"
            className="h-10 border-[#1f1f1f] hover:bg-[#121212] hover:text-white"
            asChild
          >
            <Link href="/">
              <MoveLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
          <Button 
            className="h-10 bg-[#22C55E] hover:bg-[#1ea550] text-black font-medium"
            asChild
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
