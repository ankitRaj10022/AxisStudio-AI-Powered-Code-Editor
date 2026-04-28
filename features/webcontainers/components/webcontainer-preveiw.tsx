"use client";

import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, TerminalSquare, XCircle } from "lucide-react";
import { WebContainer } from "@webcontainer/api";
import type { TemplateFolder } from "@/features/playground/libs/path-to-json";
import { transformToWebContainerFormat } from "../hooks/transformer";
import TerminalComponent, { type TerminalRef } from "./terminal";
import MultiStepLoader from "@/features/playground/components/multi-step-loader";

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
  serverUrl: string;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  forceResetup?: boolean;
}

const previewSteps = [
  "Transforming template data",
  "Mounting files",
  "Installing dependencies",
  "Starting development server",
];

const WebContainerPreview: React.FC<WebContainerPreviewProps> = ({
  templateData,
  error,
  instance,
  isLoading,
  serverUrl,
  forceResetup = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);
  const terminalRef = useRef<TerminalRef | null>(null);

  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupInProgress(false);
      setPreviewUrl("");
      setCurrentStep(0);
    }
  }, [forceResetup]);

  useEffect(() => {
    async function setupContainer() {
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);

        try {
          const packageJsonExists = await instance.fs.readFile(
            "package.json",
            "utf8",
          );

          if (packageJsonExists) {
            terminalRef.current?.writeToTerminal?.(
              "[info] reconnecting to active WebContainer session...\r\n",
            );

            instance.on("server-ready", (port: number, url: string) => {
              console.log(`Reconnected to server on port ${port} at ${url}`);
              terminalRef.current?.writeToTerminal?.(
                `[ready] preview reconnected at ${url}\r\n`,
              );
              setPreviewUrl(url);
              setIsSetupComplete(true);
              setIsSetupInProgress(false);
            });

            setCurrentStep(4);
            return;
          }
        } catch {
          // Continue with a fresh setup if the mounted files are not present yet.
        }

        setCurrentStep(1);
        terminalRef.current?.writeToTerminal?.(
          "[info] transforming template data...\r\n",
        );

        // @ts-ignore
        const files = transformToWebContainerFormat(templateData);

        setCurrentStep(2);
        terminalRef.current?.writeToTerminal?.(
          "[info] mounting files to WebContainer...\r\n",
        );
        await instance.mount(files);
        terminalRef.current?.writeToTerminal?.(
          "[done] files mounted successfully\r\n",
        );

        setCurrentStep(3);
        terminalRef.current?.writeToTerminal?.(
          "[info] installing dependencies...\r\n",
        );
        const installProcess = await instance.spawn("npm", ["install"]);

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              terminalRef.current?.writeToTerminal?.(data);
            },
          }),
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error(
            `Failed to install dependencies. Exit code: ${installExitCode}`,
          );
        }

        terminalRef.current?.writeToTerminal?.(
          "[done] dependencies installed successfully\r\n",
        );

        setCurrentStep(4);
        terminalRef.current?.writeToTerminal?.(
          "[info] starting development server...\r\n",
        );
        const startProcess = await instance.spawn("npm", ["run", "start"]);

        instance.on("server-ready", (port: number, url: string) => {
          console.log(`Server ready on port ${port} at ${url}`);
          terminalRef.current?.writeToTerminal?.(
            `[ready] preview available at ${url}\r\n`,
          );
          setPreviewUrl(url);
          setIsSetupComplete(true);
          setIsSetupInProgress(false);
        });

        startProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              terminalRef.current?.writeToTerminal?.(data);
            },
          }),
        );
      } catch (setupFailure) {
        console.error("Error setting up container:", setupFailure);
        const errorMessage =
          setupFailure instanceof Error
            ? setupFailure.message
            : String(setupFailure);

        terminalRef.current?.writeToTerminal?.(
          `[error] ${errorMessage}\r\n`,
        );

        setSetupError(errorMessage);
        setIsSetupInProgress(false);
      }
    }

    setupContainer();
  }, [instance, templateData, isSetupComplete, isSetupInProgress]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="axis-panel max-w-md rounded-[1.8rem] p-6 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            Initializing WebContainer
          </h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Setting up the environment for your project runtime.
          </p>
        </div>
      </div>
    );
  }

  if (error || setupError) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="axis-panel max-w-md rounded-[1.8rem] p-6 text-red-600 dark:text-red-300">
          <div className="mb-3 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <h3 className="font-semibold">Runtime Error</h3>
          </div>
          <p className="text-sm leading-7">{error || setupError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 p-3">
      {!previewUrl ? (
        <>
          <div className="axis-panel rounded-[1.6rem]">
            <MultiStepLoader
              currentStep={Math.max(currentStep, 1)}
              steps={previewSteps}
              title="Booting preview runtime"
              description="Mounting the project into WebContainer and waiting for the live preview to become available."
            />
          </div>

          <div className="axis-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.6rem]">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Live terminal
                </p>
                <p className="text-xs text-muted-foreground">
                  Install and boot logs stream here while the preview starts.
                </p>
              </div>
              <span className="axis-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
                <TerminalSquare className="h-3.5 w-3.5" />
                boot sequence
              </span>
            </div>
            <div className="min-h-0 flex-1 p-3">
              <TerminalComponent
                ref={terminalRef}
                webContainerInstance={instance}
                theme="dark"
                className="h-full"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="axis-panel flex items-center justify-between rounded-[1.4rem] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Preview ready
              </p>
              <p className="axis-code text-xs text-muted-foreground">
                {serverUrl || previewUrl}
              </p>
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="axis-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Open in new tab
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="axis-panel min-h-0 flex-1 overflow-hidden rounded-[1.6rem] p-2">
            <iframe
              src={previewUrl}
              className="h-full w-full rounded-[1.15rem] border-none bg-white"
              title="WebContainer Preview"
            />
          </div>

          <div className="axis-panel h-64 overflow-hidden rounded-[1.6rem]">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Runtime terminal
                </p>
                <p className="text-xs text-muted-foreground">
                  The live preview stays above while the shell remains
                  available below.
                </p>
              </div>
            </div>
            <div className="h-[calc(100%-65px)] p-3">
              <TerminalComponent
                ref={terminalRef}
                webContainerInstance={instance}
                theme="dark"
                className="h-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WebContainerPreview;
