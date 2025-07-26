"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Plus,
  Search,
  FolderOpen,
  MoreVertical,
  Edit,
  Trash2,
  Code,
  Loader2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const PRESET_COLORS = [
  "#4F46E5", // Indigo
  "#2563EB", // Blue
  "#0D9488", // Teal
  "#059669", // Emerald
  "#DC2626", // Red
  "#EA580C", // Orange
  "#D97706", // Amber
  "#7C3AED", // Purple
];

interface Folder {
  _id: string;
  name: string;
  description: string;
  color: string;
  snippetCount: number;
  createdAt: string;
}

const FoldersPageSkeleton = () => (
  <main className="h-full overflow-y-auto p-6 pt-16 md:pt-6 xl:mt-6">
    <div className="max-w-[2000px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Skeleton className="w-full sm:w-[300px] h-9 sm:h-10 lg:h-12" />
          <Skeleton className="w-full sm:w-[140px] h-9 sm:h-10 lg:h-12" />
        </div>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-card dark:bg-[#161514] rounded-xl border border-border/50 dark:border-green-100/10 p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
            <Skeleton className="mt-3 h-[40px] w-full" />
            <div className="flex items-center gap-2 mt-4">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </main>
);

const FoldersPage = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: "",
    description: "",
    color: "#4F46E5",
  });
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const folderVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  // Fetch folders
  const fetchFolders = async () => {
    console.log('Starting to fetch folders');
    try {
      // First get the folders
      const foldersResponse = await fetch(`${BASE_URL}/api/folders`, {
        credentials: 'include'
      });
      const foldersData = await foldersResponse.json();
      
      if (foldersData.success) {
        // For each folder, fetch its snippets count
        const foldersWithSnippets = await Promise.all(
          foldersData.folders.map(async (folder: Folder) => {
            try {
              const snippetsResponse = await fetch(
                `${BASE_URL}/api/snippets?folderId=${folder._id}`,
                {
                  credentials: "include",
                }
              );
              const snippetsData = await snippetsResponse.json();
              
              return {
                ...folder,
                snippetCount: snippetsData.success ? snippetsData.snippets.length : 0
              };
            } catch (error) {
              console.error(`Error fetching snippets for folder ${folder._id}:`, error);
              return {
                ...folder,
                snippetCount: 0
              };
            }
          })
        );

        setFolders(foldersWithSnippets);
        console.log('Folders set with snippet counts:', foldersWithSnippets);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive",
      });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  // Add this effect to refresh folders when mounted
  useEffect(() => {
    console.log('useEffect triggered');
    setLoading(true);
    fetchFolders();
  }, []);

  // Enhanced create folder function with loading state
  const handleCreateFolder = async () => {
    if (!newFolder.name.trim()) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${BASE_URL}/api/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newFolder),
      });

      const data = await response.json();
      if (data.success) {
        setFolders([...folders, data.folder]);
        setShowNewFolderDialog(false);
        setNewFolder({ name: "", description: "", color: "#4F46E5" });
        toast({
          title: "Success",
          description: "Folder created successfully",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Enhanced delete folder function
  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/folders/${folderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setFolders(folders.filter((folder) => folder._id !== folderId));
        toast({
          title: "Success",
          description: "Folder deleted successfully",
        });
      } else {
        throw new Error("Failed to delete folder");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setFolderToDelete(null);
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${BASE_URL}/api/folders/${editingFolder._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editingFolder.name,
          description: editingFolder.description,
          color: editingFolder.color,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFolders(
          folders.map((folder) =>
            folder._id === editingFolder._id ? data.folder : folder
          )
        );
        setShowEditDialog(false);
        setEditingFolder(null);
        toast({
          title: "Success",
          description: "Folder updated successfully",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update folder",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    console.log('Rendering loading state');
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

  console.log('Rendering main content');
  return (
    <div className="p-6 max-w-[2000px] mx-auto">
      {/* Enhanced Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50 dark:border-green-100/10 mb-6 pb-6 "
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl font-bold">Folders</h1>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm dark:bg-[#161514] dark:text-white border dark:border-green-100/10"
              />
            </div>
            <Button
              onClick={() => setShowNewFolderDialog(true)}
              className="h-10 bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              New Folder
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Folders Grid with Empty State */}
      <AnimatePresence mode="wait">
        {filteredFolders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div className="p-4 rounded-full bg-muted/50 dark:bg-[#1f1f1f]">
              <Folder className="w-12 h-12 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              {searchTerm ? "No folders found" : "No folders yet"}
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-2">
              {searchTerm
                ? `No folders match your search "${searchTerm}"`
                : "Create your first folder to start organizing your snippets"}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="gap-2 bg-background dark:bg-[#161514] border-border/50 dark:border-green-100/10"
              >
                <X className="h-4 w-4" />
                Clear search
              </Button>
            )}
            {!searchTerm && (
              <Button
                onClick={() => setShowNewFolderDialog(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Folder
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredFolders.map((folder) => (
              <motion.div
                key={folder._id}
                variants={folderVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layoutId={folder._id}
                className="group bg-card dark:bg-[#161514] rounded-xl border border-border/50 dark:border-green-100/10 p-5 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200"
              >
                <div 
                  className="relative h-full cursor-pointer"
                  onClick={() => router.push(`/dashboard/folders/${folder._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Folder
                          className="h-6 w-6"
                          style={{ color: folder.color }}
                        />
                      </motion.div>
                      <h3 className="font-semibold text-lg truncate hover:text-emerald-500 transition-colors">
                        {folder.name}
                      </h3>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingFolder(folder);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              setFolderToDelete(folder._id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2 min-h-[40px]">
                    {folder.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Code className="h-4 w-4" />
                    {folder.snippetCount} {folder.snippetCount === 1 ? 'snippet' : 'snippets'}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="bg-card dark:bg-[#161514] border-border/50 dark:border-green-100/10 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your code snippets
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newFolder.name}
                onChange={(e) =>
                  setNewFolder({ ...newFolder, name: e.target.value })
                }
                placeholder="Enter folder name"
                className="dark:bg-[#161514] dark:border-green-100/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newFolder.description}
                onChange={(e) =>
                  setNewFolder({ ...newFolder, description: e.target.value })
                }
                placeholder="Enter folder description"
                className="dark:bg-[#161514] dark:border-green-100/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <motion.button
                    key={presetColor}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newFolder.color === presetColor
                        ? "border-white scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() =>
                      setNewFolder({ ...newFolder, color: presetColor })
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              className="bg-emerald-500 hover:bg-emerald-600"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Folder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the folder
              and remove all snippets from it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => folderToDelete && handleDeleteFolder(folderToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Folder Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-card dark:bg-[#161514] border-border/50 dark:border-green-100/10 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Make changes to your folder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editingFolder?.name || ""}
                onChange={(e) =>
                  setEditingFolder(
                    editingFolder
                      ? { ...editingFolder, name: e.target.value }
                      : null
                  )
                }
                placeholder="Enter folder name"
                className="dark:bg-[#161514] dark:border-green-100/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingFolder?.description || ""}
                onChange={(e) =>
                  setEditingFolder(
                    editingFolder
                      ? { ...editingFolder, description: e.target.value }
                      : null
                  )
                }
                placeholder="Enter folder description"
                className="dark:bg-[#161514] dark:border-green-100/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      editingFolder?.color === presetColor
                        ? "border-white scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() =>
                      setEditingFolder(
                        editingFolder
                          ? { ...editingFolder, color: presetColor }
                          : null
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFolder}
              className="bg-emerald-500 hover:bg-emerald-600"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoldersPage;
