"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Layers3,
  Orbit,
  Play,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const metrics = [
  {
    label: "Parallel previews",
    value: "12",
    detail: "Live environments aligned with active branches.",
    icon: Play,
  },
  {
    label: "AI drafting time",
    value: "1.8x",
    detail: "Faster iteration from prompt to reviewed code.",
    icon: Bot,
  },
  {
    label: "Workspace uptime",
    value: "99.9%",
    detail: "Stable sessions with save and preview loops intact.",
    icon: CheckCircle2,
  },
];

const workflow = [
  {
    title: "Shape the repo visually",
    copy: "Map files, preview routes, and open the right execution path before you touch the code.",
  },
  {
    title: "Animate the build loop",
    copy: "Move from prompt to editor to preview with tooling that stays in the same spatial system.",
  },
  {
    title: "Ship with less context loss",
    copy: "Keep assets, code, runtime output, and AI feedback inside one workspace instead of tab-hopping.",
  },
];

const features = [
  {
    title: "Studio-grade editor shell",
    copy: "Monaco, file explorer, preview, and save flows wrapped in a visual language that feels deliberate.",
    icon: Layers3,
  },
  {
    title: "AI that stays in context",
    copy: "Generate inline suggestions, open conversational assistance, and keep the current file in view.",
    icon: WandSparkles,
  },
  {
    title: "Browser runtime loop",
    copy: "Mount files, install dependencies, and boot previews directly in the workspace.",
    icon: Orbit,
  },
];

export function HomeExperience() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTimeline
        .from("[data-hero-kicker]", { y: 18, opacity: 0, duration: 0.65 })
        .from(
          "[data-hero-line]",
          { y: 48, opacity: 0, duration: 0.9, stagger: 0.1 },
          "-=0.25",
        )
        .from(
          "[data-hero-copy]",
          { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 },
          "-=0.35",
        )
        .from(
          "[data-hero-card]",
          { y: 36, opacity: 0, rotate: 2, duration: 0.8, stagger: 0.12 },
          "-=0.3",
        );

      gsap.to("[data-orbit-card]", {
        y: -14,
        repeat: -1,
        yoyo: true,
        duration: 2.8,
        ease: "sine.inOut",
        stagger: 0.16,
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-section]").forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 56,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
          },
        });
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className="axis-shell px-4 pb-20 pt-10 sm:px-6">
      <div className="axis-spotlight left-[-10rem] top-10 h-96 w-96 bg-rose-500/30" />
      <div className="axis-spotlight right-[-8rem] top-40 h-[28rem] w-[28rem] bg-amber-300/25" />

      <section
        id="overview"
        className="mx-auto flex w-full max-w-7xl flex-col gap-10 pb-16 pt-10 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-4xl">
          <div
            data-hero-kicker
            className="axis-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Aesthetic browser development
          </div>
          <div className="mt-6 space-y-4">
            <h1 data-hero-line className="max-w-5xl text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-[6.8rem]">
              Shape, edit, and preview products in a studio-grade browser IDE.
            </h1>
            <p
              data-hero-copy
              className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg"
            >
              axisStudio gives the editor, preview runtime, and AI feedback loop a single visual language so shipping work feels faster and more intentional.
            </p>
          </div>
        </div>

        <div data-hero-copy className="flex flex-col items-start gap-4">
          <Button asChild className="h-12 rounded-full bg-primary px-6 text-primary-foreground shadow-[0_18px_40px_rgba(239,68,68,0.28)] hover:bg-primary/90">
            <Link href="/auth/sign-in">
              Enter axisStudio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full border-border/80 bg-background/70 px-6"
          >
            <Link href="/dashboard">
              Open dashboard
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <motion.div
          data-hero-card
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="axis-panel axis-grid relative overflow-hidden rounded-[2rem] p-6 sm:p-8"
        >
          <div className="axis-spotlight left-[12%] top-[8%] h-48 w-48 bg-rose-500/20" />
          <div className="axis-spotlight bottom-[8%] right-[12%] h-48 w-48 bg-orange-300/20" />

          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="axis-chip rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                axisStudio / active session
              </span>
              <span className="axis-chip rounded-full px-3 py-1 text-xs text-muted-foreground">
                Preview running
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950 p-5 text-zinc-100 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="axis-code text-xs uppercase tracking-[0.28em] text-zinc-500">
                      editor.tsx
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Build with visual rhythm
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="axis-code text-sm text-zinc-400">
                    export const workspaceMood = &#123;
                  </p>
                  <p className="axis-code pl-4 text-sm text-rose-300">
                    cinematic: true,
                  </p>
                  <p className="axis-code pl-4 text-sm text-amber-200">
                    runtime: &quot;webcontainer&quot;,
                  </p>
                  <p className="axis-code pl-4 text-sm text-emerald-300">
                    suggestions: &quot;inline&quot;,
                  </p>
                  <p className="axis-code text-sm text-zinc-400">&#125;</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <motion.div
                      key={metric.label}
                      data-hero-card
                      data-orbit-card
                      whileHover={{ scale: 1.02 }}
                      className="axis-panel rounded-[1.6rem] p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          live
                        </span>
                      </div>
                      <p className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
                        {metric.value}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {metric.detail}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          data-hero-card
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="axis-panel rounded-[2rem] p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Command surface
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
            Design-focused development without losing engineering discipline.
          </h2>
          <div className="mt-8 space-y-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex gap-4 rounded-[1.4rem] border border-border/60 bg-background/50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {feature.copy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section
        id="workflow"
        data-reveal-section
        className="mx-auto mt-24 grid w-full max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]"
      >
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Workflow spine
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Motion, feedback, and runtime all live in one system.
          </h2>
          <p className="max-w-xl text-base leading-8 text-muted-foreground">
            The point is not decoration. The point is reducing friction between understanding a project and changing it.
          </p>
        </div>

        <div className="grid gap-4">
          {workflow.map((item, index) => (
            <motion.div
              key={item.title}
              whileHover={{ x: 6 }}
              className="axis-panel rounded-[1.8rem] p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
                  <span className="axis-code text-sm">{`0${index + 1}`}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.copy}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        id="playground"
        data-reveal-section
        className="mx-auto mt-24 w-full max-w-7xl"
      >
        <div className="axis-panel overflow-hidden rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Playground shell
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-foreground">
                A workspace that can look cinematic and still feel fast.
              </h2>
              <p className="max-w-xl text-base leading-8 text-muted-foreground">
                Rebuilt for a stronger first impression without discarding the real mechanics: file explorer, Monaco editor, AI assistance, and preview runtime.
              </p>
            </div>

            <motion.div
              whileHover={{ y: -6 }}
              className="rounded-[1.8rem] border border-zinc-800 bg-zinc-950 p-5 text-zinc-100 shadow-[0_32px_90px_rgba(15,23,42,0.34)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="axis-code text-xs uppercase tracking-[0.24em] text-zinc-500">
                    runtime / preview
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">
                    Launch the playground instantly
                  </h3>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Ready
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  "Template boot",
                  "Dependency install",
                  "Hot preview",
                ].map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                    <p className="axis-code text-xs uppercase tracking-[0.2em] text-zinc-500">
                      step
                    </p>
                    <p className="mt-3 text-base font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="enterprise"
        data-reveal-section
        className="mx-auto mt-24 flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Enterprise mood
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            Clean enough for teams, expressive enough for product demos.
          </h2>
        </div>
        <Button asChild className="h-12 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
          <Link href="/dashboard">
            Start in the dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
