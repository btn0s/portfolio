"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Canvas, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { z } from "zod";
import { forwardRef } from "react";
import { useMemo, useRef } from "react";
import * as THREE from "three";

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
    <div className="flex flex-col gap-4 p-4 border bg-muted rounded-lg">
      <div className="relative flex flex-col gap-2 aspect-video overflow-hidden">
        <pre className="absolute top-2 left-2 text-xs font-mono opacity-20 mix-blend-difference">
          {object?.code}
        </pre>

        <div className="w-full aspect-video bg-background rounded-lg border border-white/20 overflow-hidden">
          <Canvas>
            {!isLoading && object?.code ? (
              <ShaderEffect code={object.code} />
            ) : null}
          </Canvas>
        </div>

        {error && (
          <div className="text-sm text-red-500 font-mono">Error: {error}</div>
        )}
      </div>

      <div className="flex flex-col gap-4">
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
        >
          {isLoading ? "Generating..." : "Generate Shader"}
        </Button>
      </div>
    </div>
  );
};

export default ShaderBuddy;
