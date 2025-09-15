"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; 

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensures component only renders client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder with the same dimensions to prevent layout shift
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn("h-9 w-9 rounded-full flex items-center justify-center opacity-0", className)}
        aria-hidden="true"
        tabIndex={-1}
      >
        <span className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "h-9 w-9 rounded-full flex items-center justify-center",
        "bg-background/50 dark:bg-background/50 hover:bg-muted dark:hover:bg-muted",
        "transition-all duration-300",
        className
      )}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      <div className="relative w-5 h-5 overflow-hidden flex items-center justify-center">
        <Sun className={cn(
          "h-4 w-4 transition-all duration-300 absolute",
          theme === "dark" ? "opacity-0 rotate-45 scale-0" : "opacity-100 rotate-0 scale-100"
        )} />
        <Moon className={cn(
          "h-4 w-4 transition-all duration-300 absolute",
          theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-45 scale-0"
        )} />
      </div>
    </Button>
  );
}