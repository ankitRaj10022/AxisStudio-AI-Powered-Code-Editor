"use client"

import React, { useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { usePlayground } from '@/features/playground/hook/usePlayground';
import { TemplateFileTree } from '@/features/playground/components/playground-expl';
import { useFileExplorer } from '@/features/playground/hook/useFileExplorer';
import { TemplateFile, TemplateFolder } from '@/features/playground/types';
import { Button } from '@/components/ui/button';
import PlaygroundEditor from '@/features/playground/components/playground_editor';
import {
  FileText,
  FolderOpen,
  AlertCircle,
  Save,
  X,
  Settings,
  Bot,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';


const MainPlaygroundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isPreviewVisible, setIsPreviewVisible] = React.useState(true);
  const { playgroundData, templateData, isLoading, error, loadPlayground, saveTemplateData } = usePlayground(id);
  const {
    activeFileId,
    closeAllFiles,
    openFile,
    closeFile,
    editorContent,
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

  useEffect(()=>{
    setPlaygroundId(id);
  }, [id, setPlaygroundId])

  useEffect(()=>{
    if(templateData && !openFiles.length) setTemplateData(templateData)
  }, [templateData, setTemplateData, openFiles.length])

  const activeFile = openFiles.find((file) => file.id === activeFileId);
  const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges);
  const handleFileSelect = (file:TemplateFile)=>{
    console.log("HandlePath", file)
    openFile(file)
  };



  return (
    <TooltipProvider>
      <>
        <TemplateFileTree data={templateData!} onFileSelect={handleFileSelect} selectedFile={activeFile}/>
        <SidebarInset>
          <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />

            <div className='flex flex-1 items-center gap-2'>
              <div className='flex flex-col flex-1'>
                <h1 className='text-sm font-medium'>
                  {playgroundData?.title || "Playground"}
                </h1>
                <p className='text-xs text-muted-foreground'>
                  {openFiles.length} Files(s) open
                  {hasUnsavedChanges && "* unsaved changes"}
                </p>
              </div>
              <div className='flex items-center gap-1'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size={"sm"} variant={"outline"} onClick={() => { }} disabled={!hasUnsavedChanges}>
                      <Save className='size-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Save (Ctrl+S)
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size={"sm"} variant={"outline"} onClick={() => { }} disabled={!hasUnsavedChanges}>
                      <Save className='h-4 w-4' /> All
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Save All (Ctrl+Shift+S)
                  </TooltipContent>
                </Tooltip>

                {/**TODO: toggle ai*/}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size={"sm"} variant={"outline"} onClick={() => { }} disabled={!hasUnsavedChanges}>
                      <Bot className='h-4 w-4' /> ToggleAI
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Toggle AI
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size={"sm"} variant={"outline"}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => { }}
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
          </header>

          <div className='h-[calc(100vh-4rem)]'>
            {
              openFiles.length > 0 ? (
              <div className='h-full flex flex-col'>
                <div className='border-b bg-muted/30'>
                  <Tabs value={activeFileId || ""} onValueChange={setActiveFileId}>
                    <div className='flex items-center justify-start px-4 py-2'>
                      <TabsList className='h-8 bg-transparent p-0'>
                        {openFiles.map((file) =>(
                          <TabsTrigger key={file.id} value={file.id} className='relative h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm group'>
                            <div className='flex items-center gap-2'>
                              <FileText className='size-3'/>
                              <span>
                                {file.filename}.{file.fileExtension}
                              </span>
                              {
                                file.hasUnsavedChanges && (
                                  <span className='h-2 w-2 rounded-full bg-orange-500'/>
                                )
                              }
                              <span className="ml-2 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={(e) => {e.stopPropagation(); closeFile(file.id);}}>
                                <X className="h-3 w-3" />
                              </span>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {
                        openFiles.length>1 && (
                          <Button size='sm' variant={'ghost'} onClick={closeAllFiles} className='h-6 px-2 text-xs'>
                            Close All FIles
                          </Button>
                        )
                      }
                    </div>
                  </Tabs>
                </div>
                <div className='flex-1'>
                  <ResizablePanelGroup direction='horizontal' className='h-full'>
                    <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
                      <PlaygroundEditor
                        activeFile={activeFile}
                        content={activeFile?.content || ""}
                        onContentChange={(value)=> activeFileId && updateFileContent(activeFileId, value)}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </div>
              ):(
                 <div className='flex flex-col h-full items-center justify-center text-muted-foreground gap-4'>
                  <FileText className='size-16 text-gray-300' />
                  <div className='text-center'>
                    <p className='text-lg font-medium'>No Files Open</p>
                    <p className='text-sm text-gray-500'>Select a file from the sidebar to start editing.</p>
                  </div>
                 </div>
              )
            }
          </div>
        </SidebarInset>
      </>
    </TooltipProvider>
  )
}

export default MainPlaygroundPage
