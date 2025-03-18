"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Copy,
  Pencil,
  Share2,
  Trash2,
  Globe,
  Lock,
  Camera,
  Eye,
  Heart,
  MessageSquare,
  User,
  Code2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css"; // For light mode
import "highlight.js/styles/atom-one-dark.css"; // For dark mode
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { DeleteModal } from "@/components/ui/delete-modal";
import html2canvas from "html2canvas";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import EmbedDialog from "@/components/EmbedDialog";
import { signIn } from "next-auth/react";
import { pdf, Font } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { toPng } from 'html-to-image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Register fonts
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  createdAt: string;
  isPublic: boolean;
  likes: string[]; // Add this to track the likes array
  likesCount: number;
  views: number;
  commentsCount: number;
  user: {
    _id: string;
    username: string;
  };
}

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    profileURL?: string;
  };
}

// Add this type for stats items
interface StatItem {
  icon: React.ReactNode;
  count: number;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  isInteractive?: boolean;
}

// Add this component for consistent stat rendering
const StatDisplay = ({
  icon,
  count,
  label,
  onClick,
  isActive,
  isInteractive,
}: StatItem) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn(
      "flex items-center gap-2 px-3 py-2 hover:bg-muted/60 transition-colors",
      isInteractive ? "cursor-pointer" : "cursor-default pointer-events-none",
      isActive && "text-primary"
    )}
    onClick={onClick}
  >
    <div
      className={cn("flex items-center gap-1.5", isActive && "text-primary")}
    >
      {icon}
      <span className="font-medium">{count}</span>
    </div>
    <span className="text-sm text-muted-foreground hidden sm:inline">
      {label}
    </span>
  </Button>
);

