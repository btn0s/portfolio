import { openai } from "@ai-sdk/openai";
import { streamText, streamObject, generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

// Define the pod action types
type PodAction =
  | "generate_metadata"
  | "search"
  | "generate_script"
  | "generate_cover_image"
  | "generate_audio"
  | "generate_questions"
  | "generate_next_episode";

// Define schemas for the different pod data structures
const podMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedLength: z.string(),
});

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

const questionSchema = z.object({
  question: z.string(),
  relevance: z.string(),
  difficulty: z.string(),
});

const nextEpisodeSchema = z.object({
  title: z.string(),
  description: z.string(),
  rationale: z.string(),
  promptText: z.string(),
});

const audioMetadataSchema = z.object({
  audioUrl: z.string().optional(),
  duration: z.number().optional(),
  format: z.string().optional(),
});

// WEB SEARCH EXAMPLE:
// const result = await generateText({
//     model: openai.responses('gpt-4o-mini'),
//     prompt: 'What happened in San Francisco last week?',
//     tools: {
//       web_search_preview: openai.tools.webSearchPreview({
//         // optional configuration:
//         searchContextSize: 'high',
//         userLocation: {
//           type: 'approximate',
//           city: 'San Francisco',
//           region: 'California',
//         },
//       }),
//     },
//     // Force web search tool:
//     toolChoice: { type: 'tool', toolName: 'web_search_preview' },
//   });

//   // URL sources
//   const sources = result.sources;

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
 * Generates a pod.json object containing metadata for the pod
 * @param prompt - User prompt describing the pod topic
 * @returns JSON object with pod metadata including:
 *  - title: String - Catchy title for the pod
 *  - description: String - Brief description of pod content
 *  - tags: String[] - Relevant topic tags
 *  - difficulty: String - Knowledge level required (beginner/intermediate/advanced)
 *  - estimatedLength: String - Approximate duration in minutes
 */
const generatePodJSON = async (prompt: string) => {
  const timer = logger.startTimer(
    "generate_metadata",
    `Generating podcast metadata for "${prompt}"`
  );

  try {
    logger.info("generate_metadata", "Starting metadata generation", {
      prompt,
    });

    const result = streamObject({
      model: gpt4o,
      schema: podMetadataSchema,
      prompt: `Generate compelling podcast metadata for a podcast about: ${prompt}. 
      Make sure the title is catchy and SEO-friendly.
      Include relevant tags and appropriate difficulty level.
      Estimate length in minutes based on topic complexity.`,
    });

    logger.info(
      "generate_metadata",
      "Metadata generation initialized successfully"
    );
    return result;
  } catch (error) {
    logger.error("generate_metadata", "Error generating metadata", error);
    throw error;
  } finally {
    logger.endTimer(timer);
  }
};

/**
 * Performs a web search to gather relevant information about the pod topic
 * @param prompt - User prompt or pod title to search for
 * @returns Object containing search results with:
 *  - sources: Array of source URLs and snippets
 *  - keyFacts: Array of important facts extracted from search results
 *  - relatedTopics: Array of related topics that might be of interest
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

/**
 * Generates a script for the overview section of the pod
 * @param prompt - User prompt or enriched context from web search
 * @returns String containing a well-structured script with:
 *  - Introduction hook to capture interest
 *  - Core content with logical flow and key points
 *  - Conclusion with summary and next steps
 */
