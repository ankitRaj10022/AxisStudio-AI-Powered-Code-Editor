
import  {Footer}  from "@/features/home/footer";
import  {Header}  from "@/features/home/header";
import { AxisMotionGraphics } from "@/components/motion/axis-motion-graphics";
import type { Metadata } from "next";
// import { usePathname } from "next/navigation";

export const metadata: Metadata = {
    title: {
        template: "axisStudio - Editor ",
        default: "axisStudio - AI code editor",
    },
};

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="axis-shell min-h-screen">
            <AxisMotionGraphics variant="landing" className="fixed inset-0" />
            <Header />
            <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"/>
      
            <main className="z-20 relative w-full pt-0 md:pt-0  ">
          
                {children}
            </main>
            <Footer />
        </div>
    );
}
