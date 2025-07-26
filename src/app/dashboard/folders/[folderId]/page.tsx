"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Folder, 
  ArrowLeft, 
  Code, 
  Calendar,
  Clock,
  Search,
  Plus,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import SnippetCard from "@/components/SnippetCard";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface FolderData {
  _id: string;
  name: string;
  description: string;
  color: string;
  snippetCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Snippet {
  _id: string; // from backend
  id: string; // for SnippetCard
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: string;
}

// Add this new interface
interface AvailableSnippet extends Snippet {
  isSelected?: boolean;
}

export default function FolderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [folder, setFolder] = useState<FolderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Filter snippets based on search term
  const filteredSnippets = snippets.filter(
    (snippet) =>
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new states
  const [showAddSnippetsDialog, setShowAddSnippetsDialog] = useState(false);
  const [availableSnippets, setAvailableSnippets] = useState<AvailableSnippet[]>([]);
  const [selectedSnippets, setSelectedSnippets] = useState<string[]>([]);
  const [addingSnippets, setAddingSnippets] = useState(false);
  const [searchAvailableSnippets, setSearchAvailableSnippets] = useState("");

  // Fetch available snippets that are not in the current folder
  const fetchAvailableSnippets = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/snippets`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        // Filter out snippets that are already in the folder
        const availableSnips = data.snippets.filter(
          (snippet: Snippet) => !snippets.some(s => s._id === snippet._id)
        );
        setAvailableSnippets(availableSnips);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load available snippets",
        variant: "destructive",
      });
    }
  };

  // Handle adding selected snippets to folder
  const handleAddSnippets = async () => {
    if (selectedSnippets.length === 0) return;

    setAddingSnippets(true);
    try {
      // Change the endpoint to match your snippets/folder endpoint
      const response = await fetch(`${BASE_URL}/api/snippets/folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          snippetIds: selectedSnippets,
          folderId: params.folderId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add snippets to folder');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Added ${selectedSnippets.length} snippets to folder`,
        });
        setShowAddSnippetsDialog(false);
        setSelectedSnippets([]);
        // Refresh snippets list
        fetchSnippets();
      } else {
        throw new Error(data.message || 'Failed to add snippets to folder');
      }
    } catch (error) {
      console.error('Error adding snippets:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add snippets to folder",
        variant: "destructive",
      });
    } finally {
      setAddingSnippets(false);
    }
  };

  // Filter available snippets based on search
  const filteredAvailableSnippets = availableSnippets.filter(snippet =>
    snippet.title.toLowerCase().includes(searchAvailableSnippets.toLowerCase()) ||
    snippet.description.toLowerCase().includes(searchAvailableSnippets.toLowerCase())
  );

  // Toggle snippet selection
  const toggleSnippetSelection = (snippetId: string) => {
    setSelectedSnippets(prev =>
      prev.includes(snippetId)
        ? prev.filter(id => id !== snippetId)
        : [...prev, snippetId]
    );
  };

  const fetchSnippets = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/snippets?folderId=${params.folderId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.success) {
        setSnippets(data.snippets);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch snippets",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, [params.folderId]);

  useEffect(() => {
    const fetchFolder = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/folders/${params.folderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch folder");
        }

        setFolder(data.folder);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch folder",
          variant: "destructive",
        });
        router.push("/dashboard/folders");
      } finally {
        setLoading(false);
      }
    };

    fetchFolder();
  }, [params.folderId, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative w-4 h-8 text-transparent">
          <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-[#10B981] animate-loader"></div>
          <div className="absolute top-0 left-0 w-3.5 h-8 bg-[#10B981] animate-loader delay-150"></div>
          <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-[#10B981] animate-loader delay-300"></div>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen p-4 bg-background dark:bg-[#161514]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center max-w-md p-8 rounded-xl bg-card dark:bg-[#161514] border border-border/50 dark:border-green-100/10">
          <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-3">Folder not found</h1>
          <p className="text-muted-foreground mb-6">
            The folder you're looking for doesn't exist or has been deleted.
          </p>
          <Button
            onClick={() => router.push("/dashboard/folders")}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Folders
          </Button>
        </div>
      </motion.div>
    );
  }

  // Add function to move snippet to folder
  const moveSnippetToFolder = async (
    snippetId: string,
    folderId: string | null
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/api/snippets/folder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ snippetId, folderId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      toast({
        title: "Success",
        description: "Snippet moved successfully",
      });

      // Refresh the snippets list
      fetchSnippets();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to move snippet",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-[2000px] mx-auto">
        {/* Enhanced Header Section */}
        <motion.div
          className="sticky top-0 z-10 bg-background/80  backdrop-blur-lg border-b border-border/50 dark:border-green-100/10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="px-6 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/folders")}
                  className="group hover:bg-secondary/80 -ml-2"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                </Button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl"
                  style={{ backgroundColor: `${folder.color}20` }}
                >
                  <Folder className="h-6 w-6" style={{ color: folder.color }} />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold leading-tight">
                    {folder.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {snippets.length}{" "}
                    {snippets.length === 1 ? "snippet" : "snippets"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search snippets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-background dark:bg-[#161514] border-border/50 dark:border-green-100/10"
                  />
                </div>
                <Button
                  onClick={() => {
                    fetchAvailableSnippets();
                    setShowAddSnippetsDialog(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Snippets
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Snippets Dialog */}
        <Dialog 
          open={showAddSnippetsDialog} 
          onOpenChange={(open) => {
            setShowAddSnippetsDialog(open);
            if (!open) {
              // Reset search and selection states when dialog closes
              setSearchAvailableSnippets('');
              setSelectedSnippets([]);
            }
          }}
        >
          <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0 bg-background dark:bg-[#161514]">
            {/* Fixed Header */}
            <div className="p-6 border-b border-border/50 dark:border-green-100/10 bg-background dark:bg-[#161514]">
              <DialogHeader>
                <DialogTitle>Add Snippets to Folder</DialogTitle>
                <DialogDescription>
                  Select the snippets you want to add to this folder
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search available snippets..."
                  value={searchAvailableSnippets}
                  onChange={(e) => setSearchAvailableSnippets(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {filteredAvailableSnippets.map((snippet) => (
                  <div
                    key={snippet._id}
                    className="flex items-center space-x-4 p-4 rounded-lg border border-border/50 dark:border-green-100/10 hover:bg-accent/50 cursor-pointer"
                    onClick={() => toggleSnippetSelection(snippet._id)}
                  >
                    <Checkbox
                      checked={selectedSnippets.includes(snippet._id)}
                      onCheckedChange={() => toggleSnippetSelection(snippet._id)}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{snippet.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {snippet.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {snippet.language}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(snippet.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAvailableSnippets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No snippets available to add
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 border-t border-border/50 dark:border-green-100/10 bg-background dark:bg-[#161514]">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddSnippetsDialog(false);
                    setSearchAvailableSnippets('');
                    setSelectedSnippets([]);
                  }}
                  className="bg-background dark:bg-[#161514] border-border/50 dark:border-green-100/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSnippets}
                  disabled={selectedSnippets.length === 0 || addingSnippets}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {addingSnippets ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Add Selected ({selectedSnippets.length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content with Enhanced Spacing */}
        <div className="p-6 space-y-8">
          {/* Description Card (if exists) */}
          {folder.description && (
            <motion.div
              variants={itemVariants}
              className="bg-card/50 dark:bg-[#161514] rounded-xl border border-border/50 dark:border-green-100/10 p-6"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {folder.description}
              </p>
            </motion.div>
          )}

          {/* Enhanced Stats Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="flex items-center gap-4 bg-card/50 dark:bg-[#161514] rounded-xl border border-border/50 dark:border-green-100/10 p-5"
              variants={itemVariants}
            >
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Code className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-semibold">{snippets.length}</p>
                <p className="text-sm text-muted-foreground">Total Snippets</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 bg-card/50 dark:bg-[#161514] rounded-xl border border-border/50 dark:border-green-100/10 p-5"
              variants={itemVariants}
            >
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {format(new Date(folder.createdAt), "MMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">Created Date</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 bg-card/50 dark:bg-[#161514] rounded-xl border border-border/50 dark:border-green-100/10 p-5"
              variants={itemVariants}
            >
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {format(new Date(folder.updatedAt), "MMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">Last Updated</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Snippets Grid */}
          <AnimatePresence mode="wait">
            {filteredSnippets.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredSnippets.map((snippet) => (
                  <motion.div
                    key={snippet._id}
                    variants={itemVariants}
                    layout
                    className="group"
                  >
                    <div className="transform transition-all duration-300 cursor-pointer hover:shadow-lg">
                      <SnippetCard
                        snippet={{
                          id: snippet._id,
                          title: snippet.title,
                          description: snippet.description,
                          code: snippet.code,
                          language: snippet.language,
                          tags: snippet.tags,
                          createdAt: snippet.createdAt
                        }}
                        onMove={async (snippetId: string) => {
                          await moveSnippetToFolder(snippetId, null);
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="mt-8"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="flex flex-col items-center justify-center p-12 bg-card/50 dark:bg-[#161514] rounded-xl border border-border/50 dark:border-green-100/10">
                  <div className="p-4 rounded-full bg-muted/50 dark:bg-[#1f1f1f] mb-4">
                    <Folder className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {searchTerm
                      ? "No matching snippets found"
                      : "This folder is empty"}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    {searchTerm
                      ? `No snippets match your search "${searchTerm}"`
                      : "Start adding code snippets to organize your collection"}
                  </p>
                  {searchTerm ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchTerm("")}
                      className="gap-2"
                    >
                      Clear search
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        router.push("/dashboard/snippets/addsnippets")
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Snippet
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
