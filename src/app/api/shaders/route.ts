import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const shaderSchema = z.object({
  code: z.string().describe(`The GLSL shader code that should:
    - Be valid GLSL ES 3.0 code
    - Include both vertex and fragment shaders
    - Include all necessary uniforms and attributes
    - Add brief comments for key parts
    - Be ready to run in a WebGL context`),
});

export async function POST(req: Request) {
  const prompt = await req.json();

  console.log("Prompt:", prompt);

  const result = streamObject({
    model: openai("gpt-4o"),
    schema: shaderSchema,
    prompt,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
