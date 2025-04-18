import React from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FlickeringGrid } from "./ui/flickering-grid";

type SimpleContentNode = Node<{ textContent: string }, "simpleContentNode">;

function SimpleContentNode({ data }: NodeProps<SimpleContentNode>) {
  // Apply Tailwind classes for styling
  return (
    <div className="p-4 rounded-md border bg-card text-card-foreground max-w-md shadow-sm flex flex-col gap-4">
      <FlickeringGrid className={"w-full"} height={64} color={"#fff"} />

      <p>
        I'm a <span className="font-medium text-foreground">designer</span> and{" "}
        <span className="font-medium text-foreground">programmer</span>{" "}
        interested in games, tools, artificial intelligence, and{" "}
        <Link
          href="/pov"
          className="font-medium text-foreground hover:underline"
        >
          driven by the joy of discovery
        </Link>
        .
      </p>
      <p>
        I'm currently a{" "}
        <span className="font-medium text-foreground">
          senior design engineer
        </span>{" "}
        at{" "}
        <Link
          className="hover:underline hover:text-foreground"
          href="/work/backbone"
        >
          Backbone
        </Link>
        .
      </p>
      <p>
        I use this site to explore, test, prototype, and bring ideas to life —
        from my sketchbook to my{" "}
        <Link
          href="/lab"
          className="font-medium text-foreground hover:underline"
        >
          digital lab
        </Link>
        .
      </p>
      <div className="flex flex-col items-start text-sm gap-2">
        <Link
          href="/pov"
          className="flex items-center gap-1 hover:text-foreground hover:translate-x-1 transition-all duration-300"
        >
          <ArrowRight className="size-3" />
          Why I do this
        </Link>

        <Link
          href="/resume"
          className="flex items-center gap-1 hover:text-foreground hover:translate-x-1 transition-all duration-300"
        >
          <ArrowRight className="size-3" />
          Resume
        </Link>
      </div>
    </div>
  );
}

export default SimpleContentNode;
