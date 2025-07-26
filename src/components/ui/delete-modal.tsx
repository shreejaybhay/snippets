"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteModal({ isOpen, onClose, onDelete }: DeleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn(
              "absolute inset-0",
              "bg-black/40 backdrop-blur-[2px]",
              "cursor-pointer"
            )}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative z-50 w-full max-w-md m-4",
              "overflow-hidden rounded-2xl",
              "bg-white/80 dark:bg-zinc-900/80",
              "backdrop-blur-xl shadow-xl",
              "border border-zinc-200/20 dark:border-zinc-700/30"
            )}
          >
            {/* Content Container */}
            <div className="p-6">
              {/* Warning Icon with Pulse Effect */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-400/20" />
                  <div className="relative rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                    <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400" />
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="text-center">
                <h2 className={cn(
                  "text-xl font-semibold",
                  "bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent",
                  "dark:from-red-400 dark:to-red-500"
                )}>
                  Delete Snippet
                </h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Are you sure you want to delete this snippet? This action
                  cannot be undone and will permanently remove the snippet from
                  your collection.
                </p>
              </div>

              {/* Actions */}
              <div className={cn(
                "mt-6 flex flex-col-reverse sm:flex-row gap-2",
                "sm:justify-center"
              )}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className={cn(
                    "w-full sm:w-auto",
                    "bg-zinc-100 dark:bg-zinc-800",
                    "border border-zinc-200 dark:border-zinc-700",
                    "text-zinc-900 dark:text-zinc-100",
                    "hover:bg-zinc-200 dark:hover:bg-zinc-700/80",
                    "transition-colors duration-200"
                  )}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={onDelete}
                  className={cn(
                    "w-full sm:w-auto",
                    "bg-red-500 hover:bg-red-600",
                    "dark:bg-red-600 dark:hover:bg-red-700",
                    "text-white font-medium",
                    "transition-colors duration-200",
                    "focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                    "dark:focus:ring-red-400 dark:focus:ring-offset-zinc-900 dark:text-white"
                  )}
                >
                  Delete Snippet
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
