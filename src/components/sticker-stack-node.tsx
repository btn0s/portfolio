import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { NodeProps, Node, useUpdateNodeInternals } from "@xyflow/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

// Add new type for sticker properties
type StickerTransform = {
  rotation: number;
};

type StickerStackData = {
  slug: string;
  title: string;
  description: string;
  tags?: string[];
  href?: string;
  stickerPaths: string[];
  // Store transforms for each sticker
  stickerTransforms?: StickerTransform[];
};

type StickerStackNode = Node<StickerStackData, "stickerStackNode">;

// This component doesn't depend on drag state and won't re-render during drag
function StickerContent({
  data,
  containerHeight,
}: {
  data: StickerStackData;
  containerHeight: number | null;
}) {
  // Use default transform for initial state if not provided
  const getRotation = useCallback(
    (index: number): number => {
      if (data.stickerTransforms && data.stickerTransforms[index]) {
        return data.stickerTransforms[index].rotation;
      }
      return Math.random() * 10 - 5; // Random rotation between -5 and 5 degrees
    },
    [data.stickerTransforms]
  );

  // Memoize the sticker elements to prevent re-rendering on drag
  const stickerElements = useMemo(() => {
    return data.stickerPaths?.map((stickerPath, index) => {
      try {
        const sticker = JSON.parse(stickerPath).default;
        const rotation = getRotation(index);

        return (
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
            initial={{
              rotate: rotation,
              scale: 0.95,
              opacity: 0,
            }}
            animate={{
              rotate: rotation,
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: index * 0.1,
              duration: 0.3,
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            <Image
              src={sticker.src}
              alt={`${data.title} sticker ${index + 1}`}
              width={sticker.width}
              height={sticker.height}
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
              }}
            />
          </motion.div>
        );
      } catch (error) {
        console.error("Error parsing sticker path:", error);
        return null;
      }
    });
  }, [data.stickerPaths, data.title, getRotation]);

  return (
    <>
      {/* Title label that pops up on hover */}
      <motion.div
        initial={{ y: 0 }}
        whileHover={{ y: -12 }}
        className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
      >
        <h3 className="font-medium text-sm text-foreground">{data.title}</h3>
      </motion.div>

      {/* Container for the stickers */}
      <div className="relative w-full h-full">{stickerElements}</div>

      {/* Clickable link area */}
      {data.slug && (
        <Link
          href={data.slug}
          className="absolute inset-0 z-20"
          aria-label={data.title}
        />
      )}
    </>
  );
}

// Main node component that wraps the memoized content
function StickerStackNode({ data, id }: NodeProps<StickerStackNode>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9); // Default aspect ratio
  const updateNodeInternals = useUpdateNodeInternals();

  // Get size information from the first sticker when it loads
  useEffect(() => {
    if (data.stickerPaths && data.stickerPaths.length > 0) {
      try {
        const sticker = JSON.parse(data.stickerPaths[0]).default;
        if (sticker.width && sticker.height) {
          const ratio = sticker.width / sticker.height;
          setAspectRatio(ratio);

          // Set container height based on its width and the aspect ratio
          if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            setContainerHeight(width / ratio);

            // Update node internals to ensure React Flow knows the new dimensions
            setTimeout(() => updateNodeInternals(id), 50);
          }
        }
      } catch (error) {
        console.error("Error parsing sticker path:", error);
      }
    }
  }, [data.stickerPaths, id, updateNodeInternals]);

  // Memoize the entire node content to prevent re-renders during drag
  const memoizedContent = useMemo(() => {
    return <StickerContent data={data} containerHeight={containerHeight} />;
  }, [data, containerHeight]);

  // Generate node content
  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-[300px]"
      style={{
        height: containerHeight ? `${containerHeight}px` : "auto",
      }}
    >
      {memoizedContent}
    </div>
  );
}

// Memoize the entire node component to prevent unnecessary re-renders
export default React.memo(StickerStackNode, (prevProps, nextProps) => {
  // Only re-render if data changes, not on position changes
  const prevData = prevProps.data;
  const nextData = nextProps.data;
  const positionChanged =
    prevProps.xPos !== nextProps.xPos || prevProps.yPos !== nextProps.yPos;

  // If only the position changed (during drag), don't re-render
  if (
    positionChanged &&
    JSON.stringify(prevData) === JSON.stringify(nextData)
  ) {
    return true; // Return true to prevent re-render
  }

  return false; // Re-render on data changes
});
