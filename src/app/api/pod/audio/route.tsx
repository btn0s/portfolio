import { NextResponse } from "next/server";
import { OpenAI } from "orate/openai";
import { speak } from "orate";

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
 * Generates audio for the pod overview using text-to-speech
 * @param prompt - Script text to narrate
 * @returns Audio file as a Response with proper headers
 */
const generatePodOverviewAudio = async (prompt: string) => {
  const timer = logger.startTimer(
    "generate_audio",
    `Generating audio for script`
  );

  try {
    logger.info("generate_audio", "Starting audio generation", {
      promptLength: prompt.length,
    });

    const audioFile = await speak({
      model: new OpenAI().tts(),
      prompt: prompt,
    });

    // Convert File to ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();

    logger.info("generate_audio", "Audio generation successful", {
      byteLength: arrayBuffer.byteLength,
    });

    // Return as Response with proper headers
    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    logger.error("generate_audio", "Error generating audio", error);
    throw error;
  } finally {
    logger.endTimer(timer);
  }
};

export async function POST(req: Request) {
  const overallTimer = logger.startTimer(
    "api_request",
    "Processing audio API request"
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
      promptLength: prompt ? prompt.length : 0,
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

    const audioResult = await generatePodOverviewAudio(prompt);
    logger.info("api_request", "Returning audio stream response", {
      requestId,
    });
    return audioResult;
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
