"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import Diagram from "@/components/ui/diagram";
import { ArrowRightIcon } from "lucide-react";

const SPRING_CONFIG = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

const BEFORE_STEPS = [
  "Search Multiple Sources",
  "Verify Current Versions",
  "Download Assets Manually",
  "Manual Import to Figma",
];

const AFTER_STEPS = ["Run Plugin", "Instant Search", "One-Click Import"];

export const WorkflowDiagram = () => {
  const [mode, setMode] = useState<"before" | "after">("before");

  const isBefore = mode === "before";
  const isAfter = mode === "after";

  const renderSteps = (steps: string[], prefix: string) => {
    const elements = [];

    for (let i = 0; i < steps.length; i++) {
      // Add step
      elements.push(
        <motion.div
          className="border border-border bg-white rounded-lg p-4 flex items-center justify-center shadow-sm text-xs"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ ...SPRING_CONFIG, delay: 0.1 + i * 0.1 }}
          key={`${prefix}-step-${i}`}
        >
          {steps[i]}
        </motion.div>
      );

      // Add arrow if not the last step
      if (i < steps.length - 1) {
        elements.push(
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ ...SPRING_CONFIG, delay: 0.15 + i * 0.1 }}
            key={`${prefix}-arrow-${i}`}
          >
            <ArrowRightIcon className="size-4" />
          </motion.div>
        );
      }
    }

    return elements;
  };

  return (
    <Diagram className={"h-64"}>
      <AnimatePresence mode="popLayout">
        {isBefore && (
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING_CONFIG}
            key="before-workflow"
          >
            {renderSteps(BEFORE_STEPS, "before")}
          </motion.div>
        )}

        {isAfter && (
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING_CONFIG}
            key="after-workflow"
          >
            {renderSteps(AFTER_STEPS, "after")}
          </motion.div>
        )}
      </AnimatePresence>
      <span className={"font-mono text-xs"}>Designer's workflow</span>
      <div className="absolute top-4 right-4 flex items-center justify-end gap-2 border px-2 py-1 text-xs text-muted-foreground bg-muted rounded-md">
        <span>Before</span>
        <Switch
          checked={mode === "after"}
          onCheckedChange={() => setMode(mode === "after" ? "before" : "after")}
        />
        <span>After</span>
      </div>
    </Diagram>
  );
};
