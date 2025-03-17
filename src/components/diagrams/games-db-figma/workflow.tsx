"use client";

import { TextMorph } from "@/components/motion-primitives/text-morph";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { ArrowRightIcon, ArrowDownIcon } from "lucide-react";
import Diagram from "@/components/ui/diagram";

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
          className="border border-border bg-white rounded-lg p-4 text-nowrap whitespace-nowrapflex items-center justify-center shadow-sm text-xs"
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
            <ArrowDownIcon className="size-4 md:hidden" />
            <ArrowRightIcon className="size-4 hidden md:block" />
          </motion.div>
        );
      }
    }

    return elements;
  };

  return (
    <Diagram className={"h-[488px] md:h-64"}>
      <AnimatePresence mode="popLayout">
        {isBefore && (
          <motion.div
            className="flex flex-col items-center justify-center gap-2 md:flex-row"
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
            className="flex flex-col items-center justify-center gap-2 md:flex-row"
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
      <div
        className={
          "flex items-center justify-between absolute bottom-0 inset-x-0 p-2"
        }
      >
        <span className={"font-mono text-xs pl-2"}>
          <TextMorph as="span">
            {isBefore ? "original workflow" : "optimized workflow"}
          </TextMorph>
        </span>
        <div className="flex items-center justify-end gap-2 border px-2 py-1 text-xs text-muted-foreground bg-muted rounded-md">
          <span>Before</span>
          <Switch
            checked={mode === "after"}
            onCheckedChange={() =>
              setMode(mode === "after" ? "before" : "after")
            }
          />
          <span>After</span>
        </div>
      </div>
    </Diagram>
  );
};
