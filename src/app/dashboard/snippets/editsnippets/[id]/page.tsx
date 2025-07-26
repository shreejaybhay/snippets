"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, Code2 } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiOpenjdk,
  SiCplusplus,
  SiPhp,
  SiRuby,
  SiSwift,
  SiGo,
  SiRust,
  SiKotlin,
  SiHtml5,
  SiCss3,
  SiDart,
  SiJson,
} from "react-icons/si";
import type { JSX } from "react/jsx-runtime";

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  folderId?: string | null;
  createdAt: string;
}

interface LanguageOption {
  value: string;
  label: string;
  icon: JSX.Element;
  category: "Web" | "Mobile" | "Systems" | "General";
}

const languageOptions: LanguageOption[] = [
  // Web Development
  {
    value: "javascript",
    label: "JavaScript",
    icon: <SiJavascript className="text-[#F7DF1E]" />,
    category: "Web",
  },
  {
    value: "typescript",
    label: "TypeScript",
    icon: <SiTypescript className="text-[#3178C6]" />,
    category: "Web",
  },
  {
    value: "html",
    label: "HTML",
    icon: <SiHtml5 className="text-[#E34F26]" />,
    category: "Web",
  },
  {
    value: "css",
    label: "CSS",
    icon: <SiCss3 className="text-[#1572B6]" />,
    category: "Web",
  },
  {
    value: "php",
    label: "PHP",
    icon: <SiPhp className="text-[#777BB4]" />,
    category: "Web",
  },
  // General Purpose
  {
    value: "python",
    label: "Python",
    icon: <SiPython className="text-[#3776AB]" />,
    category: "General",
  },
  {
    value: "java",
    label: "Java",
    icon: <SiOpenjdk className="text-[#437291]" />,
    category: "General",
  },
  {
    value: "ruby",
    label: "Ruby",
    icon: <SiRuby className="text-[#CC342D]" />,
    category: "General",
  },
  {
    value: "go",
    label: "Go",
    icon: <SiGo className="text-[#00ADD8]" />,
    category: "General",
  },
  // Systems Programming
  {
    value: "cpp",
    label: "C++",
    icon: <SiCplusplus className="text-[#00599C]" />,
    category: "Systems",
  },
  {
    value: "rust",
    label: "Rust",
    icon: <SiRust className="text-[#000000] dark:text-[#ffffff]" />,
    category: "Systems",
  },
  // Mobile Development
  {
    value: "swift",
    label: "Swift",
    icon: <SiSwift className="text-[#FA7343]" />,
    category: "Mobile",
  },
  {
    value: "kotlin",
    label: "Kotlin",
    icon: <SiKotlin className="text-[#7F52FF]" />,
    category: "Mobile",
  },
  {
    value: "dart",
    label: "Dart",
    icon: <SiDart className="text-[#0175C2]" />,
    category: "Mobile",
  },
  // Data
  {
    value: "json",
    label: "JSON",
    icon: <SiJson className="text-[#000000] dark:text-[#ffffff]" />,
    category: "Web",
  },
];

