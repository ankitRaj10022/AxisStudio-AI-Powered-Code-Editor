"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCode2,
  FileText,
  FolderOpen,
  GitBranch,
  MonitorPlay,
  Save,
  Settings2,
  Sparkles,
  TerminalSquare,
  Workflow,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TemplateFileTree } from "@/features/playground/components/playground-explorer";
import { PlaygroundEditor } from "@/features/playground/components/playground-editor";
import ToggleAI from "@/features/playground/components/toggle-ai";
import MultiStepLoader from "@/features/playground/components/multi-step-loader";
import { ConfirmationDialog } from "@/features/playground/components/dialogs/conformation-dialog";
import type {
  TemplateFile,
  TemplateFolder,
  TemplateItem,
} from "@/features/playground/libs/path-to-json";
import { useFileExplorer } from "@/features/playground/hooks/useFileExplorer";
import { usePlayground } from "@/features/playground/hooks/usePlayground";
import { useAISuggestions } from "@/features/playground/hooks/useAISuggestion";
import { useWebContainer } from "@/features/webcontainers/hooks/useWebContainer";
import WebContainerPreview from "@/features/webcontainers/components/webcontainer-preveiw";
import { findFilePath } from "@/features/playground/libs";
import { axisAssets } from "@/lib/axis-assets";
import { cn } from "@/lib/utils";

const MainPlaygroundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    onCancel: () => {},
  });
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [compactPane, setCompactPane] = useState<"editor" | "preview">(
    "editor",
  );

  const { playgroundData, templateData, isLoading, error, saveTemplateData } =
    usePlayground(id);
  const aiSuggestions = useAISuggestions();
  const {
    activeFileId,
    closeAllFiles,
    openFile,
    closeFile,
    updateFileContent,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    openFiles,
    setTemplateData,
    setActiveFileId,
    setPlaygroundId,
    setOpenFiles,
  } = useFileExplorer();

  const {
    serverUrl,
    isLoading: containerLoading,
    error: containerError,
    instance,
    writeFileSync,
  } = useWebContainer({ templateData });

  const lastSyncedContent = useRef<Map<string, string>>(new Map());

  React.useEffect(() => {
    setPlaygroundId(id);
  }, [id, setPlaygroundId]);

  React.useEffect(() => {
    if (templateData && !openFiles.length) {
      setTemplateData(templateData);
    }
  }, [templateData, setTemplateData, openFiles.length]);

  React.useEffect(() => {
    if (!isPreviewVisible && compactPane === "preview") {
      setCompactPane("editor");
    }
  }, [compactPane, isPreviewVisible]);

  const wrappedHandleAddFile = useCallback(
    (newFile: TemplateFile, parentPath: string) => {
      return handleAddFile(
        newFile,
        parentPath,
        writeFileSync!,
        instance,
        saveTemplateData,
      );
    },
    [handleAddFile, writeFileSync, instance, saveTemplateData],
  );

  const wrappedHandleAddFolder = useCallback(
    (newFolder: TemplateFolder, parentPath: string) => {
      return handleAddFolder(newFolder, parentPath, instance, saveTemplateData);
    },
    [handleAddFolder, instance, saveTemplateData],
  );

  const wrappedHandleDeleteFile = useCallback(
    (file: TemplateFile, parentPath: string) => {
      return handleDeleteFile(file, parentPath, saveTemplateData);
    },
    [handleDeleteFile, saveTemplateData],
  );

  const wrappedHandleDeleteFolder = useCallback(
    (folder: TemplateFolder, parentPath: string) => {
      return handleDeleteFolder(folder, parentPath, saveTemplateData);
    },
    [handleDeleteFolder, saveTemplateData],
  );

  const wrappedHandleRenameFile = useCallback(
    (
      file: TemplateFile,
      newFilename: string,
      newExtension: string,
      parentPath: string,
    ) => {
      return handleRenameFile(
        file,
        newFilename,
        newExtension,
        parentPath,
        saveTemplateData,
      );
    },
    [handleRenameFile, saveTemplateData],
  );

  const wrappedHandleRenameFolder = useCallback(
    (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
      return handleRenameFolder(
        folder,
        newFolderName,
        parentPath,
        saveTemplateData,
      );
    },
    [handleRenameFolder, saveTemplateData],
  );

  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges);
  const activeFileLabel = activeFile
    ? `${activeFile.filename}.${activeFile.fileExtension}`
    : "No file selected";
  const workspaceRootName = templateData?.folderName || "workspace";
  const editorLanguageLabel = activeFile?.fileExtension
    ? activeFile.fileExtension.toUpperCase()
    : "TEXT";

  const handleFileSelect = (file: TemplateFile) => {
    openFile(file);
  };

  const handleSave = useCallback(
    async (fileId?: string) => {
      const targetFileId = fileId || activeFileId;
      if (!targetFileId) return;

      const fileToSave = openFiles.find((file) => file.id === targetFileId);
      if (!fileToSave) return;

      const latestTemplateData = useFileExplorer.getState().templateData;
      if (!latestTemplateData) return;

      try {
        const filePath = findFilePath(fileToSave, latestTemplateData);
        if (!filePath) {
          toast.error(
            `Could not find path for file: ${fileToSave.filename}.${fileToSave.fileExtension}`,
          );
          return;
        }

        const updatedTemplateData = JSON.parse(
          JSON.stringify(latestTemplateData),
        );
        const updateTemplateFileContent = (
          items: TemplateItem[],
        ): TemplateItem[] =>
          items.map((item) => {
            if ("folderName" in item) {
              return {
                ...item,
                items: updateTemplateFileContent(item.items),
              };
            }

            if (
              item.filename === fileToSave.filename &&
              item.fileExtension === fileToSave.fileExtension
            ) {
              return { ...item, content: fileToSave.content };
            }

            return item;
          });

        updatedTemplateData.items = updateTemplateFileContent(
          updatedTemplateData.items,
        );

        if (writeFileSync) {
          await writeFileSync(filePath, fileToSave.content);
          lastSyncedContent.current.set(fileToSave.id, fileToSave.content);
          if (instance?.fs) {
            await instance.fs.writeFile(filePath, fileToSave.content);
          }
        }

        await saveTemplateData(updatedTemplateData);
        setTemplateData(updatedTemplateData);

        const updatedOpenFiles = openFiles.map((file) =>
          file.id === targetFileId
            ? {
                ...file,
                content: fileToSave.content,
                originalContent: fileToSave.content,
                hasUnsavedChanges: false,
              }
            : file,
        );
        setOpenFiles(updatedOpenFiles);

        toast.success(
          `Saved ${fileToSave.filename}.${fileToSave.fileExtension}`,
        );
      } catch (saveError) {
        console.error("Error saving file:", saveError);
        toast.error(
          `Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`,
        );
        throw saveError;
      }
    },
    [
      activeFileId,
      openFiles,
      writeFileSync,
      instance,
      saveTemplateData,
      setTemplateData,
      setOpenFiles,
    ],
  );

  const handleSaveAll = async () => {
    const unsavedFiles = openFiles.filter((file) => file.hasUnsavedChanges);

    if (unsavedFiles.length === 0) {
      toast.info("No unsaved changes");
      return;
    }

    try {
      await Promise.all(unsavedFiles.map((file) => handleSave(file.id)));
      toast.success(`Saved ${unsavedFiles.length} file(s)`);
    } catch {
      toast.error("Failed to save some files");
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const editorWorkspace = (
    <div className="h-full bg-[#0f1117]">
      {activeFile ? (
        <PlaygroundEditor
          activeFile={activeFile}
          content={activeFile.content || ""}
          onContentChange={(value) =>
            activeFileId && updateFileContent(activeFileId, value)
          }
          suggestion={aiSuggestions.suggestion}
          suggestionLoading={aiSuggestions.isLoading}
          suggestionPosition={aiSuggestions.position}
          onAcceptSuggestion={(editor, monaco) =>
            aiSuggestions.acceptSuggestion(editor, monaco)
          }
          onRejectSuggestion={(editor) => aiSuggestions.rejectSuggestion(editor)}
          onTriggerSuggestion={(type, editor) =>
            aiSuggestions.fetchSuggestion(type, editor)
          }
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-[#0f1117] p-6 sm:p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-orange-200">
              <Bot className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-100">
              Open a file to start editing
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Use the explorer to open source files, trigger AI suggestions,
              and keep the preview runtime visible while you work.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const previewWorkspace = (
    <div className="h-full bg-[#0d1016] p-2 sm:p-2.5">
      <WebContainerPreview
        templateData={templateData!}
        instance={instance}
        isLoading={containerLoading}
        error={containerError}
        serverUrl={serverUrl || ""}
        forceResetup={false}
      />
    </div>
  );

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="axis-panel flex max-w-lg flex-col items-center rounded-[2rem] px-6 py-10 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-semibold text-foreground">
            Playground failed to load
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {error}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="destructive"
            className="mt-6 rounded-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <MultiStepLoader
          currentStep={2}
          steps={[
            "Loading playground metadata",
            "Restoring template files",
            "Preparing the editor shell",
          ]}
          title="Opening axisStudio playground"
          description="Rehydrating your workspace, reopening files, and preparing the live preview runtime."
        />
      </div>
    );
  }

  if (!templateData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="axis-panel flex max-w-lg flex-col items-center rounded-[2rem] px-6 py-10 text-center">
          <FolderOpen className="mb-4 h-12 w-12 text-amber-500" />
          <h2 className="text-2xl font-semibold text-foreground">
            No template data available
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The project exists, but its template payload could not be restored
            into the editor.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-6 rounded-full"
          >
            Reload Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="axis-shell flex h-full min-h-0 w-full overflow-hidden text-zinc-200">
        <div className="axis-spotlight left-[-8rem] top-24 h-80 w-80 bg-rose-500/12" />
        <div className="axis-spotlight bottom-[-4rem] right-[12%] h-80 w-80 bg-orange-300/12" />

        <TemplateFileTree
          data={templateData}
          onFileSelect={handleFileSelect}
          selectedFile={activeFile}
          title="Explorer"
          onAddFile={wrappedHandleAddFile}
          onAddFolder={wrappedHandleAddFolder}
          onDeleteFile={wrappedHandleDeleteFile}
          onDeleteFolder={wrappedHandleDeleteFolder}
          onRenameFile={wrappedHandleRenameFile}
          onRenameFolder={wrappedHandleRenameFolder}
        />

        <SidebarInset className="min-h-0 overflow-hidden bg-transparent">
          <div className="flex h-full min-h-0 flex-col gap-2 p-2 sm:p-3">
            <motion.header
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[1rem] border border-white/8 bg-[#171a21]/95 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur"
            >
              <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-white/8 px-3 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md border-white/8 bg-white/5 px-2 text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    <Link href="/dashboard">
                      <ArrowLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                  </Button>
                  <SidebarTrigger className="h-8 w-8 rounded-md border border-white/8 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white" />
                  <Separator
                    orientation="vertical"
                    className="hidden h-5 bg-white/8 sm:block"
                  />
                  <div className="flex min-w-0 items-center gap-2 text-sm">
                    <Image
                      src={axisAssets.brand.titleWordmark}
                      alt="axisStudio"
                      width={168}
                      height={44}
                      className="h-auto w-28 shrink-0 sm:w-32"
                    />
                    <span className="hidden text-zinc-600 sm:inline">/</span>
                    <span className="hidden rounded-md border border-white/8 bg-white/5 px-2 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400 sm:inline-flex">
                      {playgroundData?.name || "playground"}
                    </span>
                    <span className="text-zinc-600">/</span>
                    <span className="truncate rounded-md border border-emerald-400/15 bg-emerald-400/8 px-2 py-1 text-sm text-zinc-200">
                      {activeFile ? activeFileLabel : "No file selected"}
                    </span>
                  </div>
                </div>

                <div className="ml-auto flex flex-wrap items-center justify-end gap-2 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-white/5 px-2 py-1">
                    <GitBranch className="h-3.5 w-3.5" />
                    main
                  </span>
                  <span className="hidden rounded-md border border-white/8 bg-white/5 px-2 py-1 sm:inline-flex">
                    {workspaceRootName}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-3 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200">
                      <Sparkles className="h-3.5 w-3.5" />
                      Playground session
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                      <Workflow className="h-3.5 w-3.5" />
                      {openFiles.length} tab{openFiles.length === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                      <MonitorPlay className="h-3.5 w-3.5" />
                      {isPreviewVisible ? "Preview visible" : "Preview hidden"}
                    </span>
                  </div>

                  <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
                    {playgroundData?.name || "Code Playground"}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-400">
                    {activeFile
                      ? `Editing ${activeFileLabel}`
                      : "Open a file from the explorer to start editing."}
                    {hasUnsavedChanges
                      ? " Unsaved changes pending."
                      : " Workspace changes are synced."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSave()}
                        disabled={!activeFile || !activeFile.hasUnsavedChanges}
                        className="rounded-md border-white/8 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save active file</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSaveAll}
                        disabled={!hasUnsavedChanges}
                        className="rounded-md border-white/8 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save all
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save every open file</TooltipContent>
                  </Tooltip>

                  <ToggleAI
                    isEnabled={aiSuggestions.isEnabled}
                    onToggle={aiSuggestions.toggleEnabled}
                    suggestionLoading={aiSuggestions.isLoading}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-md border-white/8 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-white/8 bg-[#171a21] text-zinc-200"
                    >
                      <DropdownMenuItem
                        onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                      >
                        {isPreviewVisible ? (
                          <EyeOff className="mr-2 h-4 w-4" />
                        ) : (
                          <Eye className="mr-2 h-4 w-4" />
                        )}
                        {isPreviewVisible ? "Hide" : "Show"} Preview
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={closeAllFiles}>
                        Close All Files
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isPreviewVisible ? (
                  <div className="flex w-full items-center gap-2 md:hidden">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCompactPane("editor")}
                      className={cn(
                        "flex-1 rounded-md border border-white/8 text-xs uppercase tracking-[0.16em]",
                        compactPane === "editor"
                          ? "bg-white/10 text-zinc-100 hover:bg-white/12"
                          : "bg-white/5 text-zinc-500 hover:bg-white/8 hover:text-zinc-200",
                      )}
                    >
                      Editor
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCompactPane("preview")}
                      className={cn(
                        "flex-1 rounded-md border border-white/8 text-xs uppercase tracking-[0.16em]",
                        compactPane === "preview"
                          ? "bg-white/10 text-zinc-100 hover:bg-white/12"
                          : "bg-white/5 text-zinc-500 hover:bg-white/8 hover:text-zinc-200",
                      )}
                    >
                      Runtime
                    </Button>
                  </div>
                ) : null}
              </div>
            </motion.header>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-0 flex-1 overflow-hidden rounded-[1rem] border border-white/8 bg-[#111318]/96 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur"
            >
              <Tabs value={activeFileId || ""} onValueChange={setActiveFileId}>
                <div className="flex h-10 items-center justify-between border-b border-white/8 bg-[#141820]">
                  <TabsList className="h-full max-w-full gap-0 overflow-x-auto rounded-none bg-transparent p-0 whitespace-nowrap">
                    {openFiles.map((file) => (
                      <TabsTrigger
                        key={file.id}
                        value={file.id}
                        className="group relative h-10 shrink-0 rounded-none border-r border-white/8 px-4 text-xs font-medium text-zinc-400 data-[state=active]:bg-[#1a1f29] data-[state=active]:text-zinc-100 data-[state=active]:shadow-none"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode2 className="h-3.5 w-3.5" />
                          <span>{file.filename}.{file.fileExtension}</span>
                          {file.hasUnsavedChanges ? (
                            <span className="h-2 w-2 rounded-full bg-orange-400" />
                          ) : null}
                          <span
                            className="ml-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10"
                            onClick={(event) => {
                              event.stopPropagation();
                              closeFile(file.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="flex items-center gap-2 px-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    <span className="hidden sm:inline">{workspaceRootName}</span>
                    {openFiles.length > 1 ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={closeAllFiles}
                        className="h-7 rounded-md px-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500 hover:bg-white/8 hover:text-zinc-100"
                      >
                        Close all
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Tabs>

              <div className="min-h-0 flex h-[calc(100%-40px)] flex-col">
                <div className="flex h-10 items-center justify-between border-b border-white/8 bg-[#11151d] px-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                    <span className="truncate text-zinc-200">{activeFileLabel}</span>
                    {activeFile ? (
                      <span className="hidden rounded-md border border-white/8 bg-white/5 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-zinc-500 sm:inline-flex">
                        {editorLanguageLabel}
                      </span>
                    ) : null}
                    {hasUnsavedChanges ? (
                      <span className="hidden items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-orange-300 sm:inline-flex">
                        <span className="h-2 w-2 rounded-full bg-orange-400" />
                        Dirty
                      </span>
                    ) : (
                      <span className="hidden items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-emerald-300 sm:inline-flex">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Synced
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    <span className="hidden sm:inline">Ctrl+S save</span>
                    <ThemeToggle
                      showLabel
                      className="h-7 border-white/8 bg-white/5 px-2 text-[11px] text-zinc-400 hover:bg-white/8 hover:text-zinc-100"
                    />
                    <span className="inline-flex items-center gap-1">
                      <TerminalSquare className="h-3.5 w-3.5" />
                      {aiSuggestions.isEnabled ? "AI on" : "AI off"}
                    </span>
                  </div>
                </div>

                <div className="min-h-0 flex-1">
                  <div className="hidden h-full lg:flex">
                    <div
                      className={cn(
                        "min-h-0 min-w-0",
                        isPreviewVisible ? "flex-[1.78]" : "flex-1",
                      )}
                    >
                        {editorWorkspace}
                    </div>

                    {isPreviewVisible ? (
                      <>
                        <div className="w-px bg-white/8" />
                        <div className="min-h-0 min-w-[24rem] flex-1">
                          {previewWorkspace}
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="hidden h-full md:flex lg:hidden flex-col">
                    <div
                      className={cn(
                        "min-h-0",
                        isPreviewVisible ? "flex-[1.35]" : "flex-1",
                      )}
                    >
                      {editorWorkspace}
                    </div>
                    {isPreviewVisible ? (
                      <>
                        <div className="h-px bg-white/8" />
                        <div className="min-h-0 flex-1">
                          {previewWorkspace}
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="flex h-full flex-col md:hidden">
                    <div className="min-h-0 flex-1">
                      {isPreviewVisible && compactPane === "preview"
                        ? previewWorkspace
                        : editorWorkspace}
                    </div>
                  </div>
                </div>

                <div className="flex min-h-8 flex-wrap items-center justify-between gap-2 border-t border-white/8 bg-[#0c0f15] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1">
                      <GitBranch className="h-3.5 w-3.5" />
                      main
                    </span>
                    <span>{hasUnsavedChanges ? "Unsaved changes" : "Saved"}</span>
                    <span className="hidden sm:inline">
                      {aiSuggestions.isEnabled
                        ? "AI assist enabled"
                        : "AI assist paused"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>{editorLanguageLabel}</span>
                    <span>
                      {isPreviewVisible ? "Preview docked" : "Preview closed"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </SidebarInset>

        <ConfirmationDialog
          isOpen={confirmationDialog.isOpen}
          title={confirmationDialog.title}
          description={confirmationDialog.description}
          onConfirm={confirmationDialog.onConfirm}
          onCancel={confirmationDialog.onCancel}
          setIsOpen={(open) =>
            setConfirmationDialog((prev) => ({ ...prev, isOpen: open }))
          }
        />
      </div>
    </TooltipProvider>
  );
};

export default MainPlaygroundPage;
