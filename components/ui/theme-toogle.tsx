"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="cursor-pointer" onClick={() => setTheme(theme ==="dark"?"light":"dark")}>
      {
        theme==="light"?(<Moon className="size-5 text-black"/>):(<Sun className="size-5 text-white"/>)
      }
    </div>
  );
}