export default function EditSnippet() {
  const { id } = useParams() as { id: string };
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [folders, setFolders] = useState<Array<{ _id: string; name: string }>>(
    []
  );
  const [selectedFolder, setSelectedFolder] = useState<string>("none");
  const router = useRouter();
  const { toast } = useToast();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Add folder fetching
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/folders`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setFolders(data.folders);
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };
    fetchFolders();
  }, [BASE_URL]);

  // Fetch snippet data
  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/snippet/add-snippets/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch snippet");
        }

        const data = await response.json();
        if (data.success) {
          setSnippet(data.snippet);
          // Set the selected folder based on the snippet's folderId
          setSelectedFolder(data.snippet.folderId || "none");
        } else {
          throw new Error(data.message || "Failed to fetch snippet");
        }
      } catch (error) {
        console.error("Error fetching snippet:", error);
        toast({
          title: "Error",
          description: "Failed to load snippet. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSnippet();
    }
  }, [id, toast, BASE_URL]);

  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() && snippet) {
      if (!snippet.tags.includes(tagInput.trim().toLowerCase())) {
        setSnippet({
          ...snippet,
          tags: [...snippet.tags, tagInput.trim().toLowerCase()],
        });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (snippet) {
      setSnippet({
        ...snippet,
        tags: snippet.tags.filter((tag) => tag !== tagToRemove),
      });
    }
  };

  const handleSave = async () => {
    if (!snippet) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/add-snippets/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: snippet.title,
            description: snippet.description,
            code: snippet.code,
            language: snippet.language,
            tags: snippet.tags,
            folderId: selectedFolder === "none" ? null : selectedFolder,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update snippet");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Snippet updated successfully",
        });
        router.push("/dashboard/snippets");
        router.refresh();
      } else {
        throw new Error(data.message || "Failed to update snippet");
      }
    } catch (error) {
      console.error("Error updating snippet:", error);
      toast({
        title: "Error",
        description: "Failed to update snippet. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="relative w-4 h-8 text-transparent">
          <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-[#22C55E] animate-loader"></div>
          <div className="absolute top-0 left-0 w-3.5 h-8 bg-[#22C55E] animate-loader delay-150"></div>
          <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-[#22C55E] animate-loader delay-300"></div>
        </div>
        <p className="text-sm text-foreground/60 animate-pulse">
          Loading snippet...
        </p>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="text-red-500 text-center p-6">Snippet not found.</div>
    );
  }

  return (
    <motion.div
      className="w-full dark:bg-[#1C1917]/40 bg-white/50 backdrop-blur-sm rounded-xl py-4 px-4 sm:px-6 md:px-8 mt-6 sm:mt-6 xl:mt-0 shadow-sm border border-border/30"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          className="flex items-center gap-2 mb-6 sm:mb-8 pb-4 border-b border-border/50"
          variants={itemVariants}
        >
          <div className="p-2 rounded-md bg-[#22C55E]/10">
            <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#22C55E]" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
            Edit Snippet
          </h1>
        </motion.div>

        <div className="space-y-5 sm:space-y-7">
          {/* Title Section */}
          <motion.div
            className="space-y-1.5 sm:space-y-2"
            variants={itemVariants}
          >
            <Label className="text-xs sm:text-sm font-medium text-foreground/70">
              Title
            </Label>
            <Input
              value={snippet.title}
              onChange={(e) =>
                setSnippet({ ...snippet, title: e.target.value })
              }
              className="h-10 sm:h-11 text-sm sm:text-base dark:bg-[#1C1917]/60 bg-background/50 border-border/50 focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] transition-all duration-200"
            />
          </motion.div>

          {/* Description Section */}
          <motion.div
            className="space-y-1.5 sm:space-y-2"
            variants={itemVariants}
          >
            <Label className="text-xs sm:text-sm font-medium text-foreground/70">
              Description
            </Label>
            <Textarea
              value={snippet.description}
              onChange={(e) =>
                setSnippet({ ...snippet, description: e.target.value })
              }
              className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base dark:bg-[#1C1917]/60 bg-background/50 border-border/50 focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] transition-all duration-200"
            />
          </motion.div>

          {/* Language Selection */}
          <motion.div
            className="space-y-1.5 sm:space-y-2"
            variants={itemVariants}
          >
            <Label className="text-xs sm:text-sm font-medium text-foreground/70">
              Language
            </Label>
            <Select
              value={snippet.language}
              onValueChange={(value) =>
                setSnippet({ ...snippet, language: value })
              }
            >
              <SelectTrigger
                className="h-10 sm:h-11 text-sm sm:text-base 
                  dark:bg-[#1C1917]/60 
                  bg-background/50
                  border-border/50
                  focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]
                  transition-all duration-200
                  hover:border-[#22C55E]/70
                  data-[placeholder]:text-gray-400"
              >
                <SelectValue placeholder="Select a language">
                  {snippet.language && (
                    <div className="flex items-center gap-2">
                      {
                        languageOptions.find(
                          (opt) => opt.value === snippet.language
                        )?.icon
                      }
                      <span>
                        {
                          languageOptions.find(
                            (opt) => opt.value === snippet.language
                          )?.label
                        }
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                className="max-h-[300px] overflow-y-auto
                  dark:bg-[#1C1917]/95 backdrop-blur-lg
                  border-[#dbdbdb] dark:border-[#2a2a2a]
                  shadow-lg"
              >
                {(["Web", "Mobile", "Systems", "General"] as const).map(
                  (category) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {category} Development
                      </div>
                      {languageOptions
                        .filter((opt) => opt.category === category)
                        .map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="focus:bg-[#22C55E]/10 focus:text-[#22C55E]
                            hover:bg-[#22C55E]/5
                            cursor-pointer
                            transition-colors duration-150
                            dark:focus:bg-[#22C55E]/20"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 flex items-center justify-center">
                                {option.icon}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      <div className="px-2 py-0.5">
                        <div className="border-t border-gray-200 dark:border-gray-700" />
                      </div>
                    </div>
                  )
                )}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Folder Selection */}
          <motion.div
            className="space-y-1.5 sm:space-y-2"
            variants={itemVariants}
          >
            <Label className="text-xs sm:text-sm font-medium text-foreground/70">
              Folder
            </Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base dark:bg-[#1C1917]/60 bg-background/50 border-border/50 focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E] transition-all duration-200">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder._id} value={folder._id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Tags Section */}
          <motion.div
            className="space-y-1.5 sm:space-y-2"
            variants={itemVariants}
          >
            <Label className="text-xs sm:text-sm font-medium text-foreground/70">
              Tags
            </Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 p-2 sm:p-3 border rounded-lg dark:bg-[#1C1917]/60 bg-background/50 border-border/50 focus-within:ring-1 focus-within:ring-[#22C55E] focus-within:border-[#22C55E] transition-all duration-200">
              {snippet.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="px-2 sm:px-2.5 py-0.5 h-6 sm:h-7 text-xs sm:text-sm bg-[#22C55E]/10 hover:bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20 transition-colors duration-200"
                >
                  #{tag}
                  <X
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1 cursor-pointer hover:text-[#22C55E]"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagsChange}
                placeholder="Add tags..."
                className="flex-1 min-w-[100px] sm:min-w-[120px] h-6 sm:h-7 bg-transparent border-none outline-none text-xs sm:text-sm placeholder:text-foreground/40 text-foreground"
              />
            </div>
          </motion.div>

          {/* Code Editor Section */}
          <motion.div
            className="space-y-1.5 sm:space-y-2"
            variants={itemVariants}
          >
            <Label className="text-xs sm:text-sm font-medium text-foreground/70">
              Code
            </Label>
            <div className="relative overflow-hidden rounded-lg">
              <style jsx global>{`
                .cm-editor {
                  /* Hide default scrollbar */
                  .cm-scroller::-webkit-scrollbar {
                    display: none;
                  }
                  .cm-scroller {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }

                  /* Custom styling for the editor */
                  .cm-content {
                    padding: 0.75rem !important;
                    @media (min-width: 640px) {
                      padding: 1rem !important;
                    }
                  }

                  /* Improve line numbers visibility and add sticky behavior */
                  .cm-gutters {
                    position: sticky !important;
                    left: 0 !important;
                    border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
                    background-color: rgba(28, 25, 23, 0.8) !important;
                    z-index: 1 !important;
                    padding-right: 0.5rem !important;
                  }

                  .cm-lineNumbers {
                    position: relative !important;
                    z-index: 2 !important;
                  }

                  /* Better text rendering */
                  font-family: "JetBrains Mono", "Menlo", "Monaco",
                    "Courier New", monospace;
                  font-size: 0.813rem;
                  @media (min-width: 640px) {
                    font-size: 0.875rem;
                  }
                  line-height: 1.6;

                  /* Ensure content stays behind gutters when scrolling */
                  .cm-content {
                    z-index: 0 !important;
                  }

                  /* Responsive height */
                  height: 250px !important;
                  @media (min-width: 640px) {
                    height: 300px !important;
                  }
                  @media (min-width: 1024px) {
                    height: 400px !important;
                  }

                  /* Add subtle border radius and shadow */
                  border-radius: 0.375rem;
                  overflow: hidden;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
              `}</style>
              <CodeMirror
                value={snippet.code}
                theme="dark"
                extensions={[javascript({ typescript: true })]}
                onChange={(value) => setSnippet({ ...snippet, code: value })}
                className="border border-border/50 rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  history: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  defaultKeymap: true,
                  searchKeymap: true,
                  historyKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
                }}
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 mt-2 sm:mt-4 border-t border-border/50"
            variants={itemVariants}
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto order-2 sm:order-1 h-10 sm:h-11 px-6 text-sm sm:text-base bg-[#22C55E] hover:bg-[#1ea550] text-white shadow-sm transition-all duration-200 hover:shadow-md hover:translate-y-[-1px]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></span>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full sm:w-auto order-1 sm:order-2 h-10 sm:h-11 px-6 text-sm sm:text-base border-border/50 hover:bg-background/80 transition-all duration-200"
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
