"use client";
import TemplateSelectionModal from "@/components/modal/template-selector-modal";
import { Button } from "@/components/ui/button"
import { createPlayground } from "@/features/playground/actions";
import { ArrowRight, Plus } from 'lucide-react'
import { axisAssets } from "@/lib/axis-assets";
import Image from "next/image"
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { toast } from "sonner";

const AddNewButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async(data: {
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
    description?: string;
  }) => {
    const res = await createPlayground(data);
    toast("Playground created successfully");
    console.log("Creating new playground:", data)
    setIsModalOpen(false)
    router.push(`/playground/${res?.id}`)
  }

  return (
    <>
      <motion.div
        onClick={() => setIsModalOpen(true)}
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="axis-panel group flex cursor-pointer items-center justify-between gap-5 overflow-hidden rounded-[1.8rem] px-6 py-6"
      >
        <div className="flex flex-row items-start gap-4">
          <Button
            variant={"outline"}
            className="flex items-center justify-center rounded-2xl border-primary/20 bg-primary/10 text-primary transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/15"
            size={"icon"}
          >
            <Plus size={30} className="transition-transform duration-300 group-hover:rotate-90" />
          </Button>
          <div className="flex max-w-xs flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Create</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Add a new playground</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">Start from a curated template and drop directly into the editor shell.</p>
          </div>
        </div>

        <div className="relative hidden overflow-hidden sm:block">
          <Image
            src={axisAssets.illustrations.newPlayground}
            alt="Create new playground"
            width={164}
            height={164}
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <ArrowRight className="absolute bottom-2 right-2 h-6 w-6 text-primary transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </motion.div>
      
      <TemplateSelectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default AddNewButton
