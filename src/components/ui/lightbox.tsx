"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Button } from "./button";
import useClickOutside from "@/hooks/use-click-outside";

interface LightboxProps {
  src: any; // StaticImageData or string
  alt: string;
  className?: string;
}

export function Lightbox({ src, alt, className }: LightboxProps) {
  const [open, setOpen] = useState(false);
  const [animatingClosed, setAnimatingClosed] = useState(false);

  const clickOutsideRef = useRef<HTMLDivElement>(null!);

  useClickOutside(clickOutsideRef, () => {
    setAnimatingClosed(true);
    setOpen(false);
  });

  const id = useId();

  const handleClose = () => {
    setAnimatingClosed(true);
    setOpen(false);
  };

  return (
    <>
      <motion.div
        layoutId={!animatingClosed && open ? id : undefined}
        className={`cursor-pointer transition-all hover:opacity-90 ${className}`}
        onClick={() => {
          setAnimatingClosed(false);
          setOpen(true);
        }}
      >
        <div className="aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={alt}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </motion.div>

      <AnimatePresence onExitComplete={() => setAnimatingClosed(false)}>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md"
              onClick={handleClose}
            />

            <motion.div
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <motion.div
                ref={clickOutsideRef}
                layoutId={id}
                className="relative rounded-lg overflow-hidden aspect-[4/3]"
              >
                <Image
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover rounded-lg"
                  priority
                />
              </motion.div>

              <Button variant="outline" onClick={handleClose}>
                Close
                <X />
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
