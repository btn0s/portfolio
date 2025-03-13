"use client";

import { type FC, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  value: string;
  className?: string;
}

const CodeBlock: FC<CodeBlockProps> = memo(
  ({ language, value, className = "" }) => {
    return (
      <div
        className={`relative w-full font-mono rounded-lg overflow-hidden ${className}`}
      >
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono)",
            },
          }}
          className="bg-muted"
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  },
);

CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
