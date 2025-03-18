"use client";

import type React from "react";

import { useState, Suspense, useEffect } from "react";
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
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { javascript } from "@codemirror/lang-javascript";
import {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiOpenjdk,
  SiSharp,
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

// Dynamically import CodeMirror with no SSR
const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false }
);

interface SnippetData {
  title: string;
  description: string;
  language: string;
  tags: string[];
  code: string;
  folderId: string | null;
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
    icon: <SiOpenjdk className="text-[#007396]" />,
    category: "General",
  },
  {
    value: "csharp",
    label: "C#",
    icon: <SiSharp className="text-[#239120]" />,
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

// Loading component for CodeMirror
const CodeEditorLoading = () => (
  <div className="h-[250px] sm:h-[300px] lg:h-[400px] w-full rounded-lg border border-[#1f1f1f] bg-[#1C1917]/40 animate-pulse" />
);

export default function AddSnippet() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [code, setCode] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [folders, setFolders] = useState<Array<{ _id: string; name: string }>>(
    []
  );
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const fetchFolders = async () => {
      const response = await fetch(`${BASE_URL}/api/folders`);
      const data = await response.json();
      if (data.success) {
        setFolders(data.folders);
      }
    };
    fetchFolders();
  }, []);

  const handleTagsChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !code.trim() || !language) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const snippetData: SnippetData = {
        title: title.trim(),
        description: description.trim(),
        language,
        tags,
        code: code.trim(),
        folderId: selectedFolder === "none" ? null : selectedFolder, // Convert "none" to null
      };

      const response = await fetch(`${BASE_URL}/api/snippet/add-snippets`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(snippetData),
      });

      await response.json();

      toast({
        title: "Success",
        description: "Snippet created successfully",
      });
      router.push("/dashboard/snippets");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create snippet",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            New Snippet
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 sm:h-11 text-sm sm:text-base dark:bg-[#1C1917]/60 bg-background/50 border-border/50 focus:ring-1  transition-all duration-200"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base dark:bg-[#1C1917]/60 bg-background/50 border-border/50 focus:ring-1  transition-all duration-200"
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
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger
                className="h-10 sm:h-11 text-sm sm:text-base 
                  dark:bg-[#1C1917]/60 
                  bg-background/50
                  border-2 border-input
                  outline-none focus:outline-none focus-visible:outline-none
                  ring-0 focus:ring-0 focus-visible:ring-0
                  focus:border-emerald-500/20 dark:focus:border-emerald-500/15
                  transition-all duration-200
                  data-[placeholder]:text-gray-400"
              >
                <SelectValue placeholder="Select a language">
                  {language && (
                    <div className="flex items-center gap-2">
                      {
                        languageOptions.find((opt) => opt.value === language)
                          ?.icon
                      }
                      <span>
                        {
                          languageOptions.find((opt) => opt.value === language)
                            ?.label
                        }
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                className="max-h-[300px] overflow-y-auto
                  dark:bg-[#1C1917]/95 backdrop-blur-lg
                  border-2 border-input
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
                            className="focus:bg-emerald-500/20 focus:text-foreground
                            hover:bg-emerald-500/15
                            cursor-pointer
                            transition-colors duration-150"
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

          {/* Tags Section */}
          <motion.div
            className="space-y-1.5 sm:space-y-2"
            variants={itemVariants}
          >
            <Label className="text-xs sm:text-sm font-medium text-foreground/70">
              Tags
            </Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 rounded-md border-2 border-input bg-background px-3 py-2 
              dark:bg-[#1C1917]/60 bg-background/50
              dark:border-border/50 
              placeholder:text-muted-foreground
              outline-none focus:outline-none focus-visible:outline-none
              ring-0 focus:ring-0 focus-visible:ring-0
              focus-within:border-emerald-500/20 dark:focus-within:border-emerald-500/15
              disabled:cursor-not-allowed disabled:opacity-50
              transition-all duration-200">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  className="px-2 sm:px-2.5 py-0.5 h-6 sm:h-7 text-xs sm:text-sm 
                    bg-emerald-500/10 hover:bg-emerald-500/15 
                    dark:bg-emerald-500/[0.08] dark:hover:bg-emerald-500/[0.12]
                    text-emerald-700 dark:text-emerald-400
                    border border-emerald-500/20 dark:border-emerald-500/[0.15]
                    transition-colors duration-200"
                >
                  #{tag}
                  <X
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1 cursor-pointer 
                      hover:text-emerald-900 dark:hover:text-emerald-300
                      transition-colors duration-200"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagsChange}
                placeholder="Add tags..."
                className="flex-1 min-w-[100px] sm:min-w-[120px] h-6 sm:h-7 
                  bg-transparent border-0 outline-none text-xs sm:text-sm 
                  placeholder:text-muted-foreground text-foreground
                  focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </motion.div>

          {/* Folder Selection */}
          <motion.div
            className="space-y-1.5 sm:space-y-2"
            variants={itemVariants}
          >
            <Label className="text-xs sm:text-sm font-medium text-foreground/70">
              Folder (Optional)
            </Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>{" "}
                {/* Changed from empty string to "none" */}
                {folders.map((folder) => (
                  <SelectItem key={folder._id} value={folder._id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Suspense fallback={<CodeEditorLoading />}>
                <CodeMirror
                  value={code}
                  theme="dark"
                  extensions={[javascript({ typescript: true })]}
                  onChange={(value) => setCode(value)}
                  className="border border-border/50 rounded-lg overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightSpecialChars: true,
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
              </Suspense>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 mt-2 sm:mt-4 border-t border-border/50"
            variants={itemVariants}
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1 h-10 sm:h-11 px-6 text-sm sm:text-base bg-[#22C55E] hover:bg-[#1ea550] text-white shadow-sm transition-all duration-200 hover:shadow-md hover:translate-y-[-1px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></span>
                  Creating...
                </span>
              ) : (
                "Create Snippet"
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
