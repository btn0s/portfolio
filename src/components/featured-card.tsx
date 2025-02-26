"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { FeaturedWorkItem } from "@/content/featured-work";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { FC } from "react";

// Custom hook for media queries
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const FeaturedWorkCard: FC<FeaturedWorkItem> = ({
  id,
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  link,
  context,
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const CardContent = () => (
    <>
      <div className="relative w-full aspect-[4/3] border rounded-lg overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          className="size-full object-cover"
        />
      </div>
      <div className="pt-4 pb-6">
        <div className="flex flex-col mb-2">
          {isDesktop ? (
            <DialogTitle className="text-foreground text-sm">
              {title}
            </DialogTitle>
          ) : (
            <DrawerTitle className="text-foreground text-sm">
              {title}
            </DrawerTitle>
          )}
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {description.map((paragraph) => (
            <p
              key={`${id}-paragraph-${paragraph.substring(0, 20)}`}
              className="text-muted-foreground text-sm"
            >
              {paragraph}
            </p>
          ))}
          <p className="text-muted-foreground text-sm">{context}</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button variant="secondary" size="lg" asChild>
            <Link href={link?.url ?? ""}>
              <span>See the project</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          {isDesktop ? (
            <Button
              variant="outline"
              className="group"
              asChild
              size="lg"
              onClick={() => setOpen(false)}
            >
              <span>Close</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="group"
              size="lg"
              onClick={() => setOpen(false)}
            >
              <span>Close</span>
            </Button>
          )}
        </div>
      </div>
    </>
  );

  // Card trigger component
  const CardTrigger = (
    <motion.div
      className="relative flex flex-col overflow-hidden rounded-lg gap-2"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Card Image */}
      <div className="aspect-[4/3] overflow-hidden relative rounded-lg border">
        <Image
          src={imageSrc}
          alt={imageAlt}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Title and Subtitle */}
      <div className="text-sm">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </div>
    </motion.div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{CardTrigger}</DialogTrigger>
        <DialogContent className="p-4 overflow-hidden border bg-background sm:rounded-2xl sm:max-w-[600px]">
          <CardContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{CardTrigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <CardContent />
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
};

export default FeaturedWorkCard;
