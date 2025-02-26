"use client";

import { FC, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

interface CodeBlockProps {
  language: string;
  value: string;
  showLineNumbers?: boolean;
  className?: string;
}

const CodeBlock: FC<CodeBlockProps> = memo(
  ({ language, value, showLineNumbers = true, className = "" }) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(value);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy text: ", error);
      }
    };

    return (
      <div
        className={`relative w-full font-mono rounded-lg overflow-hidden ${className}`}
      >
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
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
  }
);

CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
