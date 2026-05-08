import { useState, useCallback, useRef, useEffect } from "react";

interface AISuggestionsState {
  suggestion: string | null;
  isLoading: boolean;
  position: { line: number; column: number } | null;
  decoration: string[];
  isEnabled: boolean;
}

interface UseAISuggestionsReturn extends AISuggestionsState {
  toggleEnabled: () => void;
  fetchSuggestion: (type: string, editor: any, fileName?: string) => Promise<void>;
  acceptSuggestion: (editor: any, monaco: any) => void;
  rejectSuggestion: (editor: any) => void;
  clearSuggestion: (editor: any) => void;
}

export const useAISuggestions = (): UseAISuggestionsReturn => {
  const serviceBackoffUntilRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const isEnabledRef = useRef(true);
  const [state, setState] = useState<AISuggestionsState>({
    suggestion: null,
    isLoading: false,
    position: null,
    decoration: [],
    isEnabled: true,
  });

  useEffect(() => {
    isEnabledRef.current = state.isEnabled;
  }, [state.isEnabled]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const toggleEnabled = useCallback(() => {
    console.log("Toggling AI suggestions");
    setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const fetchSuggestion = useCallback(async (type: string, editor: any, fileName?: string) => {
    console.log("Fetching AI suggestion...");
    console.log("Editor Instance Available:", !!editor);

    if (!isEnabledRef.current) {
      console.warn("AI suggestions are disabled.");
      return;
    }

    if (!editor) {
      console.warn("Editor instance is not available.");
      return;
    }

    if (Date.now() < serviceBackoffUntilRef.current) {
      return;
    }

    const model = editor.getModel();
    const cursorPosition = editor.getPosition();

    if (!model || !cursorPosition) {
      console.warn("Editor model or cursor position is not available.");
      return;
    }

    const requestId = ++requestIdRef.current;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const payload = {
        fileContent: model.getValue(),
        cursorLine: cursorPosition.lineNumber - 1,
        cursorColumn: cursorPosition.column - 1,
        suggestionType: type,
        fileName,
      };
      console.log("Request payload:", payload);

      const response = await fetch("/api/code-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 503 || response.status === 504) {
          serviceBackoffUntilRef.current = Date.now() + 10000;
        }

        const errorPayload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;

        throw new Error(
          errorPayload?.message ||
            `API responded with status ${response.status}`,
        );
      }

      const data = await response.json();
      console.log("API response:", data);

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (data.suggestion) {
        const suggestionText = data.suggestion.trim();
        serviceBackoffUntilRef.current = 0;
        setState((prev) => ({
          ...prev,
          suggestion: suggestionText,
          position: {
            line: cursorPosition.lineNumber,
            column: cursorPosition.column,
          },
          isLoading: false,
        }));
      } else {
        console.warn("No suggestion received from API.");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      console.error("Error fetching code suggestion:", error);
      if (requestId === requestIdRef.current) {
          serviceBackoffUntilRef.current = Date.now() + 10000;
          setState((prev) => ({ ...prev, isLoading: false }));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  const acceptSuggestion = useCallback(
    (editor: any, _monaco: any) => {
      setState((currentState) => {
        if (!currentState.suggestion || !currentState.position) {
          return currentState;
        }

        // Clear decorations
        if (editor && currentState.decoration.length > 0) {
          editor.deltaDecorations(currentState.decoration, []);
        }

        return {
          ...currentState,
          suggestion: null,
          position: null,
          decoration: [],
        };
      });
    },
    []
  );

  const rejectSuggestion = useCallback((editor: any) => {
    setState((currentState) => {
      if (editor && currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }
      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  const clearSuggestion = useCallback((editor: any) => {
    setState((currentState) => {
      if (editor && currentState.decoration.length > 0) {
        editor.deltaDecorations(currentState.decoration, []);
      }
      return {
        ...currentState,
        suggestion: null,
        position: null,
        decoration: [],
      };
    });
  }, []);

  return {
    ...state,
    toggleEnabled,
    fetchSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    clearSuggestion,
  };
};
