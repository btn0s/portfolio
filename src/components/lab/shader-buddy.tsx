"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Canvas, useFrame } from "@react-three/fiber";
import { z } from "zod";
import { forwardRef } from "react";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { ScrollArea } from "../ui/scroll-area";

const shaderSchema = z.object({
  code: z.string().describe("GLSL fragment shader code"),
});

const ShaderEffect = forwardRef<any, { code: string }>(({ code }, ref) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uResolution.value.set(
        state.size.width,
        state.size.height
      );
    }
  });

  // Create shader material
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader:
        code ||
        `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uResolution;

        void main() {
          gl_FragColor = vec4(vUv, 0.0, 1.0);
        }
      `,
    });
    mat.needsUpdate = true;
    return mat;
  }, [code]);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive ref={materialRef} object={material} />
    </mesh>
  );
});
ShaderEffect.displayName = "ShaderEffect";

const ShaderBuddy = () => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>("");

  const { object, submit, isLoading } = useObject({
    api: "/api/shaders",
    schema: shaderSchema,
  });

  return (
    <div className="flex flex-col gap-4 p-4 border bg-muted rounded-lg not-prose">
      <div className="w-full relative aspect-video bg-background rounded-lg border border-white/20 overflow-hidden">
        {isLoading && (
          <TextShimmer
            duration={2}
            className="text-xs font-mono absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            {input}
          </TextShimmer>
        )}
        <Canvas className="absolute inset-0">
          {!isLoading && object?.code ? (
            <ShaderEffect code={object.code} />
          ) : null}
        </Canvas>
        <div className="absolute bottom-2 left-2 right-2 ">
          <ScrollArea className="h-[100px] bg-background/70 backdrop-blur-xl rounded-lg border text-xs font-mono p-2">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 text-xs"
            >
              Copy code
            </Button>
            <pre>{object?.code}</pre>
          </ScrollArea>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the shader you want to create..."
          rows={4}
          disabled={isLoading}
        />
        <Button
          onClick={() => submit(input)}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? "Generating..." : "Generate Shader"}
        </Button>
      </div>
    </div>
  );
};

export default ShaderBuddy;
