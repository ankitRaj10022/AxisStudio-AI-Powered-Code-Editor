import { AxisMotionGraphics } from "@/components/motion/axis-motion-graphics";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="axis-shell min-h-screen">
        <AxisMotionGraphics variant="editor" className="fixed inset-0" />
        <div className="relative z-10 min-h-screen">{children}</div>
      </div>
    </SidebarProvider>
  );
}
