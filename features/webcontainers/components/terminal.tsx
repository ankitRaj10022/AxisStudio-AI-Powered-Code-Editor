"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { SearchAddon } from "xterm-addon-search";
import { WebLinksAddon } from "xterm-addon-web-links";
import { Copy, Download, Search, Trash2 } from "lucide-react";
import type { WebContainer } from "@webcontainer/api";
import "xterm/css/xterm.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TerminalProps {
  webcontainerUrl?: string;
  className?: string;
  theme?: "dark" | "light";
  webContainerInstance?: WebContainer | null;
}

export interface TerminalRef {
  writeToTerminal: (data: string) => void;
  clearTerminal: () => void;
  focusTerminal: () => void;
}

const terminalThemes = {
  dark: {
    background: "#090c12",
    foreground: "#e5e7eb",
    cursor: "#f8fafc",
    cursorAccent: "#090c12",
    selection: "#283041",
    black: "#151821",
    red: "#f87171",
    green: "#4ade80",
    yellow: "#facc15",
    blue: "#60a5fa",
    magenta: "#c084fc",
    cyan: "#22d3ee",
    white: "#f4f4f5",
    brightBlack: "#52525b",
    brightRed: "#fb7185",
    brightGreen: "#86efac",
    brightYellow: "#fde047",
    brightBlue: "#93c5fd",
    brightMagenta: "#d8b4fe",
    brightCyan: "#67e8f9",
    brightWhite: "#ffffff",
  },
  light: {
    background: "#ffffff",
    foreground: "#18181b",
    cursor: "#18181b",
    cursorAccent: "#ffffff",
    selection: "#e4e4e7",
    black: "#18181b",
    red: "#dc2626",
    green: "#16a34a",
    yellow: "#ca8a04",
    blue: "#2563eb",
    magenta: "#9333ea",
    cyan: "#0891b2",
    white: "#f4f4f5",
    brightBlack: "#71717a",
    brightRed: "#ef4444",
    brightGreen: "#22c55e",
    brightYellow: "#eab308",
    brightBlue: "#3b82f6",
    brightMagenta: "#a855f7",
    brightCyan: "#06b6d4",
    brightWhite: "#fafafa",
  },
} as const;

