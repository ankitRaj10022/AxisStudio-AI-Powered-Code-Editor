"use client"

import { CheckCircle2, Loader2 } from "lucide-react"

interface MultiStepLoaderProps {
  currentStep: number
  steps: string[]
  title?: string
  description?: string
  className?: string
  variant?: "default" | "editor"
}

export default function MultiStepLoader({
  currentStep,
  steps,
  title = "Preparing your workspace",
  description = "Setting up the playground environment before the editor opens.",
  className = "",
  variant = "default",
}: MultiStepLoaderProps) {
  const totalSteps = steps.length
  const clampedStep = Math.min(Math.max(currentStep, 1), totalSteps)
  const progress = totalSteps > 0 ? (clampedStep / totalSteps) * 100 : 0
  const isEditor = variant === "editor"

  return (
    <div className={`flex w-full items-center justify-center p-4 ${className}`}>
      <div
        className={`w-full max-w-xl rounded-3xl border p-8 backdrop-blur ${
          isEditor
            ? "border-white/8 bg-[#0f1117] text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            : "border-zinc-200 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:border-zinc-800 dark:bg-zinc-950/85"
        }`}
      >
        <div className="mb-8">
          <div
            className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
              isEditor
                ? "border-rose-500/25 bg-rose-500/8 text-rose-300"
                : "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/80 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading
          </div>
          <h2
            className={`text-2xl font-semibold tracking-tight ${
              isEditor ? "text-zinc-50" : "text-zinc-950 dark:text-zinc-50"
            }`}
          >
            {title}
          </h2>
          <p
            className={`mt-2 text-sm leading-6 ${
              isEditor ? "text-zinc-400" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {description}
          </p>
        </div>

        <div className="mb-8">
          <div
            className={`mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] ${
              isEditor ? "text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <span>
              Step {clampedStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            className={`h-2 overflow-hidden rounded-full ${
              isEditor ? "bg-white/8" : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((label, index) => {
            const stepNumber = index + 1
            const isComplete = clampedStep > stepNumber
            const isActive = clampedStep === stepNumber

            return (
              <div
                key={`${stepNumber}-${label}`}
                className={`flex items-start gap-4 rounded-2xl border px-4 py-3 transition-colors ${
                  isActive
                    ? isEditor
                      ? "border-rose-500/30 bg-rose-500/10"
                      : "border-rose-200 bg-rose-50/80 dark:border-rose-900/70 dark:bg-rose-950/30"
                    : isComplete
                      ? isEditor
                        ? "border-emerald-500/25 bg-emerald-500/10"
                        : "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/25"
                      : isEditor
                        ? "border-white/8 bg-white/[0.03]"
                        : "border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/60"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                    isActive
                      ? isEditor
                        ? "border-rose-500/30 bg-[#111318] text-rose-300"
                        : "border-rose-200 bg-white text-rose-600 dark:border-rose-800 dark:bg-zinc-950 dark:text-rose-300"
                      : isComplete
                        ? isEditor
                          ? "border-emerald-500/30 bg-[#111318] text-emerald-300"
                          : "border-emerald-200 bg-white text-emerald-600 dark:border-emerald-800 dark:bg-zinc-950 dark:text-emerald-300"
                        : isEditor
                          ? "border-white/10 bg-[#111318] text-zinc-500"
                          : "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-500"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-semibold">{stepNumber}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isActive
                        ? isEditor
                          ? "text-rose-200"
                          : "text-rose-700 dark:text-rose-200"
                        : isComplete
                          ? isEditor
                            ? "text-emerald-200"
                            : "text-emerald-700 dark:text-emerald-200"
                          : isEditor
                            ? "text-zinc-300"
                            : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {label}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      isEditor ? "text-zinc-500" : "text-zinc-500 dark:text-zinc-500"
                    }`}
                  >
                    {isComplete
                      ? "Completed"
                      : isActive
                        ? "In progress"
                        : "Waiting"}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
