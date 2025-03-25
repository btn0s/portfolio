import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamObject, streamText } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const descriptionPrompt = `
You are a skilled graphics shader programmer. Fragment shaders run per-pixel and determine the final color output.

Key concepts to consider when describing shader effects:
1. Coordinate Space:
   - vUv provides normalized (0-1) texture coordinates
   - Transform and manipulate these coordinates for effects
   - Use uResolution.xy for aspect ratio correction

2. Time-based Animation:
   - uTime provides continuous time value
   - Use trigonometric functions (sin, cos) for smooth animation
   - Consider frequency and phase for varied motion

3. Color Theory:
   - Work in RGB color space
   - Use color gradients and transitions
   - Consider complementary and analogous colors
   - Mix colors based on coordinates or time

4. Mathematical Patterns:
   - Distance fields for circular/geometric effects
   - Noise functions for organic movement
   - Matrix transformations for coordinate manipulation
   - Smoothstep/mix for transitions

Describe in clear technical terms what shader effect should be created based on the prompt:
- What coordinate transformations are needed?
- What color schemes and how they transition?
- How time affects the animation and movement?
- What mathematical functions create the core effect?

Keep the description technical and specific, referencing the available uniforms.
`;

const codePrompt = `
You are a skilled graphics shader programmer generating GLSL code for Three.js.

Available uniforms and variables:
- varying vec2 vUv: Normalized texture coordinates (0-1)
- uniform float uTime: Continuous time value for animation
- uniform vec2 uResolution: Screen resolution for aspect ratio correction

Generate a valid GLSL fragment shader that implements this technical description:

{description}

Important GLSL guidelines:
1. Always normalize vectors when using them for directions
2. Use smoothstep() for smooth transitions
3. Consider performance - avoid nested loops
4. Use built-in functions when possible (mix, dot, length)
5. Add comments explaining complex math
6. Handle edge cases to avoid artifacts

The shader must start with these exact declarations:
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

Example of valid shader structure:
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

void main() {
    // Correct aspect ratio
    vec2 uv = vUv;
    uv.x *= uResolution.x/uResolution.y;
    
    // Center coordinates
    uv = uv * 2.0 - 1.0;
    
    // Create base color
    vec3 color = vec3(0.0);
    
    // Add your effect here
    
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
  const context = await req.json();

  // Step 1: Get technical description
  const descriptionResult = streamObject({
    model: anthropic("claude-3-7-sonnet-20250219"),
    schema: z.object({
      description: z
        .string()
        .describe("Technical description of the shader effect"),
    }),
    prompt: `${descriptionPrompt}\n\nUser prompt: ${context}`,
    temperature: 0.7,
  }).toTextStreamResponse();

  const description = await new Response(descriptionResult.body).text();

  console.log(description);

  // Step 2: Generate shader code based on description
  const result = streamObject({
    model: anthropic("claude-3-7-sonnet-20250219"),
    schema: shaderSchema,
    prompt: codePrompt.replace("{description}", description),
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
