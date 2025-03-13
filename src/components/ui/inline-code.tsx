import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface InlineCodeProps extends HTMLAttributes<HTMLElement> {}

export function InlineCode({ children, className, ...props }: InlineCodeProps) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