const SnippetDetail = () => {
  const { viewcardDetails: id } = useParams(); // �� Extract correctly

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showEmbedDialog, setShowEmbedDialog] = useState(false);
  const [embedCodes, setEmbedCodes] = useState({ html: "", markdown: "" });
  const [likeState, setLikeState] = useState<{
    isLiked: boolean;
    likesCount: number;
  }>({
    isLiked: false,
    likesCount: 0,
  });
  const [user, setUser] = useState<any>(null);

  // Add this effect to fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [BASE_URL]);

  // Add this effect to fetch like status when component mounts
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!id) return;

      try {
        const response = await fetch(
          `${BASE_URL}/api/snippet/public/${id}/like`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch like status");

        const data = await response.json();
        console.log("Like Status Response:", data);

        if (data.success) {
          setLikeState({
            isLiked: data.liked,
            likesCount: data.likesCount,
          });
        }
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };

    fetchLikeStatus();
  }, [id, BASE_URL]);

  // Add like/unlike handler
  const handleLikeToggle = async () => {
    if (!id || !user) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/public/${id}/like`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to toggle like");

      const data = await response.json();
      console.log("Like Toggle Response:", data);

      if (data.success) {
        setLikeState({
          isLiked: data.liked,
          likesCount: data.likesCount,
        });

        // Also update the snippet's likes
        if (snippet) {
          setSnippet({
            ...snippet,
            likes: data.liked
              ? [...(snippet.likes || []), user._id]
              : (snippet.likes || []).filter((id) => id !== user._id),
          });
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  // Add this helper function for formatting numbers
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Fetch snippet data from API
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
          console.log("Snippet Response:", {
            likes: data.snippet.likes,
            likesCount: data.snippet.likes?.length,
            views: data.snippet.views,
            commentsCount: data.snippet.commentsCount,
          });

          setSnippet(data.snippet);

          // Fetch the like status separately
          const likeResponse = await fetch(
            `${BASE_URL}/api/snippet/public/${id}/like`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (likeResponse.ok) {
            const likeData = await likeResponse.json();
            console.log("Like Response:", likeData);

            setLikeState({
              isLiked: likeData.liked,
              likesCount: likeData.likesCount,
            });
          }
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
  }, [id, BASE_URL]);

  // Add this debug log in your render to see what's being displayed
  console.log("Current State:", {
    snippetLikes: snippet?.likes,
    likeState,
    views: snippet?.views,
    commentsCount: snippet?.commentsCount,
  });

  // Handle delete snippet
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/add-snippets/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete snippet");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Snippet deleted successfully",
        });
        router.push("/dashboard/snippets");
        router.refresh();
      } else {
        throw new Error(data.message || "Failed to delete snippet");
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
      toast({
        title: "Error",
        description: "Failed to delete snippet. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Copy Code Handler
  const handleCopy = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVisibilityToggle = async () => {
    if (!snippet) return; // Early return if snippet is null

    try {
      const response = await fetch(
        `${BASE_URL}/api/snippet/add-snippets/${id}/visibility`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isPublic: !snippet.isPublic,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      const data = await response.json();
      if (data.success) {
        setSnippet((prev) => ({
          ...prev!,
          isPublic: !prev!.isPublic,
        }));
        toast({
          title: "Success",
          description: `Snippet is now ${
            !snippet.isPublic ? "public" : "private"
          }`,
        });
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update snippet visibility",
        variant: "destructive",
      });
    }
  };

  const handleScreenshot = async () => {
    if (!snippet) return;

    try {
      toast({
        title: "Processing",
        description: "Generating screenshot...",
      });

      // Highlight the code using highlight.js
      const highlightedCode = hljs.highlight(snippet.code, {
        language: snippet.language.toLowerCase() || 'plaintext'
      }).value;

      const node = document.createElement('div');
      node.innerHTML = `
        <div style="
          padding: 32px;
          background: white;
          border-radius: 8px;
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 800px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        ">
          <div style="
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: #2c2e33;
            border-radius: 8px 8px 0 0;
            position: relative;
          ">
            <!-- Window Controls -->
            <div style="
              position: absolute;
              left: 12px;
              display: flex;
              gap: 6px;
            ">
              <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56;"></div>
              <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e;"></div>
              <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f;"></div>
            </div>
            <!-- Title -->
            <div style="
              flex-grow: 1;
              text-align: center;
              color: #a1a1aa;
              font-size: 13px;
              margin: 0 auto;
            ">
              ${snippet.title}
            </div>
          </div>
          <div style="
            background: #1a1b1e;
            padding: 16px;
            border-radius: 0 0 8px 8px;
            overflow: hidden;
          ">
            <pre style="
              margin: 0;
              padding: 0;
              font-family: 'JetBrains Mono', 'Fira Code', monospace;
              font-size: 14px;
              line-height: 1.5;
              color: #e5e7eb;
            "><code class="hljs" style="background: transparent;">${highlightedCode}</code></pre>
          </div>
          <div style="
            margin-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 4px;
          ">
            <span style="
              font-size: 12px;
              color: #666;
            ">${snippet.language} • ${snippet.code.split('\n').length} lines</span>
            <span style="
              font-size: 12px;
              color: #666;
            ">Generated by Snippets</span>
          </div>
        </div>
      `;

      // Add highlight.js styles
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
      `;
      node.appendChild(style);

      // Wait for fonts and styles to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      document.body.appendChild(node);
      
      const dataUrl = await toPng(node, {
        quality: 1.0,
        backgroundColor: 'white',
        width: 800, // Set fixed width
        style: {
          margin: '0',
          padding: '0',
        }
      });
      
      document.body.removeChild(node);

      // Download the image
      const link = document.createElement('a');
      link.download = `${snippet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "Success",
        description: "Screenshot downloaded successfully",
      });

    } catch (error) {
      console.error("Error taking screenshot:", error);
      toast({
        title: "Error",
        description: "Failed to generate screenshot",
        variant: "destructive",
      });
    }
  };

  const handlePDFExport = async () => {
    if (!snippet) return;

    try {
      toast({
        title: "Processing",
        description: "Generating PDF...",
      });

      // Create styles
      const styles = StyleSheet.create({
        page: {
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          padding: 30,
        },
        section: {
          margin: 10,
          padding: 10,
        },
        title: {
          fontSize: 24,
          marginBottom: 10,
          fontFamily: 'Roboto',
          color: '#2D3748',
        },
        metadata: {
          fontSize: 12,
          marginBottom: 20,
          color: '#718096',
          fontFamily: 'Roboto',
        },
        codeContainer: {
          backgroundColor: '#F7FAFC',
          padding: 16,
          borderRadius: 8,
          marginTop: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
        },
        code: {
          fontFamily: 'Courier',
          fontSize: 11,
          lineHeight: 1.6,
          color: '#1A202C',
        },
        lineNumber: {
          color: '#A0AEC0',
          marginRight: 8,
          fontFamily: 'Courier',
          fontSize: 11,
        },
        footer: {
          position: 'absolute',
          bottom: 30,
          left: 30,
          right: 30,
          textAlign: 'center',
          color: '#718096',
          fontSize: 10,
          fontFamily: 'Roboto',
        }
      });

      // Function to format the code with line numbers and preserve indentation
      const formatCodeWithLineNumbers = (code: string) => {
        const lines = code.split('\n');
        const maxLineNumberWidth = lines.length.toString().length;
        
        return lines.map((line, index) => {
          const lineNumber = (index + 1).toString().padStart(maxLineNumberWidth, ' ');
          // Replace spaces with non-breaking spaces to preserve indentation
          const formattedLine = line.replace(/ /g, ' ');
          return `${lineNumber} │ ${formattedLine}`;
        }).join('\n');
      };

      // Create PDF Document component
      const PDFDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.section}>
              <Text style={styles.title}>{snippet.title}</Text>
              <Text style={styles.metadata}>
                Language: {snippet.language} • {snippet.code.split('\n').length} lines • Created: {new Date(snippet.createdAt).toLocaleDateString()}
              </Text>
              <View style={styles.codeContainer}>
                <Text style={styles.code}>
                  {formatCodeWithLineNumbers(snippet.code)}
                </Text>
              </View>
            </View>
            <Text style={styles.footer}>
              Generated by Snippets • {new Date().toLocaleDateString()}
            </Text>
          </Page>
        </Document>
      );

      // Generate PDF
      const pdfBlob = await pdf(<PDFDocument />).toBlob();
      
      // Download PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${snippet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmbed = async () => {
    if (!snippet) return;

    try {
      // First check if user is logged in
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to embed snippets",
          variant: "destructive",
        });
        return;
      }

      // Then check if snippet is public or owned by current user
      const isOwner = user._id === snippet._id; // Changed from user._id to userId
      if (!snippet.isPublic && !isOwner) {
        toast({
          title: "Error",
          description:
            "You can only embed public snippets or your own snippets",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/snippet/embed/${snippet._id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate embed code");
      }

      const data = await response.json();
      if (data.success) {
        setEmbedCodes({
          html: data.embedHTML,
          markdown: data.embedMarkdown,
        });
        setShowEmbedDialog(true);
      } else {
        throw new Error(data.message || "Failed to generate embed code");
      }
    } catch (error) {
      console.error("Embed error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate embed code",
        variant: "destructive",
      });
    }
  };

  // Twitter sharing functionality removed

  useEffect(() => {
    const fetchComments = async () => {
      if (!snippet?.isPublic) return;

      try {
        const response = await fetch(
          `${BASE_URL}/api/snippet/public/${id}/comments`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();

        if (data.success) {
          setComments(data.comments);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    if (snippet?.isPublic) {
      fetchComments();
    }
  }, [snippet, id]);

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
      <div className="p-6 text-red-500 text-center">Snippet not found.</div>
    );
  }

  // Add these debug logs right before the return statement
  console.log("Rendering Stats:", {
    likes: {
      fromSnippet: snippet?.likes?.length,
      fromLikeState: likeState.likesCount,
    },
    views: snippet?.views,
    commentsCount: snippet?.commentsCount,
    rawLikes: snippet?.likes,
    rawLikeState: likeState,
  });

  return (
    <>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
      />

      {/* Add EmbedDialog here */}
      <EmbedDialog
        isOpen={showEmbedDialog}
        onClose={() => setShowEmbedDialog(false)}
        embedHTML={embedCodes.html}
        embedMarkdown={embedCodes.markdown}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          // Responsive width and padding
          "w-full max-w-[98%] sm:max-w-[95%] lg:max-w-[85%] xl:max-w-[100%] mx-auto",
          "group/card relative overflow-hidden",
          "p-2 sm:p-4 lg:p-8", // Reduced padding on mobile
          "mt-5 sm:mt-2", // Reduced top margin on mobile
          "rounded-xl border",
          "bg-white/60 dark:bg-[#1C1917]/40",
          "shadow-xl",
          "backdrop-blur-[12px]",
          "border-green-200/20 dark:border-green-100/10",
          "space-y-2 sm:space-y-4", // Reduced spacing on mobile
          "hover:border-green-500/20 dark:hover:border-green-500/10",
          // Glow effect that follows cursor
          "before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition-opacity before:duration-500",
          "after:absolute after:inset-0 after:-z-10 after:opacity-0 after:transition-opacity after:duration-500",
          "after:bg-[radial-gradient(800px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(52,211,153,0.08),transparent_50%)]",
          "border-green-200/20 dark:border-green-100/10",
          "hover:shadow-lg hover:shadow-zinc-200/20 dark:hover:shadow-zinc-900/30",
          "hover:after:opacity-100",
          // Transition
          "transition-all duration-200"
        )}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--mouse-x",
            `${e.clientX - rect.left}px`
          );
          e.currentTarget.style.setProperty(
            "--mouse-y",
            `${e.clientY - rect.top}px`
          );
        }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <div className="space-y-1 sm:space-y-2 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
              {snippet.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-xs sm:text-sm font-medium bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20"
              >
                {snippet.language.toUpperCase()}
              </Badge>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {new Date(snippet.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-1 w-full sm:w-auto justify-end sm:justify-start">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const shareUrl = snippet.isPublic
                        ? `${window.location.origin}/dashboard/s/${id}`
                        : window.location.href;

                      navigator
                        .share({
                          title: snippet.title,
                          text: snippet.description,
                          url: shareUrl,
                        })
                        .catch(() => {
                          navigator.clipboard.writeText(shareUrl);
                          toast({
                            title: "Link Copied!",
                            description: "Share link has been copied to clipboard",
                          });
                        });
                    }}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
                  >
                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share Snippet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleVisibilityToggle}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
                  >
                    {snippet.isPublic ? (
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {snippet.isPublic ? "Make Private" : "Make Public"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/dashboard/snippets/editsnippets/${id}`)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
                  >
                    <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Snippet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Snippet</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleScreenshot}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
                  >
                    <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download Screenshot</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePDFExport}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
                  >
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PDF</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleEmbed}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white dark:hover:bg-zinc-700 transition-colors rounded-md"
                  >
                    <Code2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Embed Snippet</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Description and Tags */}
        <div className="space-y-2 sm:space-y-3">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {snippet.description}
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {snippet.tags?.map((tag: string) => (
              <Badge
                key={tag}
                className={cn(
                  "px-1.5 sm:px-2 py-0.5",
                  "text-[10px] sm:text-xs",
                  "bg-zinc-100 dark:bg-zinc-800/50",
                  "hover:bg-zinc-200 dark:hover:bg-zinc-800",
                  "text-zinc-600 dark:text-zinc-400",
                  "border border-zinc-200/20 dark:border-zinc-700/30",
                  "transition-all duration-200",
                  "font-medium"
                )}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* iOS-style Code Window */}
        <div className="relative">
          <Card className="relative bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {/* Window Header */}
            <div className="flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2 bg-[#F3F4F6] dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF5F56]" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <div className="ml-2 sm:ml-3 flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                    {snippet.language}
                  </span>
                  <div className="h-2.5 sm:h-3 w-[1px] bg-zinc-300 dark:bg-zinc-700" />
                  <span className="text-[10px] sm:text-xs text-zinc-500">
                    {snippet.code.split("\n").length} lines
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className={cn(
                  "h-6 sm:h-7 transition-all duration-200",
                  copied
                    ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400"
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                )}
              >
                {copied ? (
                  <span className="text-[10px] sm:text-xs">Copied!</span>
                ) : (
                  <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                )}
              </Button>
            </div>

            {/* Code Content */}
            <div className="max-h-[300px] sm:max-h-[400px] overflow-hidden">
              <div
                className={cn(
                  "overflow-y-auto",
                  "overflow-x-hidden",
                  "max-h-[300px] sm:max-h-[400px]",
                  "p-2 sm:p-4",
                  "bg-[#F3F4F6] dark:bg-zinc-900",
                  "text-[11px] sm:text-sm leading-relaxed",
                  // Scrollbar styling
                  "scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700",
                  "scrollbar-track-transparent",
                  "hover:overflow-x-auto",
                  "[&::-webkit-scrollbar-horizontal]:hidden",
                  "[-ms-overflow-style:none]",
                  "[scrollbar-width:none]"
                  // ... (syntax highlighting classes)
                )}
              >
                <pre className="text-[11px] sm:text-sm leading-relaxed">
                  <code
                    className={`font-mono language-${snippet.language}`}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(snippet.code, {
                        language: snippet.language || "plaintext",
                      }).value,
                    }}
                  />
                </pre>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 border rounded-lg p-4 bg-background/50 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatDisplay
              icon={
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    likeState.isLiked && "fill-current text-red-500"
                  )}
                />
              }
              count={likeState.likesCount || 0}
              label={likeState.likesCount === 1 ? "Like" : "Likes"}
              onClick={user ? handleLikeToggle : undefined}
              isActive={likeState.isLiked}
              isInteractive={!!user}
            />

            <Separator orientation="vertical" className="h-6" />

            <StatDisplay
              icon={<Eye className="h-4 w-4" />}
              count={snippet?.views || 0}
              label={snippet?.views === 1 ? "View" : "Views"}
            />

            <Separator orientation="vertical" className="h-6" />

            <StatDisplay
              icon={<MessageSquare className="h-4 w-4" />}
              count={snippet?.commentsCount || 0}
              label={snippet?.commentsCount === 1 ? "Comment" : "Comments"}
            />

            {!user && (
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signIn()}
                  className="text-sm"
                >
                  Sign in to like
                </Button>
              </div>
            )}
          </div>
        </div>

        {!user && (
          <div className="mt-2 text-sm text-muted-foreground text-center">
            <p>Sign in to interact with this snippet</p>
          </div>
        )}
      </motion.div>

      {snippet.isPublic && comments.length > 0 && (
        <div className="my-6 space-y-4">
          <Separator className="my-6" />

          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold">
              Comments ({comments.length})
            </h3>
          </div>

          <div
            className="space-y-4 max-h-[400px] overflow-y-auto pr-2
            scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700
            scrollbar-track-transparent "
          >
            {comments.map((comment) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-lg",
                  "bg-white/60 dark:bg-zinc-800/50",
                  "border border-zinc-200/20 dark:border-zinc-700/30"
                )}
              >
                <div className="flex items-center justify-between mb-2 ">
                  <div className="flex items-center gap-2">
                    {comment.userId?.profileURL ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.userId.profileURL}
                          alt={comment.userId.username}
                        />
                        <AvatarFallback>
                          {comment.userId.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {comment.userId?.username || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(comment.createdAt),
                          "MMM d, yyyy • h:mm a"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 pl-10">
                  {comment.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SnippetDetail;
