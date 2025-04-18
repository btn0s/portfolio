import React from "react";
import { NodeProps, Node } from "@xyflow/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

// Re-define or import the props structure needed for the card
// Based on the original WorkCardProps
type WorkCardData = {
  slug: string;
  title: string;
  description: string;
  tags?: string[];
  href?: string; // Make href optional
  imagePath: string;
};

type WorkCardNode = Node<WorkCardData, "workCardNode">;

// Use NodeProps with the specific data structure
function WorkCardNode({ data }: NodeProps<WorkCardNode>) {
  const cardContent = (
    <div className="relative isolate">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        variants={{
          hover: { y: -24 },
        }}
        className="absolute left-1/2 -translate-x-1/2 top-0 z-10 whitespace-nowrap"
      >
        <h3 className="font-medium text-sm text-foreground">{data.title}</h3>
      </motion.div>

      {/* Main image */}
      {data.imagePath && (
        <Image
          src={JSON.parse(data.imagePath).default}
          alt={data.title}
          width={416}
          height={234}
          className="rounded-sm w-full relative z-20 border"
        />
      )}
    </div>
  );

  return (
    <div className="w-[300px] isolate">
      {data.href ? (
        <motion.div
          whileHover="hover"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10"
        >
          <Link href={data.href} className="group block">
            {cardContent}
          </Link>
        </motion.div>
      ) : (
        <motion.div
          whileHover="hover"
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10"
        >
          <div className="group block">{cardContent}</div>
        </motion.div>
      )}
    </div>
  );
}

export default React.memo(WorkCardNode);
