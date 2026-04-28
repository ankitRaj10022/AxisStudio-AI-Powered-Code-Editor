import { Button } from "@/components/ui/button"
import { ArrowUpRight, Github } from "lucide-react"
import { axisAssets } from "@/lib/axis-assets";
import Image from "next/image"
import { motion } from "motion/react";

const AddRepo = () => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="axis-panel group flex items-center justify-between gap-5 overflow-hidden rounded-[1.8rem] px-6 py-6"
    >
      <div className="flex flex-row items-start gap-4">
        <Button
          variant={"outline"}
          className="flex items-center justify-center rounded-2xl border-zinc-800/10 bg-zinc-950 text-white transition-colors duration-300 group-hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:group-hover:bg-white"
          size={"icon"}
        >
          <Github size={30} className="transition-transform duration-300 group-hover:rotate-6" />
        </Button>
        <div className="flex max-w-xs flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Connect</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Open a GitHub repository</h1>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">Bring an existing codebase into the same browser workflow. Repository import is next in line.</p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden sm:block">
        <Image
          src={axisAssets.illustrations.repositoryConnect}
          alt="Open GitHub repository"
          width={164}
          height={164}
          className="transition-transform duration-300 group-hover:scale-110"
        />
        <ArrowUpRight className="absolute bottom-2 right-2 h-6 w-6 text-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
    </motion.div>
  )
}

export default AddRepo
