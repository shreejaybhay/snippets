"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
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

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  userId: string;
  createdAt: string;
}

export default function EditSnippet() {
  const { id } = useParams() as { id: string };
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Fetch snippet data
  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/snippet/add-snippets/${id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch snippet');
        }

        const data = await response.json();
        if (data.success) {
          setSnippet(data.snippet);
        } else {
          throw new Error(data.message || 'Failed to fetch snippet');
        }
      } catch (error) {
        console.error('Error fetching snippet:', error);
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
      const response = await fetch(`${BASE_URL}/api/snippet/add-snippets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: snippet.title,
          description: snippet.description,
          code: snippet.code,
          language: snippet.language,
          tags: snippet.tags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update snippet');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Snippet updated successfully",
        });
        router.push('/dashboard/snippets');
        router.refresh();
      } else {
        throw new Error(data.message || 'Failed to update snippet');
      }
    } catch (error) {
      console.error('Error updating snippet:', error);
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
      <div className="flex items-center justify-center h-screen">
        <div className="relative w-4 h-8 text-transparent">
          <div className="absolute top-0 left-[-20px] w-3.5 h-8 bg-[#10B981] animate-loader"></div>
          <div className="absolute top-0 left-0 w-3.5 h-8 bg-[#10B981] animate-loader delay-150"></div>
          <div className="absolute top-0 left-[20px] w-3.5 h-8 bg-[#10B981] animate-loader delay-300"></div>
        </div>
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
      className="w-full dark:bg-[#1C1917]/40 rounded-xl py-2 px-3 sm:px-4 md:px-6 mt-6 sm:mt-6 xl:mt-0 "
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-[1400px] mx-auto">
        <motion.div className="flex items-center gap-2 mb-4 sm:mb-6" variants={itemVariants}>
          <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#22C55E]" />
          <h1 className="text-lg sm:text-xl font-semibold">Edit Snippet</h1>
        </motion.div>

        <div className="space-y-4 sm:space-y-6">
          {/* Title Section */}
          <motion.div className="space-y-1.5 sm:space-y-2" variants={itemVariants}>
            <Label className="text-xs sm:text-sm text-gray-400">Title</Label>
            <Input
              value={snippet.title}
              onChange={(e) => setSnippet({ ...snippet, title: e.target.value })}
              className="h-9 sm:h-10 text-sm sm:text-base dark:bg-[#1C1917]/40 border-[#dbdbdb] focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
            />
          </motion.div>

          {/* Description Section */}
          <motion.div className="space-y-1.5 sm:space-y-2" variants={itemVariants}>
            <Label className="text-xs sm:text-sm text-gray-400">Description</Label>
            <Textarea
              value={snippet.description}
              onChange={(e) => setSnippet({ ...snippet, description: e.target.value })}
              className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base dark:bg-[#1C1917]/40 border-[#dbdbdb] focus:ring-1 focus:ring-[#22C55E] focus:border-[#22C55E]"
            />
          </motion.div>

          {/* Language Section */}
          <motion.div className="space-y-1.5 sm:space-y-2" variants={itemVariants}>
            <Label className="text-xs sm:text-sm text-gray-400">Language</Label>
            <Select
              value={snippet.language}
              onValueChange={(value) => setSnippet({ ...snippet, language: value })}
            >
              <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base dark:bg-[#1C1917]/40">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="ruby">Ruby</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Tags Section */}
          <motion.div className="space-y-1.5 sm:space-y-2" variants={itemVariants}>
            <Label className="text-xs sm:text-sm text-gray-400">Tags</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 p-1.5 sm:p-2 border rounded-lg dark:bg-[#1C1917]/40 border-[#dbdbdb] focus-within:ring-1 focus-within:ring-[#22C55E] focus-within:border-[#22C55E]">
              {snippet.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="px-1.5 sm:px-2 py-0.5 h-5 sm:h-6 text-xs sm:text-sm bg-[#1a1a1a] hover:bg-[#222222] text-white border border-[#2a2a2a]"
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
                className="flex-1 min-w-[100px] sm:min-w-[120px] h-5 sm:h-6 bg-transparent border-none outline-none text-xs sm:text-sm placeholder:text-gray-500 text-white"
              />
            </div>
          </motion.div>

          {/* Code Editor Section */}
          <motion.div className="space-y-1.5 sm:space-y-2" variants={itemVariants}>
            <Label className="text-xs sm:text-sm text-gray-400">Code</Label>
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
                    background-color: #1C1917 !important;
                    z-index: 1 !important;
                    padding-right: 0.5rem !important;
                  }

                  .cm-lineNumbers {
                    position: relative !important;
                    z-index: 2 !important;
                  }
                  
                  /* Better text rendering */
                  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
                  font-size: 0.813rem;
                  @media (min-width: 640px) {
                    font-size: 0.875rem;
                  }
                  line-height: 1.5;

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
                }
              `}</style>
              <CodeMirror
                value={snippet.code}
                theme="dark"
                extensions={[javascript({ typescript: true })]}
                onChange={(value) => setSnippet({ ...snippet, code: value })}
                className="border border-[#1f1f1f] rounded-lg overflow-hidden"
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
            className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4"
            variants={itemVariants}
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto order-2 sm:order-1 h-9 sm:h-10 text-sm sm:text-base bg-[#22C55E] hover:bg-[#1ea550] text-white"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full sm:w-auto order-1 sm:order-2 h-9 sm:h-10 text-sm sm:text-base"
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
