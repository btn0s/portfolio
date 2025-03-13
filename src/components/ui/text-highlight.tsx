import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface TextHighlightProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function TextHighlight({
  children,
  className,
  ...props
}: TextHighlightProps) {
  return (
    <span className={cn("text-white font-bold", className)} {...props}>
      {children}
    </span>
  );
}
