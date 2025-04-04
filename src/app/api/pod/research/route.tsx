import { openai } from "@ai-sdk/openai";
import { streamObject, generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

const gpt4o = openai("gpt-4o");

// Define schema for search results
const searchResultSchema = z.object({
  sources: z.array(
    z.object({
      url: z.string(),
      snippet: z.string(),
    })
  ),
  keyFacts: z.array(z.string()),
  relatedTopics: z.array(z.string()),
});

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
 * Performs a web search to gather relevant information about the pod topic
 * @param prompt - User prompt or pod title to search for
 * @returns Object containing search results with sources, key facts, and related topics
 */
const performPodSearch = async (prompt: string) => {
  const timer = logger.startTimer(
    "search",
    `Performing web search for "${prompt}"`
  );

  try {
    logger.info("search", "Starting web search", { prompt });

    // Use generateText with web search capability
    logger.info("search", "Initiating web search with OpenAI");
    const searchTimer = logger.startTimer("search_web", "Web search request");

    const result = await generateText({
      model: openai.responses("gpt-4o-mini"),
      prompt: `Research and gather information about: ${prompt}`,
      tools: {
        web_search_preview: openai.tools.webSearchPreview({
          searchContextSize: "high",
        }),
      },
      toolChoice: { type: "tool", toolName: "web_search_preview" },
    });

    const searchDuration = logger.endTimer(searchTimer);
    logger.info("search", "Web search completed", {
      duration: searchDuration,
      sourceCount: result.sources?.length || 0,
    });

    // Process search results and convert to structured format
    logger.info("search", "Processing search results", {
      sources: result.sources?.length || 0,
    });

    const structureTimer = logger.startTimer(
      "structure_search",
      "Structuring search results"
    );

    const structured = streamObject({
      model: gpt4o,
      schema: searchResultSchema,
      prompt: `Based on the following search results about "${prompt}", generate a structured response:
      ${JSON.stringify(result.sources || [])}
      Include the most important sources, key facts, and related topics worth exploring.`,
    });

    logger.endTimer(structureTimer);
    logger.info("search", "Search results processing initialized successfully");

    return structured;
  } catch (error) {
    logger.error("search", "Error performing search", error);
    throw error;
  } finally {
    logger.endTimer(timer);
  }
};

export async function POST(req: Request) {
  const overallTimer = logger.startTimer(
    "api_request",
    "Processing research API request"
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

    const searchResult = await performPodSearch(prompt);
    logger.info("api_request", "Returning search stream response", {
      requestId,
    });
    return searchResult.toTextStreamResponse();
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
