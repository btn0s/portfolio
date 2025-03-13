"use client";

import { Lightbox } from "@/components/ui/lightbox";
import type { StaticImageData } from "next/image";

interface ImageItem {
  src: StaticImageData;
  alt: string;
}

interface ImageGridProps {
  images: ImageItem[];
  columns?: number;
  className?: string;
}

export function ImageGrid({
  images,
  columns = 2,
  className = "",
}: ImageGridProps) {
  return (
    <div
      className={`grid gap-4 ${
        columns === 2 ? "md:grid-cols-2" : `md:grid-cols-${columns}`
      } ${className}`}
    >
      {images.map((image, index) => (
        <div
          key={`${image.alt}-${index}`}
          className="rounded-lg overflow-hidden"
        >
          <Lightbox src={image.src} alt={image.alt} />
        </div>
      ))}
    </div>
  );
}
