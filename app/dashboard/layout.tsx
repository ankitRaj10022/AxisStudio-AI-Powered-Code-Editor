import { AxisMotionGraphics } from "@/components/motion/axis-motion-graphics";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/features/dashboard/dashboard-sidebar";
import { getAllPlaygroundForUser } from "@/features/playground/actions";
import type React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playgroundData = await getAllPlaygroundForUser();

  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  };

  const formattedPlaygroundData =
    playgroundData?.map((item) => ({
      id: item.id,
      name: item.title,
      starred: item.Starmark?.[0]?.isMarked || false,
      icon: technologyIconMap[item.template] || "Code2",
    })) || [];

  return (
    <SidebarProvider>
      <div className="axis-shell flex min-h-screen w-full overflow-x-hidden">
        <AxisMotionGraphics variant="dashboard" className="fixed inset-0" />
        {/* Pass the formatted data with string icon names */}
        <div className="relative z-10 flex min-h-screen w-full overflow-x-hidden">
          <DashboardSidebar initialPlaygroundData={formattedPlaygroundData} />
          <main className="relative flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
