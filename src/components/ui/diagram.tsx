import { cn } from "@/lib/utils";
import { FC, PropsWithChildren } from "react";

const Diagram: FC<
  PropsWithChildren<{
    className?: string;
  }>
> = ({ className, children }) => {
  return (
    <div
      className={cn(
        className,
        "flex flex-col gap-4 relative items-center justify-center p-6 w-full bg-foreground rounded-lg shadow-md text-background not-prose"
      )}
    >
      {children}
    </div>
  );
};

export default Diagram;
