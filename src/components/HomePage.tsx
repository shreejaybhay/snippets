"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Spotlight from "./ui/spotlight-new";
import { Button } from "@/components/ui/button";
import FeaturesSection from "./FeaturesSection";
import Footer from "./footer";
import Link from "next/link";

export function SpotlightNewDemo() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full">
        <div className={`w-full min-h-screen flex flex-col items-center justify-center
          bg-[--background] relative ${isClient ? "bg-grid" : ""}`}
        >
          {/* Spotlight */}
          <div className="absolute inset-0 z-0">
            <Spotlight />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent z-1" />

          {/* Grid overlay */}
          <div className={`absolute inset-0 ${isClient ? "bg-grid opacity-30" : ""}`} />

          {/* Content */}
          <div className="p-4 max-w-7xl mx-auto relative z-10 -mt-16">
            {/* Your existing content (motion.div elements) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-emerald-500">
                Code Sharing, Simplified
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-bold text-center mb-8"
            >
              <span className="dark:text-white text-zinc-900 relative z-20">
                Store and Share
              </span>{" "}
              <span className="text-emerald-500 inline-block relative">
                Code Snippets
                <div className="absolute -inset-1 bg-emerald-500/30 blur-2xl dark:bg-emerald-500/30" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="text-xl md:text-2xl max-w-3xl text-center mx-auto
              text-zinc-800 dark:text-zinc-200 mb-12 leading-relaxed font-medium"
            >
              A modern, minimal solution for developers to organize and share code
              snippets with powerful features and collaborative tools.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="px-8 bg-emerald-500 hover:bg-emerald-600
                text-white font-medium text-lg transition-all"
              >
                <Link href="/login">Get Started</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 text-lg border-zinc-300 dark:border-zinc-700
                text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100
                dark:hover:bg-zinc-800 font-medium transition-all"
              >
                <Link href="/learn">Learn More</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative">
        <section>
          <FeaturesSection />
        </section>
        <Footer />
      </div>
    </div>
  );
}
