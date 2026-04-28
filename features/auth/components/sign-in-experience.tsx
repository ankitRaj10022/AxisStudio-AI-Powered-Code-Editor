"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, Bot, Orbit, ShieldCheck, WandSparkles } from "lucide-react";
import { axisAssets } from "@/lib/axis-assets";

gsap.registerPlugin(useGSAP);

interface SignInExperienceProps {
  children: ReactNode;
}

export default function SignInExperience({ children }: SignInExperienceProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from("[data-auth-copy]", { opacity: 0, y: 36, duration: 0.8, stagger: 0.12 })
        .from("[data-auth-panel]", { opacity: 0, x: 40, duration: 0.8 }, "-=0.45");

      gsap.to("[data-auth-float]", {
        y: -12,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.16,
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <div className="space-y-8">
        <Link
          href="/"
          data-auth-copy
          className="axis-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="space-y-5">
          <p
            data-auth-copy
            className="text-xs font-semibold uppercase tracking-[0.28em] text-primary"
          >
            Access axisStudio
          </p>
          <h1
            data-auth-copy
            className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-foreground sm:text-6xl"
          >
            A browser workspace that looks considered before you write the first line.
          </h1>
          <p
            data-auth-copy
            className="max-w-2xl text-base leading-8 text-muted-foreground"
          >
            Sign in to open the dashboard, launch a template, and move from idea to live preview inside the same visual system.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Inline AI", icon: Bot },
            { label: "Runtime preview", icon: Orbit },
            { label: "Secure auth", icon: ShieldCheck },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                data-auth-copy
                data-auth-float
                whileHover={{ y: -6 }}
                className="axis-panel rounded-[1.6rem] p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-sm font-medium text-foreground">{item.label}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          data-auth-copy
          whileHover={{ y: -8 }}
          className="axis-panel relative hidden overflow-hidden rounded-[2rem] p-6 lg:block"
        >
          <div className="axis-spotlight left-[-2rem] top-6 h-40 w-40 bg-rose-400/20" />
          <div className="axis-spotlight bottom-0 right-0 h-48 w-48 bg-amber-300/20" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.3)]">
              <Image src={axisAssets.illustrations.signInStudio} alt="axisStudio login illustration" width={180} height={180} />
            </div>
            <div className="max-w-sm">
              <p className="axis-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                First launch
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-foreground">
                Open a project and keep the entire build loop visible.
              </h2>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <WandSparkles className="h-4 w-4 text-primary" />
                AI suggestions, editor, preview, and file system aligned.
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div data-auth-panel>{children}</div>
    </div>
  );
}
