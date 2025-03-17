import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
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
