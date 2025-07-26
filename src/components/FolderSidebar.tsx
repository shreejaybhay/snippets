"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

interface FolderItem {
  _id: string;
  name: string;
  color: string;
  snippetCount: number;
}

interface FolderSidebarProps {
  folders: FolderItem[];
  onCreateFolder: () => void;
  onEditFolder: (folder: FolderItem) => void;
  onDeleteFolder: (folderId: string) => void;
}

export default function FolderSidebar({
  folders,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
}: FolderSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 h-full flex flex-col">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            Folders
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateFolder}
            className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {folders.map((folder) => (
                <div
                  key={folder._id}
                  className={cn(
                    "group flex items-center justify-between px-2 py-2 rounded-lg",
                    pathname === `/dashboard/folders/${folder._id}`
                      ? "bg-zinc-100 dark:bg-zinc-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  <button
                    onClick={() => router.push(`/dashboard/folders/${folder._id}`)}
                    className="flex items-center flex-1 min-w-0"
                  >
                    <Folder
                      className="h-4 w-4 mr-2 flex-shrink-0"
                      style={{ color: folder.color }}
                    />
                    <span className="truncate text-sm">{folder.name}</span>
                    <span className="ml-2 text-xs text-zinc-400">
                      {folder.snippetCount}
                    </span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => onEditFolder(folder)}
                        className="cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteFolder(folder._id)}
                        className="cursor-pointer text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}