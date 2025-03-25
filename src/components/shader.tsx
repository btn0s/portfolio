"use client";

import { Shader as ShaderComponent } from "react-shaders";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const Shader = ({ fs, className }: { fs: string; className?: string }) => {
  const [rendered, setRendered] = useState(true);

  useEffect(() => {
    setRendered(true);
  }, []);

  return (
    <div className={cn("w-full border rounded-md overflow-hidden", className)}>
      {rendered && <ShaderComponent fs={fs} />}
    </div>
  );
};

export default Shader;
