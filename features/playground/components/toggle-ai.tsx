"use client";

import { useState } from "react";
import { Bot, FileText, Loader2, Power, PowerOff } from "lucide-react";
import { AIChatSidePanel } from "@/features/ai-chat/components/ai-chat-sidepanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ToggleAIProps {
  isEnabled: boolean;
  onToggle: () => void;
  suggestionLoading: boolean;
  loadingProgress?: number;
  activeFeature?: string;
  activeFileName?: string;
  activeFileContent?: string;
  activeFileLanguage?: string;
  cursorPosition?: { line: number; column: number } | null;
  onInsertCode?: (
    code: string,
    fileName?: string,
    position?: { line: number; column: number },
  ) => void;
  onRunCode?: (code: string, language: string) => void;
  theme?: "dark" | "light";
}

const ToggleAI: React.FC<ToggleAIProps> = ({
  isEnabled,
  onToggle,
  suggestionLoading,
  loadingProgress = 0,
  activeFeature,
  activeFileName,
  activeFileContent,
  activeFileLanguage,
  cursorPosition,
  onInsertCode,
  onRunCode,
  theme = "dark",
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant={isEnabled ? "default" : "outline"}
            className={cn(
              "relative h-8 gap-2 px-3 text-sm font-medium transition-all duration-200",
              isEnabled
                ? "border-zinc-800 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                : "border-border bg-background text-foreground hover:bg-accent",
              suggestionLoading && "opacity-75",
            )}
          >
            {suggestionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            <span>AI</span>
            <div
              className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                isEnabled ? "bg-green-500" : "bg-red-500",
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isEnabled
                  ? "border-zinc-800 bg-zinc-900 text-zinc-50 dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-900"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isEnabled ? "Active" : "Inactive"}
            </Badge>
          </DropdownMenuLabel>

          {suggestionLoading && activeFeature && (
            <div className="px-3 pb-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{activeFeature}</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                <Progress value={loadingProgress} className="h-1.5" />
              </div>
            </div>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onToggle} className="cursor-pointer py-2.5">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                {isEnabled ? (
                  <Power className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <PowerOff className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <div className="text-sm font-medium">
                    {isEnabled ? "Disable" : "Enable"} AI
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Toggle AI assistance
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "relative h-4 w-8 rounded-full border transition-all duration-200",
                  isEnabled
                    ? "border-zinc-900 bg-zinc-900 dark:border-zinc-50 dark:bg-zinc-50"
                    : "border-border bg-muted",
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all duration-200",
                    isEnabled ? "left-4" : "left-0.5",
                  )}
                />
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setIsChatOpen(true)}
            className="cursor-pointer py-2.5"
          >
            <div className="flex w-full items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Open Chat</div>
                <div className="text-xs text-muted-foreground">
                  Chat with the active file context
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AIChatSidePanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onInsertCode={onInsertCode}
        onRunCode={onRunCode}
        activeFileName={activeFileName}
        activeFileContent={activeFileContent}
        activeFileLanguage={activeFileLanguage}
        cursorPosition={cursorPosition ?? undefined}
        theme={theme}
      />
    </>
  );
};

export default ToggleAI;
