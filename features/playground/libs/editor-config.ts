import type { Monaco } from "@monaco-editor/react";

export const getEditorLanguage = (fileExtension: string): string => {
  const extension = fileExtension.toLowerCase();
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    mjs: "javascript",
    cjs: "javascript",
    
    // Web languages
    json: "json",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",
    
    // Markup/Documentation
    md: "markdown",
    markdown: "markdown",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    
    // Programming languages
    py: "python",
    python: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    sh: "shell",
    bash: "shell",
    sql: "sql",
    
    // Config files
    toml: "ini",
    ini: "ini",
    conf: "ini",
    dockerfile: "dockerfile",
  };
  
  return languageMap[extension] || "plaintext";
};

export const configureMonaco = (monaco: Monaco) => {
  monaco.editor.defineTheme("modern-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      // Comments
      { token: "comment", foreground: "7C7C7C", fontStyle: "italic" },
      { token: "comment.line", foreground: "7C7C7C", fontStyle: "italic" },
      { token: "comment.block", foreground: "7C7C7C", fontStyle: "italic" },
      
      // Keywords
      { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
      { token: "keyword.control", foreground: "C586C0", fontStyle: "bold" },
      { token: "keyword.operator", foreground: "D4D4D4" },
      
      // Strings
      { token: "string", foreground: "CE9178" },
      { token: "string.quoted", foreground: "CE9178" },
      { token: "string.template", foreground: "CE9178" },
      
      // Numbers
      { token: "number", foreground: "B5CEA8" },
      { token: "number.hex", foreground: "B5CEA8" },
      { token: "number.float", foreground: "B5CEA8" },
      
      // Functions
      { token: "entity.name.function", foreground: "DCDCAA" },
      { token: "support.function", foreground: "DCDCAA" },
      
      // Variables
      { token: "variable", foreground: "9CDCFE" },
      { token: "variable.parameter", foreground: "9CDCFE" },
      { token: "variable.other", foreground: "9CDCFE" },
      
      // Types
      { token: "entity.name.type", foreground: "4EC9B0" },
      { token: "support.type", foreground: "4EC9B0" },
      { token: "storage.type", foreground: "569CD6" },
      
      // Classes
      { token: "entity.name.class", foreground: "4EC9B0" },
      { token: "support.class", foreground: "4EC9B0" },
      
      // Constants
      { token: "constant", foreground: "4FC1FF" },
      { token: "constant.language", foreground: "569CD6" },
      { token: "constant.numeric", foreground: "B5CEA8" },
      
      // Operators
      { token: "keyword.operator", foreground: "D4D4D4" },
      { token: "punctuation", foreground: "D4D4D4" },
      
      // HTML/XML
      { token: "tag", foreground: "569CD6" },
      { token: "tag.id", foreground: "9CDCFE" },
      { token: "tag.class", foreground: "92C5F8" },
      { token: "attribute.name", foreground: "9CDCFE" },
      { token: "attribute.value", foreground: "CE9178" },
      
      // CSS
      { token: "attribute.name.css", foreground: "9CDCFE" },
      { token: "attribute.value.css", foreground: "CE9178" },
      { token: "property-name.css", foreground: "9CDCFE" },
      { token: "property-value.css", foreground: "CE9178" },
      
      // JSON
      { token: "key", foreground: "9CDCFE" },
      { token: "string.key", foreground: "9CDCFE" },
      { token: "string.value", foreground: "CE9178" },
      
      // Error/Warning
      { token: "invalid", foreground: "F44747", fontStyle: "underline" },
      { token: "invalid.deprecated", foreground: "D4D4D4", fontStyle: "strikethrough" },
    ],
    colors: {
      // Editor background
      "editor.background": "#0D1117",
      "editor.foreground": "#E6EDF3",
      
      // Line numbers
      "editorLineNumber.foreground": "#7D8590",
      "editorLineNumber.activeForeground": "#F0F6FC",
      
      // Cursor
      "editorCursor.foreground": "#F0F6FC",
      
      // Selection
      "editor.selectionBackground": "#264F78",
      "editor.selectionHighlightBackground": "#ADD6FF26",
      "editor.inactiveSelectionBackground": "#3A3D41",
      
      // Current line
      "editor.lineHighlightBackground": "#21262D",
      "editor.lineHighlightBorder": "#30363D",
      
      // Gutter
      "editorGutter.background": "#0D1117",
      "editorGutter.modifiedBackground": "#BB800966",
      "editorGutter.addedBackground": "#347D3966",
      "editorGutter.deletedBackground": "#F8514966",
      
      // Scrollbar
      "scrollbar.shadow": "#0008",
      "scrollbarSlider.background": "#6E768166",
      "scrollbarSlider.hoverBackground": "#6E768188",
      "scrollbarSlider.activeBackground": "#6E7681BB",
      
      // Minimap
      "minimap.background": "#161B22",
      "minimap.selectionHighlight": "#264F78",
      
      // Find/Replace
      "editor.findMatchBackground": "#9E6A03",
      "editor.findMatchHighlightBackground": "#F2CC6080",
      "editor.findRangeHighlightBackground": "#3FB95040",
      
      // Word highlight
      "editor.wordHighlightBackground": "#575757B8",
      "editor.wordHighlightStrongBackground": "#004972B8",
      
      // Brackets
      "editorBracketMatch.background": "#0064001A",
      "editorBracketMatch.border": "#888888",
      
      // Indentation guides
      "editorIndentGuide.background": "#21262D",
      "editorIndentGuide.activeBackground": "#30363D",
      
      // Ruler
      "editorRuler.foreground": "#21262D",
      
      // Whitespace
      "editorWhitespace.foreground": "#6E7681",
      
      // Error/Warning squiggles
      "editorError.foreground": "#F85149",
      "editorWarning.foreground": "#D29922",
      "editorInfo.foreground": "#75BEFF",
      "editorHint.foreground": "#EEEEEE",
      
      // Suggest widget
      "editorSuggestWidget.background": "#161B22",
      "editorSuggestWidget.border": "#30363D",
      "editorSuggestWidget.foreground": "#E6EDF3",
      "editorSuggestWidget.selectedBackground": "#21262D",
      
      // Hover widget
      "editorHoverWidget.background": "#161B22",
      "editorHoverWidget.border": "#30363D",
      
      // Panel
      "panel.background": "#0D1117",
      "panel.border": "#30363D",
      
      // Activity bar
      "activityBar.background": "#0D1117",
      "activityBar.foreground": "#E6EDF3",
      "activityBar.border": "#30363D",
      
      // Side bar
      "sideBar.background": "#0D1117",
      "sideBar.foreground": "#E6EDF3",
      "sideBar.border": "#30363D",
    },
  });

  monaco.editor.defineTheme("modern-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8A8F98", fontStyle: "italic" },
      { token: "keyword", foreground: "B45309", fontStyle: "bold" },
      { token: "keyword.control", foreground: "B45309", fontStyle: "bold" },
      { token: "string", foreground: "0F766E" },
      { token: "number", foreground: "7C3AED" },
      { token: "entity.name.function", foreground: "9A3412" },
      { token: "support.function", foreground: "9A3412" },
      { token: "variable", foreground: "1D4ED8" },
      { token: "variable.parameter", foreground: "1D4ED8" },
      { token: "entity.name.type", foreground: "7C2D12" },
      { token: "support.type", foreground: "7C2D12" },
      { token: "storage.type", foreground: "C2410C" },
      { token: "constant", foreground: "BE185D" },
      { token: "tag", foreground: "C2410C" },
      { token: "attribute.name", foreground: "1D4ED8" },
      { token: "attribute.value", foreground: "0F766E" },
      { token: "key", foreground: "1D4ED8" },
      { token: "invalid", foreground: "DC2626", fontStyle: "underline" },
    ],
    colors: {
      "editor.background": "#FFF9F2",
      "editor.foreground": "#1F2937",
      "editorLineNumber.foreground": "#9CA3AF",
      "editorLineNumber.activeForeground": "#4B5563",
      "editorCursor.foreground": "#111827",
      "editor.selectionBackground": "#FDE68A80",
      "editor.selectionHighlightBackground": "#FED7AA66",
      "editor.inactiveSelectionBackground": "#E5E7EB",
      "editor.lineHighlightBackground": "#FFF1DE",
      "editor.lineHighlightBorder": "#F6D7B0",
      "editorGutter.background": "#FFF9F2",
      "editorGutter.modifiedBackground": "#F59E0B66",
      "editorGutter.addedBackground": "#10B98166",
      "editorGutter.deletedBackground": "#EF444466",
      "scrollbar.shadow": "#00000014",
      "scrollbarSlider.background": "#C4B5A588",
      "scrollbarSlider.hoverBackground": "#A78B7A99",
      "scrollbarSlider.activeBackground": "#8B6B5A99",
      "minimap.background": "#FFF4E8",
      "minimap.selectionHighlight": "#F59E0B55",
      "editor.findMatchBackground": "#FDBA7480",
      "editor.findMatchHighlightBackground": "#FED7AA80",
      "editor.findRangeHighlightBackground": "#FDE68A55",
      "editor.wordHighlightBackground": "#FBCFE866",
      "editor.wordHighlightStrongBackground": "#F9A8D466",
      "editorBracketMatch.background": "#FFEDD580",
      "editorBracketMatch.border": "#F59E0B",
      "editorIndentGuide.background": "#EADBC8",
      "editorIndentGuide.activeBackground": "#D6BDA2",
      "editorRuler.foreground": "#F3E2CC",
      "editorWhitespace.foreground": "#D6BDA2",
      "editorError.foreground": "#DC2626",
      "editorWarning.foreground": "#D97706",
      "editorInfo.foreground": "#2563EB",
      "editorHint.foreground": "#7C3AED",
      "editorSuggestWidget.background": "#FFF7ED",
      "editorSuggestWidget.border": "#F3E2CC",
      "editorSuggestWidget.foreground": "#1F2937",
      "editorSuggestWidget.selectedBackground": "#FDEBD3",
      "editorHoverWidget.background": "#FFF7ED",
      "editorHoverWidget.border": "#F3E2CC",
      "panel.background": "#FFF9F2",
      "panel.border": "#F3E2CC",
      "activityBar.background": "#FFF9F2",
      "activityBar.foreground": "#1F2937",
      "activityBar.border": "#F3E2CC",
      "sideBar.background": "#FFF7ED",
      "sideBar.foreground": "#1F2937",
      "sideBar.border": "#F3E2CC",
    },
  });
  
  // Configure additional editor settings
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // Set compiler options for better IntelliSense
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });
};

