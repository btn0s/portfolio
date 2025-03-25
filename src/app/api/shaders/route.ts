import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamObject } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const shaderPrompt = `
You are a skilled GLSL fragment shader artist specializing in creating generative art using techniques like SDF raymarching and various noise functions (e.g., simplex, fbm, voronoise, etc.).

Available uniforms and variables:
- varying vec2 vUv: Normalized texture coordinates (0-1)
- uniform float uTime: Continuous time value for animation
- uniform vec2 uResolution: Screen resolution for aspect ratio correction

Common helper functions to consider:
// Signed Distance Functions
float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdBox(vec3 p, vec3 b) { return length(max(abs(p) - b, 0.0)); }
float sdTorus(vec3 p, vec2 t) { return length(vec2(length(p.xz) - t.x, p.y)) - t.y; }

// Noise functions
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) { /* Implement gradient noise */ }
float fbm(vec2 p) { /* Implement fractal brownian motion */ }

Based on the prompt, create a shader that utilizes these advanced techniques:
1. Signed Distance Functions (SDF):
   - Primitive shapes (sphere, box, torus)
   - Boolean operations (union, intersection, subtraction)
   - Domain repetition and deformation
   - Soft shadows and ambient occlusion

2. Noise and Patterns:
   - Fractal Brownian Motion (fBm) layering
   - Domain warping with noise
   - Voronoi cellular patterns
   - Simplex/Perlin noise for organic movement

3. Color and Material:
   - Gradient palettes and color mapping
   - Material properties (metallic, glass, plasma)
   - Normal mapping for surface detail
   - Emission and glow effects

4. Animation and Transformation:
   - Space warping and folding
   - Non-linear time effects
   - Smooth interpolation functions
   - Rotations and transformations

Important guidelines:
1. Use SDF operations for clean geometric shapes
2. Layer noise functions for organic detail
3. Apply smooth blending between elements
4. Optimize by limiting ray steps and iterations
5. Add comments explaining techniques used
6. Handle edge cases in distance fields

Generate a valid GLSL fragment shader for this prompt: {prompt}

The shader must start with these exact declarations:
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

Example structure for a raymarching shader:
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

float map(vec3 p) {
    // Define your distance field here
    return 0.0;
}

vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
        map(p + e.xyy) - map(p - e.xyy),
        map(p + e.yxy) - map(p - e.yxy),
        map(p + e.yyx) - map(p - e.yyx)
    ));
}

void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    uv.x *= uResolution.x/uResolution.y;
    
    // Ray setup
    vec3 ro = vec3(0.0, 0.0, -3.0);
    vec3 rd = normalize(vec3(uv, 1.0));
    
    // Raymarching
    float d = 0.0;
    vec3 p;
    
    for(int i = 0; i < 64; i++) {
        p = ro + rd * d;
        float dist = map(p);
        if(dist < 0.001 || d > 100.0) break;
        d += dist;
    }
    
    // Shading
    vec3 color = vec3(0.0);
    if(d < 100.0) {
        vec3 n = calcNormal(p);
        // Add your materials and lighting
    }
    
    gl_FragColor = vec4(color, 1.0);
}
`;

const shaderSchema = z.object({
  code: z
    .string()
    .describe("Valid GLSL fragment shader code for Three.js")
    .refine(
      (code) => code.includes("void main()"),
      "Shader must contain a main function"
    )
    .refine(
      (code) => code.includes("gl_FragColor"),
      "Shader must set gl_FragColor"
    )
    .refine(
      (code) => /uniform\s+float\s+uTime/.test(code),
      "Shader must declare uTime uniform"
    )
    .refine(
      (code) => /uniform\s+vec2\s+uResolution/.test(code),
      "Shader must declare uResolution uniform"
    )
    .refine(
      (code) => /varying\s+vec2\s+vUv/.test(code),
      "Shader must declare vUv varying"
    ),
});

export async function POST(req: Request) {
  const prompt = await req.json();

  const result = streamObject({
    model: anthropic("claude-3-7-sonnet-20250219"),
    schema: shaderSchema,
    prompt: shaderPrompt.replace("{prompt}", prompt),
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
