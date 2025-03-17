import { TRANSITION_SECTION, VARIANTS_SECTION } from "@/lib/variants";
import { motion } from "motion/react";

const ProseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      className="prose dark:prose-invert prose-sm max-w-none prose-h1:text-xl prose-h1:md:text-2xl prose-strong:font-medium prose-h1:font-medium prose-h2:font-medium prose-h3:font-medium prose-h4:font-medium prose-h5:font-medium prose-h6:font-medium"
      variants={VARIANTS_SECTION}
      transition={TRANSITION_SECTION}
    >
      {children}
    </motion.div>
  );
};

export default ProseLayout;
