import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamObject, streamText } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const descriptionPrompt = `
You are a skilled graphics shader programmer.

Describe in clear technical terms what shader effect should be created based on the prompt:
- What visual effects and patterns?
- What color schemes and transitions?
- What animation and movement?
- What mathematical functions are needed?

Keep the description technical and specific.
`;

const codePrompt = `
You are a skilled graphics shader programmer.

Generate a valid GLSL fragment shader for Three.js that implements this technical description:

{description}

The shader must start with these exact declarations:
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

Example of valid shader structure:
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

void main() {
    vec2 uv = vUv;
    vec3 color = vec3(uv.x, uv.y, 0.5);
    gl_FragColor = vec4(color, 1.0);
}
`;

const shaderSchema = z.object({
  code: z.string().describe("Valid GLSL fragment shader code for Three.js"),
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
