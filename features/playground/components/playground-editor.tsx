"use client";

import { useRef, useEffect, useCallback } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import type * as MonacoEditor from "monaco-editor";
import { useTheme } from "next-themes";
import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
  getMonacoTheme,
} from "@/features/playground/libs/editor-config";
import type { TemplateFile } from "@/features/playground/libs/path-to-json";

interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined;
  content: string;
  onContentChange: (value: string) => void;
  suggestion: string | null;
  suggestionLoading: boolean;
  suggestionPosition: { line: number; column: number } | null;
  onAcceptSuggestion: (editor: any, monaco: any) => void;
  onRejectSuggestion: (editor: any) => void;
  onTriggerSuggestion: (type: string, editor: any, fileName?: string) => void;
  onCursorPositionChange?: (position: { line: number; column: number }) => void;
}

export const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
  suggestion,
  suggestionLoading,
  suggestionPosition,
  onAcceptSuggestion,
  onRejectSuggestion,
  onTriggerSuggestion,
  onCursorPositionChange,
}: PlaygroundEditorProps) => {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const activeFileNameRef = useRef<string | undefined>(undefined);
  const inlineCompletionProviderRef = useRef<any>(null);
  const currentSuggestionRef = useRef<{
    text: string;
    position: { line: number; column: number };
    id: string;
  } | null>(null);
  const isAcceptingSuggestionRef = useRef(false);
  const suggestionAcceptedRef = useRef(false);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabCommandRef = useRef<any>(null);

  useEffect(() => {
    activeFileNameRef.current = activeFile
      ? `${activeFile.filename}.${activeFile.fileExtension}`
      : undefined;
  }, [activeFile]);

  const generateSuggestionId = () =>
    `suggestion-${Date.now()}-${Math.random()}`;

  const createInlineCompletionProvider = useCallback(
    (monaco: Monaco) => {
      return {
        provideInlineCompletions: async (
          model: any,
          position: any,
          context: any,
          token: any,
        ) => {
          console.log("provideInlineCompletions called", {
            hasSuggestion: !!suggestion,
            hasPosition: !!suggestionPosition,
            currentPos: `${position.lineNumber}:${position.column}`,
            suggestionPos: suggestionPosition
              ? `${suggestionPosition.line}:${suggestionPosition.column}`
              : null,
            isAccepting: isAcceptingSuggestionRef.current,
            suggestionAccepted: suggestionAcceptedRef.current,
          });

          if (
            isAcceptingSuggestionRef.current ||
            suggestionAcceptedRef.current
          ) {
            console.log("Skipping completion - already accepting or accepted");
            return { items: [] };
          }

          if (!suggestion || !suggestionPosition) {
            console.log("No suggestion or position available");
            return { items: [] };
          }

          const currentLine = position.lineNumber;
          const currentColumn = position.column;

          const isPositionMatch =
            currentLine === suggestionPosition.line &&
            currentColumn >= suggestionPosition.column &&
            currentColumn <= suggestionPosition.column + 2;

          if (!isPositionMatch) {
            console.log("Position mismatch", {
              current: `${currentLine}:${currentColumn}`,
              expected: `${suggestionPosition.line}:${suggestionPosition.column}`,
            });
            return { items: [] };
          }

          const suggestionId = generateSuggestionId();
          currentSuggestionRef.current = {
            text: suggestion,
            position: suggestionPosition,
            id: suggestionId,
          };

          console.log("Providing inline completion", {
            suggestionId,
            suggestion: suggestion.substring(0, 50) + "...",
          });

          const cleanSuggestion = suggestion.replace(/\r/g, "");

          return {
            items: [
              {
                insertText: cleanSuggestion,
                range: new monaco.Range(
                  suggestionPosition.line,
                  suggestionPosition.column,
                  suggestionPosition.line,
                  suggestionPosition.column,
                ),
                kind: monaco.languages.CompletionItemKind.Snippet,
                label: "AI Suggestion",
                detail: "AI-generated code suggestion",
                documentation: "Press Tab to accept",
                sortText: "0000",
                filterText: "",
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              },
            ],
          };
        },
        freeInlineCompletions: (completions: any) => {
          console.log("freeInlineCompletions called");
        },
      };
    },
    [suggestion, suggestionPosition],
  );

  const clearCurrentSuggestion = useCallback(() => {
    console.log("Clearing current suggestion");
    currentSuggestionRef.current = null;
    suggestionAcceptedRef.current = false;
    if (editorRef.current) {
      editorRef.current.trigger("ai", "editor.action.inlineSuggest.hide", null);
    }
  }, []);

  const acceptCurrentSuggestion = useCallback(() => {
    console.log("acceptCurrentSuggestion called", {
      hasEditor: !!editorRef.current,
      hasMonaco: !!monacoRef.current,
      hasSuggestion: !!currentSuggestionRef.current,
      isAccepting: isAcceptingSuggestionRef.current,
      suggestionAccepted: suggestionAcceptedRef.current,
    });

    if (
      !editorRef.current ||
      !monacoRef.current ||
      !currentSuggestionRef.current
    ) {
      console.log("Cannot accept suggestion - missing refs");
      return false;
    }

    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
      console.log("BLOCKED: Already accepting/accepted suggestion, skipping");
      return false;
    }

    isAcceptingSuggestionRef.current = true;
    suggestionAcceptedRef.current = true;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const currentSuggestion = currentSuggestionRef.current;

    try {
      const cleanSuggestionText = currentSuggestion.text.replace(/\r/g, "");

      console.log(
        "ACCEPTING suggestion:",
        cleanSuggestionText.substring(0, 50) + "...",
      );

      const currentPosition = editor.getPosition();
      const suggestionPos = currentSuggestion.position;

      if (
        currentPosition.lineNumber !== suggestionPos.line ||
        currentPosition.column < suggestionPos.column ||
        currentPosition.column > suggestionPos.column + 5
      ) {
        console.log("Position changed, cannot accept suggestion");
        return false;
      }

      const range = new monaco.Range(
        suggestionPos.line,
        suggestionPos.column,
        suggestionPos.line,
        suggestionPos.column,
      );

      const success = editor.executeEdits("ai-suggestion-accept", [
        {
          range: range,
          text: cleanSuggestionText,
          forceMoveMarkers: true,
        },
      ]);

      if (!success) {
        console.error("Failed to execute edit");
        return false;
      }

      const lines = cleanSuggestionText.split("\n");
      const endLine = suggestionPos.line + lines.length - 1;
      const endColumn =
        lines.length === 1
          ? suggestionPos.column + cleanSuggestionText.length
          : lines[lines.length - 1].length + 1;

      editor.setPosition({ lineNumber: endLine, column: endColumn });

      console.log(
        "SUCCESS: Suggestion accepted, new position:",
        `${endLine}:${endColumn}`,
      );

      clearCurrentSuggestion();

      onAcceptSuggestion(editor, monaco);

      return true;
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      return false;
    } finally {
      isAcceptingSuggestionRef.current = false;

      setTimeout(() => {
        suggestionAcceptedRef.current = false;
        console.log("Reset suggestionAcceptedRef flag");
      }, 1000);
    }
  }, [clearCurrentSuggestion, onAcceptSuggestion]);

  const hasActiveSuggestionAtPosition = useCallback(() => {
    if (!editorRef.current || !currentSuggestionRef.current) return false;

    const position = editorRef.current.getPosition();
    const suggestion = currentSuggestionRef.current;

    return (
      position.lineNumber === suggestion.position.line &&
      position.column >= suggestion.position.column &&
      position.column <= suggestion.position.column + 2
    );
  }, []);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    console.log("Suggestion changed", {
      hasSuggestion: !!suggestion,
      hasPosition: !!suggestionPosition,
      isAccepting: isAcceptingSuggestionRef.current,
      suggestionAccepted: suggestionAcceptedRef.current,
    });

    if (isAcceptingSuggestionRef.current || suggestionAcceptedRef.current) {
      console.log("Skipping update - currently accepting/accepted suggestion");
      return;
    }

    if (inlineCompletionProviderRef.current) {
      inlineCompletionProviderRef.current.dispose();
      inlineCompletionProviderRef.current = null;
    }

    currentSuggestionRef.current = null;

    if (suggestion && suggestionPosition) {
      console.log("Registering new inline completion provider");

      const language = getEditorLanguage(activeFile?.fileExtension || "");
      const provider = createInlineCompletionProvider(monaco);

      inlineCompletionProviderRef.current =
        monaco.languages.registerInlineCompletionsProvider(language, provider);

      setTimeout(() => {
        if (
          editorRef.current &&
          !isAcceptingSuggestionRef.current &&
          !suggestionAcceptedRef.current
        ) {
          console.log("Triggering inline suggestions");
          editor.trigger("ai", "editor.action.inlineSuggest.trigger", null);
        }
      }, 50);
    }

    return () => {
      if (inlineCompletionProviderRef.current) {
        inlineCompletionProviderRef.current.dispose();
        inlineCompletionProviderRef.current = null;
      }
    };
  }, [
    suggestion,
    suggestionPosition,
    activeFile,
    createInlineCompletionProvider,
  ]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    console.log("Editor instance mounted:", !!editorRef.current);

    editor.updateOptions({
      ...defaultEditorOptions,
      inlineSuggest: {
        enabled: true,
        mode: "prefix",
        suppressSuggestions: false,
      },
      suggest: {
        preview: false,
        showInlineDetails: false,
        insertMode: "replace",
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      cursorSmoothCaretAnimation: "on",
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      console.log("Ctrl+Space pressed, triggering suggestion");
      onTriggerSuggestion("completion", editor, activeFileNameRef.current);
    });

    if (tabCommandRef.current) {
      tabCommandRef.current.dispose();
    }

    tabCommandRef.current = editor.addCommand(
      monaco.KeyCode.Tab,
      () => {
        console.log("TAB PRESSED", {
          hasSuggestion: !!currentSuggestionRef.current,
          hasActiveSuggestion: hasActiveSuggestionAtPosition(),
          isAccepting: isAcceptingSuggestionRef.current,
          suggestionAccepted: suggestionAcceptedRef.current,
        });

        if (isAcceptingSuggestionRef.current) {
          console.log(
            "BLOCKED: Already in the process of accepting, ignoring Tab",
          );
          return;
        }

        if (suggestionAcceptedRef.current) {
          console.log(
            "BLOCKED: Suggestion was just accepted, using default tab",
          );
          editor.trigger("keyboard", "tab", null);
          return;
        }

        if (currentSuggestionRef.current && hasActiveSuggestionAtPosition()) {
          console.log("ATTEMPTING to accept suggestion with Tab");
          const accepted = acceptCurrentSuggestion();
          if (accepted) {
            console.log(
              "SUCCESS: Suggestion accepted via Tab, preventing default behavior",
            );
            return;
          }
          console.log(
            "FAILED: Suggestion acceptance failed, falling through to default",
          );
        }

        console.log("DEFAULT: Using default tab behavior");
        editor.trigger("keyboard", "tab", null);
      },
      "editorTextFocus && !editorReadonly && !suggestWidgetVisible",
    );

    editor.addCommand(monaco.KeyCode.Escape, () => {
      console.log("Escape pressed");
      if (currentSuggestionRef.current) {
        onRejectSuggestion(editor);
        clearCurrentSuggestion();
      }
    });

    editor.onDidChangeCursorPosition((e: any) => {
      if (isAcceptingSuggestionRef.current) return;

      const newPosition = e.position;
      onCursorPositionChange?.({
        line: newPosition.lineNumber,
        column: newPosition.column,
      });

      if (currentSuggestionRef.current && !suggestionAcceptedRef.current) {
        const suggestionPos = currentSuggestionRef.current.position;

        if (
          newPosition.lineNumber !== suggestionPos.line ||
          newPosition.column < suggestionPos.column ||
          newPosition.column > suggestionPos.column + 10
        ) {
          console.log("Cursor moved away from suggestion, clearing");
          clearCurrentSuggestion();
          onRejectSuggestion(editor);
        }
      }

      if (!currentSuggestionRef.current && !suggestionLoading) {
        if (suggestionTimeoutRef.current) {
          clearTimeout(suggestionTimeoutRef.current);
        }

        suggestionTimeoutRef.current = setTimeout(() => {
          onTriggerSuggestion("completion", editor, activeFileNameRef.current);
        }, 300);
      }
    });

    editor.onDidChangeModelContent((e: any) => {
      if (isAcceptingSuggestionRef.current) return;

      if (
        currentSuggestionRef.current &&
        e.changes.length > 0 &&
        !suggestionAcceptedRef.current
      ) {
        const change = e.changes[0];

        if (
          change.text === currentSuggestionRef.current.text ||
          change.text === currentSuggestionRef.current.text.replace(/\r/g, "")
        ) {
          console.log("Our suggestion was inserted, not clearing");
          return;
        }

        console.log("User typed while suggestion active, clearing");
        clearCurrentSuggestion();
      }

      if (e.changes.length > 0 && !suggestionAcceptedRef.current) {
        const change = e.changes[0];

        if (
          change.text === "\n" ||
          change.text === "{" ||
          change.text === "." ||
          change.text === "=" ||
          change.text === "(" ||
          change.text === "," ||
          change.text === ":" ||
          change.text === ";"
        ) {
          setTimeout(() => {
            if (
              editorRef.current &&
              !currentSuggestionRef.current &&
              !suggestionLoading
            ) {
              onTriggerSuggestion(
                "completion",
                editor,
                activeFileNameRef.current,
              );
            }
          }, 100); // Small delay to let the change settle
        }
      }
    });

    const initialPosition = editor.getPosition();
    if (initialPosition) {
      onCursorPositionChange?.({
        line: initialPosition.lineNumber,
        column: initialPosition.column,
      });
    }

    updateEditorLanguage();
  };

  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const language = getEditorLanguage(activeFile.fileExtension || "");
    try {
      monacoRef.current.editor.setModelLanguage(model, language);
    } catch (error) {
      console.warn("Failed to set editor language:", error);
    }
  };

  useEffect(() => {
    updateEditorLanguage();
  }, [activeFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
      if (inlineCompletionProviderRef.current) {
        inlineCompletionProviderRef.current.dispose();
        inlineCompletionProviderRef.current = null;
      }
      if (tabCommandRef.current) {
        tabCommandRef.current.dispose();
        tabCommandRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-full bg-[#0f1117]">
      {suggestionLoading && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border border-orange-400/20 bg-[#161b22] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-orange-200 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
          <div className="h-2 w-2 animate-pulse rounded-full bg-orange-400"></div>
          AI thinking...
        </div>
      )}

      {currentSuggestionRef.current && !suggestionLoading && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-[#161b22] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200 shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
          <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
          Press Tab to accept
        </div>
      )}

      <Editor
        beforeMount={configureMonaco}
        height="100%"
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        theme={getMonacoTheme(resolvedTheme)}
        language={
          activeFile
            ? getEditorLanguage(activeFile.fileExtension || "")
            : "plaintext"
        }
        options={
          defaultEditorOptions as unknown as MonacoEditor.editor.IStandaloneEditorConstructionOptions
        }
      />
    </div>
  );
};
