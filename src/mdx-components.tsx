import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import { useId } from "react";
type GalleryItem = {
  type: "image" | "video" | "youtube";
  src: string;
  alt: string;
};

const GalleryWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-1 gap-4 not-prose mt-8">{children}</div>
  );
};

const GalleryItem = ({ item }: { item: GalleryItem }) => {
  const id = useId();
  switch (item.type) {
    case "image":
      return (
        <Image
          key={id}
          src={item.src}
          alt={item.alt}
          width={1600}
          height={900}
          className="rounded-sm shrink-0 bg-muted border shadow w-full"
        />
      );
    case "video":
      return (
        <video
          key={id}
          src={item.src}
          className="rounded-sm shrink-0 bg-muted border shadow w-full"
          autoPlay
          muted
          loop
          playsInline
        />
      );
    case "youtube":
      return (
        <iframe
          key={id}
          src={item.src}
          className="rounded-sm shrink-0 bg-muted border shadow aspect-video w-full"
        />
      );
  }
};

const Gallery = ({ items }: { items: GalleryItem[] }) => {
  return (
    <GalleryWrapper>
      {items.map((item) => (
        <GalleryItem key={item.src} item={item} />
      ))}
    </GalleryWrapper>
  );
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Gallery,
    Image: (props) => (
      <Dialog>
        <DialogTrigger>
          <Image {...props} />
        </DialogTrigger>
        <DialogContent className={"p-0 max-w-6xl border-0 bg-transparent"}>
          <VisuallyHidden>
            <DialogTitle>Image</DialogTitle>
          </VisuallyHidden>
          <Image
            src={props.src}
            alt={props.alt}
            width={1600}
            height={900}
            className={"w-screen rounded-md shrink-0 bg-muted border shadow"}
          />
        </DialogContent>
      </Dialog>
    ),
  };
}
