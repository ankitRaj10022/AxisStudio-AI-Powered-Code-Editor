"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FolderKanban, Sparkles, Star, TimerReset } from "lucide-react";
import { axisAssets } from "@/lib/axis-assets";
import AddNewButton from "@/features/dashboard/components/add-new-btn";
import AddRepo from "@/features/dashboard/components/add-repo";
import ProjectTable from "@/features/dashboard/components/project-table";
import type { Project } from "@/features/dashboard/types";

gsap.registerPlugin(useGSAP);

interface DashboardExperienceProps {
  projects: Project[];
  onDeleteProject: (id: string) => Promise<void>;
  onUpdateProject: (
    id: string,
    data: { title: string; description: string },
  ) => Promise<unknown>;
  onDuplicateProject: (id: string) => Promise<unknown>;
}

const statsConfig = [
  { key: "projects", label: "Playgrounds", icon: FolderKanban },
  { key: "starred", label: "Starred", icon: Star },
  { key: "recent", label: "Updated this week", icon: TimerReset },
] as const;

export default function DashboardExperience({
  projects,
  onDeleteProject,
  onUpdateProject,
  onDuplicateProject,
}: DashboardExperienceProps) {
  const scope = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const now = Date.now();
    const recent = projects.filter((project) => {
      const updatedAt = new Date(project.updatedAt).getTime();
      return now - updatedAt < 1000 * 60 * 60 * 24 * 7;
    }).length;

    return {
      projects: projects.length,
      starred: projects.filter((project) => project.Starmark?.[0]?.isMarked).length,
      recent,
    };
  }, [projects]);

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from("[data-dash-copy]", { opacity: 0, y: 28, duration: 0.7, stagger: 0.1 })
        .from("[data-dash-stat]", { opacity: 0, y: 24, duration: 0.55, stagger: 0.08 }, "-=0.35")
        .from("[data-dash-card]", { opacity: 0, y: 34, duration: 0.8, stagger: 0.12 }, "-=0.3");
    },
    { scope },
  );

  return (
    <div ref={scope} className="axis-shell px-4 py-8 sm:px-6">
      <div className="axis-spotlight right-[-6rem] top-0 h-72 w-72 bg-amber-300/25" />
      <div className="axis-spotlight left-[-8rem] top-40 h-72 w-72 bg-rose-500/20" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="axis-panel rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-5">
              <div
                data-dash-copy
                className="axis-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Dashboard
              </div>
              <div className="space-y-3">
                <h1
                  data-dash-copy
                  className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl"
                >
                  Keep every playground visible, editable, and ready to launch.
                </h1>
                <p
                  data-dash-copy
                  className="max-w-2xl text-base leading-8 text-muted-foreground"
                >
                  This is the command center for templates, starred projects, and everything you want to reopen quickly.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {statsConfig.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.key}
                    data-dash-stat
                    whileHover={{ y: -6 }}
                    className="rounded-[1.6rem] border border-border/70 bg-background/60 p-5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground">
                      {stats[item.key]}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <div data-dash-card>
            <AddNewButton />
          </div>
          <div data-dash-card>
            <AddRepo />
          </div>
        </div>

        {projects.length === 0 ? (
          <motion.div
            data-dash-card
            whileHover={{ y: -6 }}
            className="axis-panel flex flex-col items-center justify-center rounded-[2rem] px-6 py-14 text-center"
          >
            <Image
              src={axisAssets.illustrations.emptyDashboard}
              alt="No projects"
              width={200}
              height={200}
              className="mb-6 h-44 w-44"
            />
            <h2 className="text-2xl font-semibold text-foreground">
              No playgrounds yet
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
              Start with a template and axisStudio will bring the editor, runtime preview, and AI tools together in one workspace.
            </p>
          </motion.div>
        ) : (
          <div data-dash-card>
            <ProjectTable
              projects={projects}
              onDeleteProject={onDeleteProject}
              onUpdateProject={onUpdateProject}
              onDuplicateProject={onDuplicateProject}
            />
          </div>
        )}
      </div>
    </div>
  );
}
