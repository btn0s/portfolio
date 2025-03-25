"use client";

import { useState, useEffect, useRef } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

const shaderSchema = z.object({
  code: z
    .string()
    .describe(`GLSL shader code that includes vertex and fragment shaders`),
});

const ShaderBuddy = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [input, setInput] = useState("");

  const { object, submit, isLoading } = useObject({
    api: "/api/shaders",
    schema: shaderSchema,
  });

  // Effect to handle shader compilation and rendering
  useEffect(() => {
    if (!object?.code || !canvasRef.current) return;
    console.log("New shader code received:", object.code);
  }, [object?.code]);

  const handleSubmit = () => {
    const input = formRef.current?.elements.namedItem(
      "prompt"
    ) as HTMLTextAreaElement;
    console.log("Form:", formRef.current);
    console.log("Input:", input.value);
    submit(input.value);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <canvas
          ref={canvasRef}
          className="w-full aspect-video bg-background rounded-lg border"
          width={800}
          height={600}
        />
      </div>

      <form ref={formRef} className="flex flex-col gap-2">
        <Textarea
          name="prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the shader you want to create..."
          rows={4}
        />
      </form>
      <Button variant="outline" disabled={isLoading} onClick={handleSubmit}>
        {isLoading ? "Generating..." : "Generate Shader"}
      </Button>

      <div className="grid grid-cols-2 gap-4">
        {/* Streaming output */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Stream Output</h3>
          <pre className="p-4 bg-muted rounded-lg overflow-auto h-[300px] font-mono text-sm">
            <code>{object?.code || "Waiting for generation..."}</code>
          </pre>
        </div>

        {/* Final parsed shader code */}
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Final Shader Code</h3>
          <pre className="p-4 bg-muted rounded-lg overflow-auto h-[300px] font-mono text-sm">
            <code>{object?.code || "No shader code generated yet"}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ShaderBuddy;
