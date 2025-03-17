"use client";

import { VARIANTS_CONTAINER } from "@/lib/variants";
import { motion } from "motion/react";

const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.main
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
      className="max-w-content mx-auto px-6 py-24 flex-1 w-full"
    >
      {children}
    </motion.main>
  );
};

export default Main;
