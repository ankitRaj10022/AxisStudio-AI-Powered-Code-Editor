import Link from "next/link";
import { Github as LucideGithub } from "lucide-react";

export function Footer() {
  const socialLinks = [
    {
      href: "#",
      icon: (
        <LucideGithub className="w-5 h-5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" />
      ),
    },
  ];

  return (
    <footer className="px-4 pb-8 pt-16 sm:px-6">
      <div className="axis-panel mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] px-6 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            axisStudio
          </p>
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Build ambitious products in a browser workspace that feels engineered, not generic.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Code, preview, and iterate inside one visual system with AI assistance when you need it.
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 lg:items-end">
          <div className="flex gap-4">
          {socialLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.icon}
            </Link>
          ))}
        </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} axisStudio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
