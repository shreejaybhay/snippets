"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code2, Tags, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export default function LearnMore() {
  return (
    <>
      <div className="w-full min-h-screen bg-background overflow-x-hidden">
        <main className="relative w-full pt-16">
          {/* Hero Section */}
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-900/50 -z-10" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl"
              >
                <h1 className="text-5xl sm:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 leading-tight">
                  Code Library for Modern Developers
                </h1>
                <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                  Store, manage, and share your code snippets with a powerful,
                  modern platform designed for developers.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Feature 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                        <Code2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-semibold">
                        Syntax Highlighting
                      </h3>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                      Write and store code in multiple programming languages
                      with beautiful syntax highlighting and real-time preview.
                    </p>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 h-48 overflow-hidden flex items-center justify-center">
                      <img
                        src="https://i.postimg.cc/4ycK3QmB/image.png"
                        alt="Syntax Highlighting Preview"
                        className=" object-contain "
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                        <Tags className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-semibold">
                        Smart Organization
                      </h3>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                      Keep your snippets organized with tags and categories.
                      Quick search functionality to find what you need.
                    </p>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 h-48 overflow-hidden flex items-center justify-center">
                      <img
                        src="https://i.postimg.cc/9QhxCxrg/asdfasdf.jpg"
                        alt="Syntax Highlighting Preview"
                        className=" object-contain "
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Feature 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 md:col-span-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                        <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-semibold">
                        Private & Secure
                      </h3>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                      Control access to your code with public and private
                      snippets. Enterprise-grade security with JWT
                      authentication.
                    </p>
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 h-48 overflow-hidden flex items-center justify-center">
                    <img
                        src="https://i.postimg.cc/dVZqcVZj/steptodown-com775331.jpg"
                        alt="Syntax Highlighting Preview"
                        className=" object-contain scale-105"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-24 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-900/50 -z-10" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-8">
                Start Building Your Code Library
              </h2>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12 text-base"
                >
                  Create Free Account
                </Button>
              </Link>
            </motion.div>
          </section>
        </main>
      </div>
    </>
  );
}
