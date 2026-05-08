"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  FileText,
  Loader2,
  Power,
  PowerOff,
  RefreshCw,
} from "lucide-react";
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

interface OllamaRuntimeStatus {
  baseUrl: string;
  model: string;
  reachable: boolean;
  modelAvailable: boolean;
  availableModels: string[];
  message: string;
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
  const [ollamaStatus, setOllamaStatus] = useState<OllamaRuntimeStatus | null>(
    null,
  );
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);

  const refreshOllamaStatus = useCallback(async () => {
    setIsCheckingOllama(true);

    try {
      const response = await fetch("/api/health", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load health status: ${response.status}`);
      }

      const data = (await response.json()) as {
        ollama?: OllamaRuntimeStatus;
      };

      if (!data.ollama) {
        throw new Error("Ollama status is missing from /api/health.");
      }

      setOllamaStatus(data.ollama);
    } catch (error) {
      console.error("Failed to load Ollama status:", error);
      setOllamaStatus({
        baseUrl: "https://ollama.com/api",
        model: "qwen3-coder-next",
        reachable: false,
        modelAvailable: false,
        availableModels: [],
        message: "Failed to load the configured Ollama service status.",
      });
    } finally {
      setIsCheckingOllama(false);
    }
  }, []);

  useEffect(() => {
    void refreshOllamaStatus();
  }, [refreshOllamaStatus]);

  const isOllamaReady =
    ollamaStatus !== null
      ? ollamaStatus.reachable && ollamaStatus.modelAvailable
      : null;
  const statusIndicatorClass = !isEnabled
    ? "bg-red-500"
    : isCheckingOllama
      ? "bg-zinc-400"
      : isOllamaReady === false
        ? "bg-amber-400"
        : "bg-green-500";

  return (
    <>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            void refreshOllamaStatus();
          }
        }}
      >
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
                statusIndicatorClass,
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

          <div className="px-3 pb-3">
            <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Ollama Runtime
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground">
                    {ollamaStatus?.model || "qwen3-coder-next"}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void refreshOllamaStatus()}
                  disabled={isCheckingOllama}
                  className="h-7 w-7 shrink-0"
                >
                  {isCheckingOllama ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    isCheckingOllama
                      ? "bg-muted text-muted-foreground"
                      : isOllamaReady
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : ollamaStatus?.reachable
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                          : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
                  )}
                >
                  {isCheckingOllama
                    ? "Checking"
                    : isOllamaReady
                      ? "Connected"
                      : ollamaStatus?.reachable
                        ? "Model missing"
                        : "Offline"}
                </Badge>

                {ollamaStatus?.baseUrl ? (
                  <span className="truncate text-[11px] text-muted-foreground">
                    {ollamaStatus.baseUrl}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {ollamaStatus?.message ||
                  "Checking the configured Ollama service."}
              </p>

              {ollamaStatus &&
              !ollamaStatus.modelAvailable &&
              ollamaStatus.availableModels.length > 0 ? (
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                  Available models:{" "}
                  {ollamaStatus.availableModels.slice(0, 3).join(", ")}
                </p>
              ) : null}

              {isOllamaReady === false ? (
                <p className="mt-2 text-[11px] leading-5 text-amber-600 dark:text-amber-300">
                  Check `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, and `OLLAMA_API_KEY`
                  before opening AI chat.
                </p>
              ) : null}
            </div>
          </div>

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