const TerminalComponent = forwardRef<TerminalRef, TerminalProps>(
  ({ className, theme = "dark", webContainerInstance }, ref) => {
    const terminalContainerRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const searchAddonRef = useRef<SearchAddon | null>(null);
    const currentLineRef = useRef("");
    const cursorPositionRef = useRef(0);
    const commandHistoryRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);
    const currentProcessRef = useRef<{
      kill: () => void;
      exit: Promise<number>;
    } | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    const writePrompt = useCallback(() => {
      if (!termRef.current) return;
      termRef.current.write("\r\n$ ");
      currentLineRef.current = "";
      cursorPositionRef.current = 0;
    }, []);

    const clearTerminal = useCallback(() => {
      if (!termRef.current) return;
      termRef.current.clear();
      termRef.current.writeln("WebContainer terminal");
      writePrompt();
    }, [writePrompt]);

    useImperativeHandle(
      ref,
      () => ({
        writeToTerminal: (data: string) => {
          termRef.current?.write(data);
        },
        clearTerminal,
        focusTerminal: () => {
          termRef.current?.focus();
        },
      }),
      [clearTerminal],
    );

    const executeCommand = useCallback(
      async (command: string) => {
        if (!webContainerInstance || !termRef.current) return;

        if (
          command.trim() &&
          commandHistoryRef.current[commandHistoryRef.current.length - 1] !==
            command
        ) {
          commandHistoryRef.current.push(command);
        }
        historyIndexRef.current = -1;

        if (command.trim() === "clear") {
          clearTerminal();
          return;
        }

        if (command.trim() === "history") {
          commandHistoryRef.current.forEach((entry, index) => {
            termRef.current?.writeln(`  ${index + 1}  ${entry}`);
          });
          writePrompt();
          return;
        }

        if (!command.trim()) {
          writePrompt();
          return;
        }

        try {
          const [cmd, ...args] = command.trim().split(" ");
          termRef.current.writeln("");

          const process = await webContainerInstance.spawn(cmd, args, {
            terminal: {
              cols: termRef.current.cols,
              rows: termRef.current.rows,
            },
          });

          currentProcessRef.current = process;

          process.output.pipeTo(
            new WritableStream({
              write(data) {
                termRef.current?.write(data);
              },
            }),
          );

          await process.exit;
          currentProcessRef.current = null;
          writePrompt();
        } catch {
          termRef.current.writeln(`\r\nCommand not found: ${command}`);
          currentProcessRef.current = null;
          writePrompt();
        }
      },
      [clearTerminal, webContainerInstance, writePrompt],
    );

    const handleTerminalInput = useCallback(
      (data: string) => {
        if (!termRef.current) return;

        switch (data) {
          case "\r":
            void executeCommand(currentLineRef.current);
            break;
          case "\u007F":
            if (cursorPositionRef.current > 0) {
              currentLineRef.current =
                currentLineRef.current.slice(0, cursorPositionRef.current - 1) +
                currentLineRef.current.slice(cursorPositionRef.current);
              cursorPositionRef.current--;
              termRef.current.write("\b \b");
            }
            break;
          case "\u0003":
            currentProcessRef.current?.kill();
            currentProcessRef.current = null;
            termRef.current.writeln("^C");
            writePrompt();
            break;
          case "\u001b[A":
            if (commandHistoryRef.current.length > 0) {
              if (historyIndexRef.current === -1) {
                historyIndexRef.current = commandHistoryRef.current.length - 1;
              } else if (historyIndexRef.current > 0) {
                historyIndexRef.current--;
              }

              const historyCommand =
                commandHistoryRef.current[historyIndexRef.current];
              termRef.current.write(
                "\r$ " + " ".repeat(currentLineRef.current.length) + "\r$ ",
              );
              termRef.current.write(historyCommand);
              currentLineRef.current = historyCommand;
              cursorPositionRef.current = historyCommand.length;
            }
            break;
          case "\u001b[B":
            if (historyIndexRef.current !== -1) {
              if (
                historyIndexRef.current <
                commandHistoryRef.current.length - 1
              ) {
                historyIndexRef.current++;
                const historyCommand =
                  commandHistoryRef.current[historyIndexRef.current];
                termRef.current.write(
                  "\r$ " + " ".repeat(currentLineRef.current.length) + "\r$ ",
                );
                termRef.current.write(historyCommand);
                currentLineRef.current = historyCommand;
                cursorPositionRef.current = historyCommand.length;
              } else {
                historyIndexRef.current = -1;
                termRef.current.write(
                  "\r$ " + " ".repeat(currentLineRef.current.length) + "\r$ ",
                );
                currentLineRef.current = "";
                cursorPositionRef.current = 0;
              }
            }
            break;
          default:
            if (data >= " " || data === "\t") {
              currentLineRef.current =
                currentLineRef.current.slice(0, cursorPositionRef.current) +
                data +
                currentLineRef.current.slice(cursorPositionRef.current);
              cursorPositionRef.current++;
              termRef.current.write(data);
            }
        }
      },
      [executeCommand, writePrompt],
    );

    const initializeTerminal = useCallback(() => {
      if (!terminalContainerRef.current || termRef.current) return;

      const terminal = new Terminal({
        cursorBlink: true,
        fontFamily:
          '"JetBrains Mono", "IBM Plex Mono", "Fira Code", Consolas, monospace',
        fontSize: 13,
        lineHeight: 1.25,
        theme: terminalThemes[theme],
        convertEol: true,
        scrollback: 1200,
        tabStopWidth: 2,
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      const searchAddon = new SearchAddon();

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);
      terminal.loadAddon(searchAddon);
      terminal.open(terminalContainerRef.current);
      terminal.onData(handleTerminalInput);

      fitAddonRef.current = fitAddon;
      searchAddonRef.current = searchAddon;
      termRef.current = terminal;

      setTimeout(() => {
        fitAddon.fit();
      }, 80);

      terminal.writeln("WebContainer terminal");
      terminal.writeln("Type commands here while the runtime is active.");
      writePrompt();
    }, [handleTerminalInput, theme, writePrompt]);

    const connectToWebContainer = useCallback(() => {
      if (!webContainerInstance || !termRef.current) return;
      setIsConnected(true);
      termRef.current.writeln("[connected] WebContainer session ready");
      termRef.current.writeln("[info] shell commands are available below");
      writePrompt();
    }, [webContainerInstance, writePrompt]);

    const copyTerminalContent = useCallback(async () => {
      const selection = termRef.current?.getSelection();
      if (!selection) return;

      try {
        await navigator.clipboard.writeText(selection);
      } catch (error) {
        console.error("Failed to copy terminal selection:", error);
      }
    }, []);

    const downloadTerminalLog = useCallback(() => {
      if (!termRef.current) return;

      const buffer = termRef.current.buffer.active;
      let content = "";

      for (let index = 0; index < buffer.length; index += 1) {
        const line = buffer.getLine(index);
        if (line) {
          content += `${line.translateToString(true)}\n`;
        }
      }

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `terminal-log-${new Date()
        .toISOString()
        .slice(0, 19)}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
    }, []);

    const searchInTerminal = useCallback((term: string) => {
      if (term) {
        searchAddonRef.current?.findNext(term);
      }
    }, []);

    useEffect(() => {
      initializeTerminal();

      const resizeObserver = new ResizeObserver(() => {
        setTimeout(() => {
          fitAddonRef.current?.fit();
        }, 60);
      });

      if (terminalContainerRef.current) {
        resizeObserver.observe(terminalContainerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
        currentProcessRef.current?.kill();
        termRef.current?.dispose();
        termRef.current = null;
      };
    }, [initializeTerminal]);

    useEffect(() => {
      if (webContainerInstance && termRef.current && !isConnected) {
        connectToWebContainer();
      }
    }, [connectToWebContainer, isConnected, webContainerInstance]);

    return (
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-xl border border-white/8 bg-[#0b0d12]",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-white/8 bg-[#141820] px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
            </div>
            <span className="text-sm font-medium text-zinc-200">
              WebContainer Terminal
            </span>
            {isConnected ? (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-xs text-zinc-500">Connected</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1">
            {showSearch ? (
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchTerm(value);
                  searchInTerminal(value);
                }}
                className="h-7 w-36 border-white/8 bg-[#0f1117] text-xs text-zinc-200 placeholder:text-zinc-500"
              />
            ) : null}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch((current) => !current)}
              className="h-7 w-7 p-0 text-zinc-400 hover:bg-white/8 hover:text-zinc-100"
            >
              <Search className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyTerminalContent}
              className="h-7 w-7 p-0 text-zinc-400 hover:bg-white/8 hover:text-zinc-100"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTerminalLog}
              className="h-7 w-7 p-0 text-zinc-400 hover:bg-white/8 hover:text-zinc-100"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTerminal}
              className="h-7 w-7 p-0 text-zinc-400 hover:bg-white/8 hover:text-zinc-100"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="relative flex-1">
          <div
            ref={terminalContainerRef}
            className="absolute inset-0 p-2"
            style={{
              background: terminalThemes[theme].background,
            }}
          />
        </div>
      </div>
    );
  },
);

TerminalComponent.displayName = "TerminalComponent";

export default TerminalComponent;