const generatePodOverviewScript = async (prompt: string) => {
  const timer = logger.startTimer(
    "generate_script",
    `Generating podcast script for "${prompt}"`
  );

  try {
    logger.info("generate_script", "Starting script generation", { prompt });

    const result = streamText({
      model: gpt4o,
      messages: [
        {
          role: "system",
          content:
            "You are an expert podcast scriptwriter. Create engaging, well-structured scripts with a captivating introduction, logical content flow, and clear conclusion.",
        },
        {
          role: "user",
          content: `Write a podcast script for a topic about: ${prompt}.
          Structure it with:
          1. A hook/introduction to capture interest
          2. Main content with logical flow and key points
          3. A conclusion with summary and calls to action
          The script should be conversational, engaging, and educational.`,
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

/**
 * Generates a cover image prompt for the pod
 * @param prompt - User prompt or pod title/description
 * @returns String with detailed image generation prompt
 *  - Will later connect to image generation API (DALL-E, etc.)
 */
const generatePodCoverImage = async (prompt: string) => {
  const timer = logger.startTimer(
    "generate_cover_image",
    `Generating cover image prompt for "${prompt}"`
  );

  try {
    logger.info(
      "generate_cover_image",
      "Starting cover image prompt generation",
      { prompt }
    );

    const result = streamText({
      model: gpt4o,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at creating detailed prompts for AI image generation. Create visually compelling, unique cover art prompts for podcasts.",
        },
        {
          role: "user",
          content: `Create a detailed image generation prompt for a podcast cover about: ${prompt}.
          The prompt should describe:
          - Visual style and mood
          - Key elements to include
          - Color palette
          - Composition and focus
          - Any specific artistic influences
          Make it visually interesting and representative of the topic.`,
        },
      ],
    });

    logger.info(
      "generate_cover_image",
      "Cover image prompt generation initialized successfully"
    );
    return result;
  } catch (error) {
    logger.error(
      "generate_cover_image",
      "Error generating cover image prompt",
      error
    );
    throw error;
  } finally {
    logger.endTimer(timer);
  }
};

/**
 * Generates audio for the pod overview using text-to-speech
 * @param prompt - Script text or key points to narrate
 * @returns Object with audio metadata:
 *  - audioUrl: String - URL to generated audio file (placeholder for now)
 *  - duration: Number - Length of audio in seconds (estimated)
 *  - format: String - Audio format (MP3, etc.)
 */
const generatePodOverviewAudio = async (prompt: string) => {
  const timer = logger.startTimer(
    "generate_audio",
    `Generating audio metadata for "${prompt}"`
  );

  try {
    logger.info("generate_audio", "Starting audio metadata generation", {
      prompt,
    });

    // For now, we'll generate metadata about what the audio would be
    // In a future implementation, this would connect to a TTS service
    const result = streamObject({
      model: gpt4o,
      schema: audioMetadataSchema,
      prompt: `Generate metadata for an audio narration of: "${prompt}".
      For now, this is a placeholder that would connect to a text-to-speech service in the future.
      Estimate a reasonable duration based on the content length and complexity.`,
    });

    logger.info(
      "generate_audio",
      "Audio metadata generation initialized successfully"
    );
    return result;
  } catch (error) {
    logger.error("generate_audio", "Error generating audio metadata", error);
    throw error;
  } finally {
    logger.endTimer(timer);
  }
};

/**
 * Generates follow-up questions to encourage deeper exploration
 * @param prompt - Original prompt or full pod content
 * @returns Array of question objects with:
 *  - question: String - The follow-up question text
 *  - relevance: String - Brief explanation of why question matters
 *  - difficulty: String - Relative complexity of the question
 */
const generatePodFollowUpQuestions = async (prompt: string) => {
  const timer = logger.startTimer(
    "generate_questions",
    `Generating follow-up questions for "${prompt}"`
  );

  try {
    logger.info("generate_questions", "Starting questions generation", {
      prompt,
    });

    const result = streamObject({
      model: gpt4o,
      schema: z.array(questionSchema),
      prompt: `Generate insightful follow-up questions about: ${prompt}.
      For each question:
      1. Formulate a clear, thought-provoking question
      2. Explain why exploring this question is relevant or important
      3. Indicate the relative difficulty/complexity of the question
      Create a mix of factual, analytical, and hypothetical questions.`,
    });

    logger.info(
      "generate_questions",
      "Questions generation initialized successfully"
    );
    return result;
  } catch (error) {
    logger.error("generate_questions", "Error generating questions", error);
    throw error;
  } finally {
    logger.endTimer(timer);
  }
};

/**
 * Generates a prompt for the next episode based on current pod
 * @param prompt - Current pod content or user feedback
 * @returns Object with next episode suggestion:
 *  - title: String - Suggested title for next episode
 *  - description: String - Brief outline of proposed content
 *  - rationale: String - Why this is a logical next topic
 *  - promptText: String - Ready-to-use prompt for generating next episode
 */
const generatePodNextEpisodePrompt = async (prompt: string) => {
  const timer = logger.startTimer(
    "generate_next_episode",
    `Generating next episode prompt for "${prompt}"`
  );

  try {
    logger.info(
      "generate_next_episode",
      "Starting next episode prompt generation",
      { prompt }
    );

    const result = streamObject({
      model: gpt4o,
      schema: nextEpisodeSchema,
      prompt: `Based on a podcast about "${prompt}", suggest a logical next episode.
      Provide:
      1. A compelling title for the next episode
      2. A brief description of the proposed content
      3. An explanation of why this is a natural continuation
      4. A ready-to-use prompt that could generate this next episode
      Ensure there's a clear connection between the episodes while expanding the topic.`,
    });

    logger.info(
      "generate_next_episode",
      "Next episode prompt generation initialized successfully"
    );
    return result;
  } catch (error) {
    logger.error(
      "generate_next_episode",
      "Error generating next episode prompt",
      error
    );
    throw error;
  } finally {
    logger.endTimer(timer);
  }
};

export async function POST(req: Request) {
  const overallTimer = logger.startTimer(
    "api_request",
    "Processing API request"
  );

  try {
    // Parse request body
    const requestId = crypto.randomUUID();
    logger.info("api_request", `Processing request ${requestId}`, {
      requestId,
    });

    const body = await req.json();
    const { prompt, action } = body;

    logger.info("api_request", "Request parameters", {
      requestId,
      prompt: prompt
        ? prompt.length > 50
          ? prompt.substring(0, 50) + "..."
          : prompt
        : null,
      action,
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

    if (!action) {
      logger.error("api_request", "Missing required parameter: action", {
        requestId,
      });
      return NextResponse.json(
        { error: "Missing required parameter: action" },
        { status: 400 }
      );
    }

    // Validate action is supported
    const validActions: PodAction[] = [
      "generate_metadata",
      "search",
      "generate_script",
      "generate_cover_image",
      "generate_audio",
      "generate_questions",
      "generate_next_episode",
    ];

    if (!validActions.includes(action as PodAction)) {
      logger.error("api_request", `Invalid action: ${action}`, { requestId });
      return NextResponse.json(
        {
          error: `Invalid action: ${action}. Valid actions are: ${validActions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    logger.info("api_request", `Starting ${action} operation`, { requestId });

    // Each action now returns a streaming response directly
    switch (action as PodAction) {
      case "generate_metadata":
        const metadataResult = await generatePodJSON(prompt);
        logger.info("api_request", "Returning metadata stream response", {
          requestId,
        });
        return metadataResult.toTextStreamResponse();

      case "search":
        const searchResult = await performPodSearch(prompt);
        logger.info("api_request", "Returning search stream response", {
          requestId,
        });
        return searchResult.toTextStreamResponse();

      case "generate_script":
        const scriptResult = await generatePodOverviewScript(prompt);
        logger.info("api_request", "Returning script stream response", {
          requestId,
        });
        return scriptResult.toTextStreamResponse();

      case "generate_cover_image":
        const coverImageResult = await generatePodCoverImage(prompt);
        logger.info("api_request", "Returning cover image stream response", {
          requestId,
        });
        return coverImageResult.toTextStreamResponse();

      case "generate_audio":
        const audioResult = await generatePodOverviewAudio(prompt);
        logger.info("api_request", "Returning audio stream response", {
          requestId,
        });
        return audioResult.toTextStreamResponse();

      case "generate_questions":
        const questionsResult = await generatePodFollowUpQuestions(prompt);
        logger.info("api_request", "Returning questions stream response", {
          requestId,
        });
        return questionsResult.toTextStreamResponse();

      case "generate_next_episode":
        const nextEpisodeResult = await generatePodNextEpisodePrompt(prompt);
        logger.info("api_request", "Returning next episode stream response", {
          requestId,
        });
        return nextEpisodeResult.toTextStreamResponse();

      default:
        logger.error(
          "api_request",
          `Invalid action reached switch statement: ${action}`,
          { requestId }
        );
        throw new Error("Invalid action");
    }
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