export const getMonacoTheme = (theme?: string) =>
  theme === "light" ? "modern-light" : "modern-dark";

export const defaultEditorOptions = {
  // Font settings
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
  fontLigatures: true,
  fontWeight: "400",
  
  // Layout
  minimap: { 
    enabled: true,
    size: "fill",
    showSlider: "mouseover"
  },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 12, bottom: 16 },
  
  // Line settings
  lineNumbers: "on",
  lineHeight: 22,
  lineNumbersMinChars: 3,
  renderLineHighlight: "all",
  renderWhitespace: "selection",
  
  // Indentation
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: true,
  
  // Word wrapping
  wordWrap: "off",
  wordWrapColumn: 120,
  wrappingIndent: "indent",
  
  // Code folding
  folding: true,
  foldingHighlight: true,
  foldingStrategy: "indentation",
  showFoldingControls: "mouseover",
  
  // Scrolling
  smoothScrolling: true,
  mouseWheelZoom: true,
  fastScrollSensitivity: 5,
  
  // Selection
  multiCursorModifier: "ctrlCmd",
  selectionHighlight: true,
  occurrencesHighlight: true,
  
  // Suggestions
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: "on",
  tabCompletion: "on",
  wordBasedSuggestions: true,
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false
  },
  
  // Formatting
  formatOnPaste: true,
  formatOnType: true,
  
  // Bracket matching
  matchBrackets: "always",
  bracketPairColorization: {
    enabled: true
  },
  
  // Guides
  renderIndentGuides: true,
  highlightActiveIndentGuide: true,
  rulers: [100],
  
  // Performance
  disableLayerHinting: false,
  disableMonospaceOptimizations: false,
  
  // Accessibility
  accessibilitySupport: "auto",
  
  // Cursor
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: true,
  cursorStyle: "line",
  cursorWidth: 2,
  
  // Find
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: "never",
    seedSearchStringFromSelection: "always"
  },
  
  // Hover
  hover: {
    enabled: true,
    delay: 300,
    sticky: true
  },
  
  // Semantic highlighting
  "semanticHighlighting.enabled": true,
  
  // Sticky scroll
  stickyScroll: {
    enabled: true
  }
};
