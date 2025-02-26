"use client";

import { VARIANTS_CONTAINER } from "@/config/variants";
import { motion } from "motion/react";

const Main = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.main
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
      className="px-4 sm:px-6 max-w-3xl mx-auto"
    >
      {children}
    </motion.main>
  );
};

export default Main;
