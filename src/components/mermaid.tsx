"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Define the props interface
interface MermaidProps {
  id: string;
  source: string;
  title?: string;
  className?: string;
}

// Create the inner component
const MermaidComponent: React.FC<MermaidProps> = ({
  id,
  source,
  title,
  className,
}) => {
  const [mermaid, setMermaid] = useState<any | null>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    import("mermaid").then((m) => setMermaid(m.default));
  }, []);

  useEffect(() => {
    if (mermaid && mermaidRef.current) {
      mermaid.initialize({
        theme: "dark",
        themeVariables: {
          primaryColor: "#1e293b",
          primaryTextColor: "#f8fafc",
          primaryBorderColor: "#475569",
          lineColor: "#94a3b8",
          secondaryColor: "#334155",
          tertiaryColor: "#0f172a",
        },
      });
      mermaid.render(id, source).then(({ svg }: { svg: string }) => {
        if (mermaidRef.current) {
          setSvg(svg);
        }
      });
    }
  }, [mermaid, id, source]);

  return (
    <div
      className={`not-prose mb-6 flex flex-col items-center justify-center gap-4 rounded-lg bg-card p-6 border border-border ${
        className || ""
      }`}
    >
      <div
        ref={mermaidRef}
        className="mermaid flex w-full items-center justify-center"
        dangerouslySetInnerHTML={{
          __html: svg,
        }}
      />
      {title && (
        <div className="font-mono text-xs text-muted-foreground">{title}</div>
      )}
    </div>
  );
};

// Create the dynamic component with SSR disabled
const Mermaid = dynamic(() => Promise.resolve(MermaidComponent), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 text-muted-foreground">
      Loading diagram...
    </div>
  ),
});

// Export the dynamic component
export default Mermaid;
