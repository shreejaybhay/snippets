import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmbedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  embedHTML: string;
  embedMarkdown: string;
}

const EmbedDialog: React.FC<EmbedDialogProps> = ({
  isOpen,
  onClose,
  embedHTML,
  embedMarkdown,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<'html' | 'markdown' | null>(null);

  const handleCopy = async (text: string, type: 'html' | 'markdown') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Embed Snippet</DialogTitle>
          <DialogDescription>
            Choose how you want to embed this snippet in your content
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>

          <TabsContent value="html">
            <div className="relative">
              <ScrollArea className="h-[200px] w-full rounded-md border">
                <pre className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                  <code className="text-sm whitespace-pre-wrap break-all">{embedHTML}</code>
                </pre>
              </ScrollArea>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(embedHTML, 'html')}
              >
                {copied === 'html' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="markdown">
            <div className="relative">
              <ScrollArea className="h-[200px] w-full rounded-md border">
                <pre className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                  <code className="text-sm whitespace-pre-wrap break-all">{embedMarkdown}</code>
                </pre>
              </ScrollArea>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(embedMarkdown, 'markdown')}
              >
                {copied === 'markdown' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedDialog;
