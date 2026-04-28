"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTime, useTransform } from "motion/react";
import { axisAssets } from "@/lib/axis-assets";
import { cn } from "@/lib/utils";

type AxisMotionVariant = "landing" | "auth" | "dashboard" | "editor";

interface AxisMotionGraphicsProps {
  variant?: AxisMotionVariant;
  className?: string;
}

const variantConfig: Record<
  AxisMotionVariant,
  {
    gridOpacity: number;
    meshOpacity: number;
    leftBlobClass: string;
    rightBlobClass: string;
    pulseClass: string;
    svgOpacity: string;
  }
> = {
  landing: {
    gridOpacity: 0.62,
    meshOpacity: 0.58,
    leftBlobClass: "left-[-8rem] top-[8%] h-[28rem] w-[28rem] bg-rose-500/18",
    rightBlobClass: "right-[-10rem] top-[14%] h-[34rem] w-[34rem] bg-amber-300/16",
    pulseClass: "left-[42%] top-[12%] h-48 w-48 bg-orange-300/14",
    svgOpacity: "opacity-65",
  },
  auth: {
    gridOpacity: 0.46,
    meshOpacity: 0.42,
    leftBlobClass: "left-[-6rem] top-[10%] h-80 w-80 bg-rose-500/16",
    rightBlobClass: "right-[-6rem] bottom-[6%] h-96 w-96 bg-orange-300/16",
    pulseClass: "left-[52%] top-[18%] h-40 w-40 bg-amber-300/12",
    svgOpacity: "opacity-55",
  },
  dashboard: {
    gridOpacity: 0.3,
    meshOpacity: 0.26,
    leftBlobClass: "left-[-8rem] top-[22%] h-72 w-72 bg-rose-500/12",
    rightBlobClass: "right-[-8rem] top-[8%] h-80 w-80 bg-amber-300/12",
    pulseClass: "left-[64%] top-[24%] h-36 w-36 bg-orange-300/10",
    svgOpacity: "opacity-45",
  },
  editor: {
    gridOpacity: 0.2,
    meshOpacity: 0.22,
    leftBlobClass: "left-[-10rem] top-[12%] h-72 w-72 bg-rose-500/10",
    rightBlobClass: "right-[-10rem] bottom-[16%] h-96 w-96 bg-orange-300/10",
    pulseClass: "left-[56%] top-[16%] h-40 w-40 bg-amber-300/9",
    svgOpacity: "opacity-35",
  },
};

const signalPoints = [
  { top: "12%", left: "14%", delay: 0 },
  { top: "18%", left: "71%", delay: 0.4 },
  { top: "34%", left: "28%", delay: 0.8 },
  { top: "48%", left: "84%", delay: 1.2 },
  { top: "62%", left: "18%", delay: 1.6 },
  { top: "74%", left: "58%", delay: 2 },
];

export function AxisMotionGraphics({
  variant = "landing",
  className,
}: AxisMotionGraphicsProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = variantConfig[variant];

  const { scrollYProgress } = useScroll();
  const time = useTime();

  const slowParallax = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -120]),
    { stiffness: 40, damping: 18, mass: 0.8 },
  );
  const mediumParallax = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 80]),
    { stiffness: 55, damping: 20, mass: 0.9 },
  );
  const rotateForward = useTransform(time, [0, 24000], [0, 360], {
    clamp: false,
  });
  const rotateBackward = useTransform(time, [0, 18000], [0, -360], {
    clamp: false,
  });

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${axisAssets.backgrounds.studioGrid})`,
          opacity: config.gridOpacity,
          y: shouldReduceMotion ? 0 : slowParallax,
        }}
      />

      <motion.div
        className="absolute inset-0 bg-cover bg-center mix-blend-screen"
        style={{
          backgroundImage: `url(${axisAssets.backgrounds.orbitMesh})`,
          opacity: config.meshOpacity,
          rotate: shouldReduceMotion ? 0 : rotateForward,
          scale: 1.05,
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{ y: shouldReduceMotion ? 0 : mediumParallax }}
      >
        <motion.div
          className={cn("axis-spotlight", config.leftBlobClass)}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [1, 1.08, 0.96, 1],
                  opacity: [0.38, 0.56, 0.28, 0.38],
                }
          }
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={cn("axis-spotlight", config.rightBlobClass)}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [1, 0.95, 1.06, 1],
                  opacity: [0.34, 0.24, 0.4, 0.34],
                }
          }
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className={cn("axis-spotlight", config.pulseClass)}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  scale: [0.86, 1.24, 0.86],
                  opacity: [0.12, 0.28, 0.12],
                }
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <motion.svg
        viewBox="0 0 1440 1024"
        className={cn(
          "absolute inset-0 h-full w-full text-primary/30",
          config.svgOpacity,
        )}
        style={{ rotate: shouldReduceMotion ? 0 : rotateBackward }}
      >
        <motion.path
          d="M184 736C324 646 500 600 720 600C940 600 1112 646 1256 736"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="10 14"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: [0.2, 0.58, 0.2],
                }
          }
          transition={{
            duration: 7.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M286 822C410 752 556 720 720 720C884 720 1034 752 1158 822"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="8 18"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: [0.18, 0.42, 0.18],
                }
          }
          transition={{
            duration: 9.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
        />
      </motion.svg>

      <div className="absolute inset-0">
        {signalPoints.map((point) => (
          <motion.div
            key={`${point.top}-${point.left}`}
            className="absolute h-2.5 w-2.5 rounded-full bg-primary/55 shadow-[0_0_18px_rgba(251,113,133,0.42)]"
            style={{ top: point.top, left: point.left }}
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [0.8, 1.45, 0.8],
                    opacity: [0.35, 0.85, 0.35],
                  }
            }
            transition={{
              duration: 4.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: point.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
