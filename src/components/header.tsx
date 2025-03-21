"use client";

import { Button } from "@/components/ui/button";
import { TRANSITION_HEADER, VARIANTS_HEADER } from "@/lib/variants";
import Link from "next/link";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import RemoveBaseLayout from "@/components/remove-base-layout";
import { ArrowLeftIcon } from "lucide-react";
import { usePathname } from "next/navigation";
const DURATION = 300;
const BLUR_CLASSNAME = "blur-xs";
const SCALE_CLASSNAME = "scale-99";
const THEME_SWITCH_EFFECTS = [BLUR_CLASSNAME, SCALE_CLASSNAME];

export const ExperimentHeader = () => {
  const pathname = usePathname();
  return (
    <>
      <RemoveBaseLayout />
      <div className="fixed top-0 inset-x-0 p-4 flex justify-between items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/lab"
            className="text-xs font-mono flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeftIcon className="size-3" />
            lab
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="text-xs font-mono"
        >
          {pathname}
        </Button>
      </div>
    </>
  );
};

const Header = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const isChangingTheme = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize theme on first load
  useEffect(() => {
    try {
      // Safety check for browser environment
      if (typeof window === "undefined") return;

      // Get theme from localStorage or default to dark
      const savedTheme = localStorage.getItem("theme") as
        | "dark"
        | "light"
        | null;
      const initialTheme = savedTheme || "dark";

      // Apply theme to body first (clear any existing theme classes)
      const body = document.querySelector("body");
      if (body) {
        body.classList.remove("dark", "light");
        body.classList.add(initialTheme);
      }

      // Update state last (after DOM is updated)
      setTheme(initialTheme);
    } catch (error) {
      // Fallback to dark theme if something goes wrong
      console.error("Error initializing theme:", error);
      setTheme("dark");

      const body = document.querySelector("body");
      if (body) {
        body.classList.remove("dark", "light");
        body.classList.add("dark");
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts if component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const switchTheme = () => {
    // Prevent multiple rapid theme changes
    if (isChangingTheme.current) return;

    try {
      isChangingTheme.current = true;

      const body = document.querySelector("body");
      if (!body) {
        isChangingTheme.current = false;
        return;
      }

      // Calculate new theme first to ensure consistency
      const newTheme = theme === "dark" ? "light" : "dark";

      // Add transition effects
      for (const effect of THEME_SWITCH_EFFECTS) {
        body.classList.add(effect);
      }

      // Schedule cleanup of transition effects
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        // Only remove effects if body still exists
        const bodyElement = document.querySelector("body");
        if (bodyElement) {
          for (const effect of THEME_SWITCH_EFFECTS) {
            bodyElement.classList.remove(effect);
          }
        }
        isChangingTheme.current = false;
        timeoutRef.current = null;
      }, DURATION);

      // Update DOM (synchronously, before state)
      body.classList.remove(theme);
      body.classList.add(newTheme);

      // Update localStorage (synchronously, before state)
      localStorage.setItem("theme", newTheme);

      // Update state last
      setTheme(newTheme);
      isChangingTheme.current = false;
    } catch (error) {
      console.error("Error switching theme:", error);
      isChangingTheme.current = false;
    }
  };

  return (
    <motion.header
      id="header"
      className="px-6 pt-6 flex justify-between items-center max-w-content mx-auto w-full"
      variants={VARIANTS_HEADER}
      transition={TRANSITION_HEADER}
      initial="hidden"
      animate="visible"
    >
      <Link href="/" className="font-medium leading-none">
        <div className="flex items-center gap-2">
          <TextEffect as="span" preset="blur" per="char">
            ✦
          </TextEffect>
          <div className="flex flex-col gap-0 justify-center text-sm">
            <TextEffect as="span" preset="blur" per="char">
              bt norris
            </TextEffect>
            <TextEffect
              as="p"
              preset="fade"
              per="char"
              className="text-muted-foreground leading-none font-normal"
              delay={0.5}
            >
              design engineer
            </TextEffect>
          </div>
        </div>
      </Link>
      <div className="flex gap-2 items-center">
        {/*<Button variant="outline" size="sm" asChild>*/}
        {/*  <Link href="/lab" className="text-muted-foreground">*/}
        {/*    lab*/}
        {/*  </Link>*/}
        {/*</Button>*/}
        <Button variant="outline" size="sm" asChild>
          <Link href="/resume" className="text-muted-foreground">
            resume
          </Link>
        </Button>
        {/*<Button*/}
        {/*  variant="outline"*/}
        {/*  size="sm"*/}
        {/*  onClick={switchTheme}*/}
        {/*  className="text-muted-foreground"*/}
        {/*  disabled={isChangingTheme.current}*/}
        {/*>*/}
        {/*  {theme === "dark" ? "☀️" : "🌙"}*/}
        {/*</Button>*/}
      </div>
    </motion.header>
  );
};

export default Header;
