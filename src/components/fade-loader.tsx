"use client";

import { VARIANTS_SECTION } from "@/lib/variants";
import { TRANSITION_SECTION } from "@/lib/variants";
import { motion } from "motion/react";
import { FC, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
const FadeLoader: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      className={cn(className)}
      variants={VARIANTS_SECTION}
      transition={TRANSITION_SECTION}
    >
      {children}
    </motion.div>
  );
};

export default FadeLoader;
