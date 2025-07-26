import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Cloud, Search, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true }}
    >
      <Card className="relative overflow-hidden group border-zinc-200/30 dark:border-zinc-800/30 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="relative z-20 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
                <Icon className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="absolute inset-0 blur-2xl bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <h3 className="text-lg md:text-xl font-semibold mb-2 text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors duration-300">
              {title}
            </h3>

            <p className="text-sm md:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </CardContent>
      </Card>
    </motion.div>
  );
};

const features: FeatureCardProps[] = [
  {
    icon: BrainCircuit,
    title: "Syntax Highlighting",
    description: "Supports 100+ languages with elegant syntax highlighting.",
    index: 0,
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Sync snippets securely across devices.",
    index: 1,
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find snippets instantly with powerful search.",
    index: 2,
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden min-h-[690px]">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        {/* Code preview section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-xs md:text-sm text-zinc-400">
                example.js
              </span>
            </div>
            <div className="p-4">
              <pre className="text-xs md:text-sm">
                <code className="text-emerald-400">function</code>{" "}
                <code className="text-yellow-400">hello</code>
                <code className="text-white">()</code>{" "}
                <code className="text-white">{"{"}</code>
                <br />
                <code className="text-white ml-4">console</code>
                <code className="text-white">.</code>
                <code className="text-blue-400">log</code>
                <code className="text-white">(</code>
                <code className="text-green-400">&quot;Hello, World!&quot;</code>
                <code className="text-white">);</code>
                <br />
                <code className="text-white">{"}"}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
