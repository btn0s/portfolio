"use client";

import { useTheme } from "@/components/theme/provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, isTransitioning } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mount state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Only determine the icon on the client side after mounting
  // This prevents hydration mismatch
  if (!mounted) {
    // Return a placeholder with the same dimensions during SSR
    return (
      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle theme"
        className="relative overflow-hidden"
      >
        <div className="relative h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  // Now we're on the client, we can safely determine the current theme
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      disabled={isTransitioning}
      className="relative overflow-hidden flex items-center justify-center"
    >
      {isDark ? (
        <Sun className="h-full w-full" />
      ) : (
        <Moon className="h-full w-full" />
      )}
    </Button>
  );
}
