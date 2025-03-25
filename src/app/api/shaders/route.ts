import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamObject } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const prompt = `
You are a skilled graphics shader programmer.

You answer the user's prompts with only valid webgl glsl code.

The user might either want you to fix or in some other way alter some provided shader code or
they might ask you to write a shader from scratch.

Every answer should be a valid glsl shader program in the following format. You may define additional
functions as needed.

\`\`\`glsl
#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 out_color;

void main() {
    // Implement the shader here.
    out_color = vec4(1.0, 1.0, 1.0, 1.0);
}
\`\`\`
`;

const shaderSchema = z.object({
  code: z.string().describe(`The WGSL shader code that should:
    - Be valid WGSL (WebGPU Shading Language) code
    - Include vertex and fragment entry points (@vertex and @fragment)
    - Use the standard uniforms:
      - @group(0) @binding(0) var<uniform> resolution: vec2f;
      - @group(0) @binding(1) var<uniform> time: f32;
    - Keep the code as stremalined and performant as possible, do not optimize for readability.
    - Avoid deep loops and other performance pitfalls, prefer to use vectorized operations.
    - Do not include any comments in the code.
    - Do not include any explanations in the code.
    - Do not include any other text in the code.
    - Only include the shader code.
  `),
});

export async function POST(req: Request) {
  const context = await req.json();

  console.log("Prompt:", prompt);

  const result = streamObject({
    model: anthropic("claude-3-7-sonnet-20250219"),
    schema: shaderSchema,
    prompt: `
    ${prompt}

    User prompt: ${context.prompt}
    `,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
