import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

const gpt4o = openai("gpt-4o");

/**
 * Utility function for logging with timestamps and structured format
 */
const logger = {
  info: (action: string, message: string, data?: any) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "INFO",
        action,
        message,
        ...(data && { data }),
      })
    );
  },
  error: (action: string, message: string, error?: any) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "ERROR",
        action,
        message,
        ...(error && {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
        }),
      })
    );
  },
  startTimer: (action: string, message: string) => {
    return {
      start: performance.now(),
      action,
      message,
    };
  },
  endTimer: (timer: { start: number; action: string; message: string }) => {
    const duration = performance.now() - timer.start;
    logger.info(
      timer.action,
      `${timer.message} completed in ${duration.toFixed(2)}ms`
    );
    return duration;
  },
};

/**
 * Generates a script for the overview section of the pod
 * @param prompt - User prompt or enriched context from web search
 * @returns String containing a well-structured script
 */
const generatePodOverviewScript = async (prompt: string) => {
  const timer = logger.startTimer(
    "generate_script",
    `Generating knowledge bot script for "${prompt}"`
  );

  try {
    logger.info("generate_script", "Starting script generation", { prompt });

    const result = streamText({
      model: gpt4o,
      messages: [
        {
          role: "system",
          content:
            "You are an expert knowledge bot that explains topics clearly and concisely. Your responses are conversational but focused, with no fluff or filler content. You speak directly to the user in a helpful, straightforward manner.",
        },
        {
          role: "user",
          content: `Create a clear, educational explanation about: ${prompt}.
          Structure it as:
          1. A brief introduction that states what the topic is and why it matters
          2. 3-5 key points about the topic, explained in simple but precise language
          3. A concise conclusion that summarizes the most important takeaway
          
          Use a direct, single-speaker format as if you're explaining to someone one-on-one.
          Avoid any podcast-specific language (like "welcome to the show" or "see you next time").
          Focus on delivering accurate, useful information in a conversational tone.`,
        },
      ],
    });

    logger.info(
      "generate_script",
      "Script generation initialized successfully"
    );
    return result;
  } catch (error) {
    logger.error("generate_script", "Error generating script", error);
    throw error;
  } finally {
    logger.endTimer(timer);
  }
};

export async function POST(req: Request) {
  const overallTimer = logger.startTimer(
    "api_request",
    "Processing script API request"
  );

  try {
    // Parse request body
    const requestId = crypto.randomUUID();
    logger.info("api_request", `Processing request ${requestId}`, {
      requestId,
    });

    const body = await req.json();
    const { prompt } = body;

    logger.info("api_request", "Request parameters", {
      requestId,
      prompt: prompt
        ? prompt.length > 50
          ? prompt.substring(0, 50) + "..."
          : prompt
        : null,
    });

    if (!prompt) {
      logger.error("api_request", "Missing required parameter: prompt", {
        requestId,
      });
      return NextResponse.json(
        { error: "Missing required parameter: prompt" },
        { status: 400 }
      );
    }

    const scriptResult = await generatePodOverviewScript(prompt);
    logger.info("api_request", "Returning script stream response", {
      requestId,
    });
    return scriptResult.toTextStreamResponse();
  } catch (error) {
    logger.error("api_request", "Error processing request", error);
    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    logger.endTimer(overallTimer);
  }
}
