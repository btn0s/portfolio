"use client";

import { useState, useEffect, useRef } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const shaderSchema = z.object({
  code: z.string().describe("GLSL fragment shader code"),
});

// Default vertex shader that renders a fullscreen quad
const DEFAULT_VERTEX_SHADER = `#version 300 es
precision highp float;

in vec4 a_position;

void main() {
    gl_Position = a_position;
}`;

// WebGL utility functions
const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Failed to compile shader: ${error}`);
  }

  return shader;
};

const createProgram = (
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string
) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Failed to link program: ${error}`);
  }

  return program;
};

const ShaderBuddy = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number>();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>("");

  const { object, submit, isLoading } = useObject({
    api: "/api/shaders",
    schema: shaderSchema,
  });

  // Initialize WebGL context
  useEffect(() => {
    if (!canvasRef.current) return;

    // Use WebGL 2.0 context
    const gl = canvasRef.current.getContext("webgl2");
    if (!gl) {
      setError("WebGL 2.0 not supported");
      return;
    }

    glRef.current = gl;

    // Create initial black screen
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return () => {
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Effect to handle shader compilation and rendering
  useEffect(() => {
    if (!object?.code || !glRef.current) return;

    const gl = glRef.current;
    setError("");

    try {
      // Clean up old program
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
      }

      // Create new program with default vertex shader and generated fragment shader
      const program = createProgram(gl, DEFAULT_VERTEX_SHADER, object.code);
      programRef.current = program;

      // Set up position buffer for fullscreen quad
      const positions = new Float32Array([
        -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
      ]);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      // Get attribute and uniform locations
      const positionLocation = gl.getAttribLocation(program, "a_position");
      const timeLocation = gl.getUniformLocation(program, "u_time");
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

      // Start render loop
      let startTime = performance.now();

      const render = () => {
        const time = (performance.now() - startTime) * 0.001;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.useProgram(program);

        // Update uniforms
        if (timeLocation) gl.uniform1f(timeLocation, time);
        if (resolutionLocation) {
          gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        }

        // Set up position attribute
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        animationFrameRef.current = requestAnimationFrame(render);
      };

      render();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compile shader");
      console.error(err);
    }
  }, [object?.code]);

  return (
    <div className="flex flex-col gap-4 p-4 border border-t-white border-l-white bg-muted border-r-black border-b-black">
      <div className="relative flex flex-col gap-2 aspect-video overflow-hidden">
        <pre className="absolute top-2 left-2 text-xs font-mono opacity-50 mix-blend-difference">
          {object?.code}
        </pre>

        <canvas
          ref={canvasRef}
          className="w-full aspect-video bg-background rounded-lg border"
          width={800}
          height={600}
        />
        {error && (
          <div className="text-sm text-red-500 font-mono">Error: {error}</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the shader you want to create..."
          rows={4}
        />
        <Button
          onClick={() => submit(input)}
          disabled={isLoading}
          variant="outline"
          className="rounded-none !border-t-white !border-l-white !border-r-black !border-b-black active:bg-muted active:text-muted-foreground active:!border-t-black active:!border-l-black active:!border-r-white active:!border-b-white"
        >
          {isLoading ? "Generating..." : "Generate Shader"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
