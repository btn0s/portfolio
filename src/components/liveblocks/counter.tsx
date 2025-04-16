"use client";

import { useOthers } from "@liveblocks/react";

const Counter = () => {
  const others = useOthers();
  const userCount = others.length;
  return (
    <div className="flex gap-2 items-center text-xs text-muted-foreground font-mono">
      {userCount} {userCount === 1 ? "person" : "people"} here
    </div>
  );
};

export default Counter;
