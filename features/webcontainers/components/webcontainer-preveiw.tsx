"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Globe,
  Loader2,
  SquareTerminal,
  XCircle,
} from "lucide-react";
import { WebContainer } from "@webcontainer/api";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
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

interface RuntimeCommand {
  command: string;
  args: string[];
  label: string;
}

const previewSteps = [
  "Transforming template data",
  "Mounting files",
  "Installing dependencies",
  "Starting development server",
];

function resolveRuntimeCommand(packageJsonSource: string | null): RuntimeCommand | null {
  if (!packageJsonSource) return null;

  try {
    const parsed = JSON.parse(packageJsonSource) as {
      scripts?: Record<string, string>;
    };

    const scripts = parsed.scripts ?? {};
    const preferredScripts = ["dev", "start", "preview", "serve"];
    const scriptName = preferredScripts.find((name) => typeof scripts[name] === "string");

    if (!scriptName) return null;

    return {
      command: "npm",
      args: ["run", scriptName],
      label: `npm run ${scriptName}`,
    };
  } catch {
    return null;
  }
}

const WebContainerPreview: React.FC<WebContainerPreviewProps> = ({
  templateData,
  error,
  instance,
  isLoading,
  serverUrl,
  forceResetup = false,
}) => {
  const isMobile = useIsMobile();
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);
  const [runtimeCommand, setRuntimeCommand] = useState<string>("");
  const terminalRef = useRef<TerminalRef | null>(null);

  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupInProgress(false);
      setPreviewUrl("");
      setCurrentStep(0);
      setRuntimeCommand("");
      setSetupError(null);
    }
  }, [forceResetup]);

  useEffect(() => {
    async function setupContainer() {
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);
        setPreviewUrl("");

        setCurrentStep(1);
        terminalRef.current?.clearTerminal();
        terminalRef.current?.writeToTerminal("[info] transforming template data...\r\n");

        const files = transformToWebContainerFormat(templateData);

        setCurrentStep(2);
        terminalRef.current?.writeToTerminal("[info] mounting files to workspace...\r\n");
        await instance.mount(files);
        terminalRef.current?.writeToTerminal("[done] files mounted successfully\r\n");

        const packageJsonSource = await instance.fs.readFile("package.json", "utf8").catch(
          () => null,
        );
        const nextRuntimeCommand = resolveRuntimeCommand(packageJsonSource);

        if (!nextRuntimeCommand) {
          throw new Error(
            "No runnable package script found. Add one of: dev, start, preview, or serve.",
          );
        }

        setCurrentStep(3);
        terminalRef.current?.writeToTerminal("[info] installing dependencies...\r\n");
        const installProcess = await instance.spawn("npm", ["install"]);

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              terminalRef.current?.writeToTerminal(data);
            },
          }),
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error(
            `Failed to install dependencies. Exit code: ${installExitCode}`,
          );
        }

        terminalRef.current?.writeToTerminal("[done] dependencies installed successfully\r\n");

        setCurrentStep(4);
        setRuntimeCommand(nextRuntimeCommand.label);
        terminalRef.current?.writeToTerminal(
          `[info] booting preview with "${nextRuntimeCommand.label}"...\r\n`,
        );

        const readyPromise = new Promise<string>((resolve) => {
          instance.on("server-ready", (_port: number, url: string) => {
            resolve(url);
          });
        });

        const startProcess = await instance.spawn(
          nextRuntimeCommand.command,
          nextRuntimeCommand.args,
        );

        startProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              terminalRef.current?.writeToTerminal(data);
            },
          }),
        );

        const startupResult = await Promise.race([
          readyPromise.then((url) => ({ type: "ready" as const, url })),
          startProcess.exit.then((code) => ({ type: "exit" as const, code })),
        ]);

        if (startupResult.type === "exit") {
          throw new Error(
            `Preview process exited before a server became available. Exit code: ${startupResult.code}`,
          );
        }

        terminalRef.current?.writeToTerminal(
          `[ready] preview available at ${startupResult.url}\r\n`,
        );
        setPreviewUrl(startupResult.url);
        setIsSetupComplete(true);
        setIsSetupInProgress(false);
      } catch (setupFailure) {
        console.error("Error setting up container:", setupFailure);
        const errorMessage =
          setupFailure instanceof Error
            ? setupFailure.message
            : String(setupFailure);

        terminalRef.current?.writeToTerminal(`[error] ${errorMessage}\r\n`);

        setSetupError(errorMessage);
        setIsSetupInProgress(false);
      }
    }

    setupContainer();
  }, [instance, templateData, isSetupComplete, isSetupInProgress]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center px-6 py-8">
        <div className="flex max-w-sm flex-col items-center gap-3 text-center text-zinc-300">
          <Loader2 className="h-8 w-8 animate-spin text-orange-300" />
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
              Runtime
            </p>
            <h3 className="mt-2 text-xl font-semibold text-zinc-100">
              Initializing WebContainer
            </h3>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              Creating the browser runtime before the preview panel opens.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || setupError) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-[#171114] p-5 text-red-100">
          <div className="mb-3 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-400" />
            <h3 className="font-semibold">Runtime Error</h3>
          </div>
          <p className="text-sm leading-7 text-red-100/85">{error || setupError}</p>
        </div>
      </div>
    );
  }

  const resolvedPreviewUrl = serverUrl || previewUrl;
  const previewPanelContent = (
    <div className="flex h-full flex-col overflow-hidden rounded-[1rem] border border-white/8 bg-[#111318]">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-white/8 bg-[#171a21] px-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
          </div>
          <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/8 bg-[#0f1117] px-3 py-1 text-xs text-zinc-400">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[140px] truncate sm:max-w-[220px]">
              {resolvedPreviewUrl || runtimeCommand || "Waiting for preview"}
            </span>
          </div>
        </div>

        {resolvedPreviewUrl ? (
          <a
            href={resolvedPreviewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            Open
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Booting
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 bg-[#0b0d12]">
        {!resolvedPreviewUrl ? (
          <div className="flex h-full items-center justify-center p-4 sm:p-6">
            <MultiStepLoader
              currentStep={Math.max(currentStep, 1)}
              steps={previewSteps}
              title="Booting preview runtime"
              description="Installing dependencies, choosing the right project script, and waiting for the server to announce itself."
              variant="editor"
            />
          </div>
        ) : (
          <iframe
            src={resolvedPreviewUrl}
            className="h-full w-full border-none bg-white"
            title="WebContainer Preview"
          />
        )}
      </div>
    </div>
  );

  const terminalPanelContent = (
    <div className="flex h-full flex-col overflow-hidden rounded-[1rem] border border-white/8 bg-[#101319]">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-white/8 bg-[#171a21] px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-100">
          <SquareTerminal className="h-4 w-4 text-orange-300" />
          Terminal
        </div>
        <div className="max-w-full truncate text-xs text-zinc-500">
          {runtimeCommand || "boot sequence"}
        </div>
      </div>
      <div className="min-h-0 flex-1 p-2.5">
        <TerminalComponent
          ref={terminalRef}
          webContainerInstance={instance}
          theme="dark"
          className="h-full border-none bg-transparent"
        />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex h-full flex-col gap-2">
        <div className="min-h-0 flex-[1.15]">{previewPanelContent}</div>
        <div className="min-h-0 flex-1">{terminalPanelContent}</div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      <ResizablePanel defaultSize={resolvedPreviewUrl ? 66 : 62} minSize={38}>
        {previewPanelContent}
      </ResizablePanel>

      <ResizableHandle className="bg-white/6" />

      <ResizablePanel defaultSize={34} minSize={22}>
        {terminalPanelContent}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default WebContainerPreview;
