"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Bot,
  FileText,
  FolderOpen,
  MonitorPlay,
  Save,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
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
      <div className="axis-shell flex min-h-screen w-full">
        <div className="axis-spotlight left-[-8rem] top-24 h-80 w-80 bg-rose-500/20" />
        <div className="axis-spotlight bottom-[-4rem] right-[12%] h-80 w-80 bg-orange-300/20" />

        <TemplateFileTree
          data={templateData}
          onFileSelect={handleFileSelect}
          selectedFile={activeFile}
          title="File Explorer"
          onAddFile={wrappedHandleAddFile}
          onAddFolder={wrappedHandleAddFolder}
          onDeleteFile={wrappedHandleDeleteFile}
          onDeleteFolder={wrappedHandleDeleteFolder}
          onRenameFile={wrappedHandleRenameFile}
          onRenameFolder={wrappedHandleRenameFolder}
        />

        <SidebarInset className="bg-transparent">
          <div className="flex h-screen flex-col p-3 sm:p-4">
            <motion.header
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="axis-panel mb-3 rounded-[1.8rem] px-4 py-4 sm:px-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-3">
                  <SidebarTrigger className="-ml-1 mt-1 rounded-full border border-border/70 bg-background/60" />
                  <Separator orientation="vertical" className="hidden h-8 xl:block" />

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="axis-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        axisStudio playground
                      </span>
                      <span className="axis-chip rounded-full px-3 py-1 text-xs text-muted-foreground">
                        {openFiles.length} open file
                        {openFiles.length === 1 ? "" : "s"}
                      </span>
                      <span className="axis-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
                        <MonitorPlay className="h-3.5 w-3.5" />
                        {isPreviewVisible ? "Preview visible" : "Preview hidden"}
                      </span>
                    </div>

                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {playgroundData?.name || "Code Playground"}
                      </h1>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activeFile
                          ? `Editing ${activeFile.filename}.${activeFile.fileExtension}`
                          : "Select a file to begin editing"}
                        {hasUnsavedChanges
                          ? " - Unsaved changes"
                          : " - All changes synced"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSave()}
                        disabled={!activeFile || !activeFile.hasUnsavedChanges}
                        className="rounded-full border-border/70 bg-background/70"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save (Ctrl+S)</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSaveAll}
                        disabled={!hasUnsavedChanges}
                        className="rounded-full border-border/70 bg-background/70"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save all
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save all open files</TooltipContent>
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
                        className="rounded-full border-border/70 bg-background/70"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                      >
                        {isPreviewVisible ? "Hide" : "Show"} Preview
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={closeAllFiles}>
                        Close All Files
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.header>

            <div className="min-h-0 flex-1">
              {openFiles.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="axis-panel flex h-full flex-col overflow-hidden rounded-[1.8rem]"
                >
                  <div className="border-b border-border/70 bg-background/50">
                    <Tabs
                      value={activeFileId || ""}
                      onValueChange={setActiveFileId}
                    >
                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <TabsList className="h-9 max-w-full overflow-x-auto bg-transparent p-0">
                          {openFiles.map((file) => (
                            <TabsTrigger
                              key={file.id}
                              value={file.id}
                              className="group relative h-9 rounded-full border border-transparent px-3 data-[state=active]:border-border/70 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                <span>
                                  {file.filename}.{file.fileExtension}
                                </span>
                                {file.hasUnsavedChanges && (
                                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                                )}
                                <span
                                  className="ml-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
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

                        {openFiles.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={closeAllFiles}
                            className="rounded-full text-xs"
                          >
                            Close All
                          </Button>
                        )}
                      </div>
                    </Tabs>
                  </div>

                  <div className="min-h-0 flex-1">
                    <ResizablePanelGroup
                      direction="horizontal"
                      className="h-full"
                    >
                      <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
                        <div className="h-full bg-background/45">
                          <PlaygroundEditor
                            activeFile={activeFile}
                            content={activeFile?.content || ""}
                            onContentChange={(value) =>
                              activeFileId &&
                              updateFileContent(activeFileId, value)
                            }
                            suggestion={aiSuggestions.suggestion}
                            suggestionLoading={aiSuggestions.isLoading}
                            suggestionPosition={aiSuggestions.position}
                            onAcceptSuggestion={(editor, monaco) =>
                              aiSuggestions.acceptSuggestion(editor, monaco)
                            }
                            onRejectSuggestion={(editor) =>
                              aiSuggestions.rejectSuggestion(editor)
                            }
                            onTriggerSuggestion={(type, editor) =>
                              aiSuggestions.fetchSuggestion(type, editor)
                            }
                          />
                        </div>
                      </ResizablePanel>

                      {isPreviewVisible && (
                        <>
                          <ResizableHandle className="bg-border/70" />
                          <ResizablePanel defaultSize={50}>
                            <div className="h-full bg-background/35">
                              <WebContainerPreview
                                templateData={templateData}
                                instance={instance}
                                isLoading={containerLoading}
                                error={containerError}
                                serverUrl={serverUrl || ""}
                                forceResetup={false}
                              />
                            </div>
                          </ResizablePanel>
                        </>
                      )}
                    </ResizablePanelGroup>
                  </div>
                </motion.div>
              ) : (
                <div className="axis-panel flex h-full flex-col items-center justify-center gap-4 rounded-[1.8rem] text-center text-muted-foreground">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary">
                    <Bot className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      No files open
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Select a file from the sidebar to start editing
                    </p>
                  </div>
                </div>
              )}
            </div>
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
