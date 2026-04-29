"use client";

import { useTheme } from "next-themes";
import { useEffect , useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps){
    const {setTheme , resolvedTheme} = useTheme();
    const [mounted , setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    } , []);

    if(!mounted){
        return null;
    }

    const isDark = resolvedTheme !== "light";

    return (
        <button
        type="button"
        className={cn(
            "inline-flex items-center gap-2 rounded-md border border-white/8 bg-white/5 px-2.5 py-1.5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white",
            className,
        )}
        onClick={()=>{
            setTheme(isDark ? "light" : "dark");
        }}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {
                isDark ? (
                    <Sun className="h-4 w-4 text-amber-200" />
                ) : (
                    <Moon className="h-4 w-4 text-zinc-800" />
                )
            }
            {showLabel ? (
                <span className="text-[11px] font-medium uppercase tracking-[0.18em]">
                    {isDark ? "Dark UI" : "Light UI"}
                </span>
            ) : null}
        </button>
    )
}
