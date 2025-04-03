"use client";

import { useState, useEffect } from "react";
import { ExperimentHeader } from "@/components/header";
import { useCompletion } from "@ai-sdk/react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// Pod is a personal curiosity bot. I want to be able to take any subject, and generate a short episode "audio overview" like NotebookLM.
// Then I'd like to be able to ask follow-up questions or generate the next episode for progressive learning and depth.
// Eventually I'd add some "style/depth" params so I can get ELI5 or more technical, save these as defaults but be able to override.

// TODO:
// - POC prompt -> search
// - POC pod.json ("show"/topic metadata schema)
// - POC overview script generation (pod.json -> overview-script)
// - POC cover image generation (pod.json -> cover-image)
// - POC overview audio generation (pod.json -> overview-audio)
// - POC follow-up questions suggestion generation (pod.json -> follow-up-questions)
// - POC next episode default prompt generation (pod.json -> next-episode-prompt)
// - POC player for audio

// NOTE: for "generate next episode" we just start over using the pod.json and the next-episode-prompt. Same for any of the follow-ups, as they just act as a "next episode" override.

// TECH:
// - shadcn/ui for components
// - tailwindcss for styling
// - vercel ai sdk for LLMs (pod.json, scripts, search, audio, image) (we will need different providers for this)

// PROVIDERS:
// - openai GPT 4o for text, json, images, audio, web search
// - future: play.ai for audio

// API IS IN /app/api/pod/route.ts

// Client-side logger
const clientLogger = {
  log: (component: string, action: string, message: string, data?: any) => {
    console.log(
      `%c [${component}] ${action}: ${message}`,
      "color: #3b82f6; font-weight: bold;",
      data ? data : ""
    );
  },
  error: (component: string, action: string, message: string, error?: any) => {
    console.error(
      `%c [${component}] ERROR - ${action}: ${message}`,
      "color: #ef4444; font-weight: bold;",
      error ? error : ""
    );
  },
  warn: (component: string, action: string, message: string, data?: any) => {
    console.warn(
      `%c [${component}] WARN - ${action}: ${message}`,
      "color: #f59e0b; font-weight: bold;",
      data ? data : ""
    );
  },
};

// Define the steps in the pod generation process
const POD_STEPS = [
  {
    id: "generate_metadata",
    name: "Generate Metadata",
    description: "Create podcast metadata",
  },
  {
    id: "search",
    name: "Research",
    description: "Search for relevant information",
  },
  {
    id: "generate_script",
    name: "Generate Script",
    description: "Create podcast script",
  },
  {
    id: "generate_cover_image",
    name: "Cover Image",
    description: "Generate cover image prompt",
  },
  {
    id: "generate_audio",
    name: "Audio Overview",
    description: "Generate audio metadata",
  },
  {
    id: "generate_questions",
    name: "Follow-up Questions",
    description: "Create follow-up questions",
  },
  {
    id: "generate_next_episode",
    name: "Next Episode",
    description: "Suggest the next episode",
  },
];

const PodWidget = () => {
  const [topic, setTopic] = useState("");
  const [activeStep, setActiveStep] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Log component initialization
  useEffect(() => {
    clientLogger.log("PodWidget", "initialize", "Component initialized");
    return () => {
      clientLogger.log("PodWidget", "cleanup", "Component unmounted");
    };
  }, []);

  // Create separate completion hooks for each step with body parameter
  const generateMetadata = useCompletion({
    api: "/api/pod",
    body: {
      action: "generate_metadata",
    },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log("generateMetadata", "onFinish", "Completion received", {
        length: completion.length,
      });
      setResults((prev) => ({ ...prev, generate_metadata: completion }));
      runNextStep("search");
    },
    onError: (error) => {
      clientLogger.error(
        "generateMetadata",
        "onError",
        "Error during completion",
        error
      );
    },
    onResponse: (response) => {
      clientLogger.log(
        "generateMetadata",
        "onResponse",
        `Response status: ${response.status}`
      );
    },
  });

  const searchInfo = useCompletion({
    api: "/api/pod",
    body: {
      action: "search",
    },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log("searchInfo", "onFinish", "Completion received", {
        length: completion.length,
      });
      setResults((prev) => ({ ...prev, search: completion }));
      runNextStep("generate_script");
    },
    onError: (error) => {
      clientLogger.error(
        "searchInfo",
        "onError",
        "Error during completion",
        error
      );
    },
  });

  const generateScript = useCompletion({
    api: "/api/pod",
    body: {
      action: "generate_script",
    },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log("generateScript", "onFinish", "Completion received", {
        length: completion.length,
      });
      setResults((prev) => ({ ...prev, generate_script: completion }));
      runNextStep("generate_cover_image");
    },
    onError: (error) => {
      clientLogger.error(
        "generateScript",
        "onError",
        "Error during completion",
        error
      );
    },
  });

  const generateCoverImage = useCompletion({
    api: "/api/pod",
    body: {
      action: "generate_cover_image",
    },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log(
        "generateCoverImage",
        "onFinish",
        "Completion received",
        { length: completion.length }
      );
      setResults((prev) => ({ ...prev, generate_cover_image: completion }));
      runNextStep("generate_audio");
    },
    onError: (error) => {
      clientLogger.error(
        "generateCoverImage",
        "onError",
        "Error during completion",
        error
      );
    },
  });

  const generateAudio = useCompletion({
    api: "/api/pod",
    body: {
      action: "generate_audio",
    },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log("generateAudio", "onFinish", "Completion received", {
        length: completion.length,
      });
      setResults((prev) => ({ ...prev, generate_audio: completion }));
      runNextStep("generate_questions");
    },
    onError: (error) => {
      clientLogger.error(
        "generateAudio",
        "onError",
        "Error during completion",
        error
      );
    },
  });

  const generateQuestions = useCompletion({
    api: "/api/pod",
    body: {
      action: "generate_questions",
    },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log("generateQuestions", "onFinish", "Completion received", {
        length: completion.length,
      });
      setResults((prev) => ({ ...prev, generate_questions: completion }));
      runNextStep("generate_next_episode");
    },
    onError: (error) => {
      clientLogger.error(
        "generateQuestions",
        "onError",
        "Error during completion",
        error
      );
    },
  });

  const generateNextEpisode = useCompletion({
    api: "/api/pod",
    body: {
      action: "generate_next_episode",
    },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log(
        "generateNextEpisode",
        "onFinish",
        "Completion received",
        { length: completion.length }
      );
      setResults((prev) => ({ ...prev, generate_next_episode: completion }));
      setActiveStep("");
    },
    onError: (error) => {
      clientLogger.error(
        "generateNextEpisode",
        "onError",
        "Error during completion",
        error
      );
    },
  });

  // Map step IDs to their respective completion hooks
  const stepHandlers = {
    generate_metadata: generateMetadata,
    search: searchInfo,
    generate_script: generateScript,
    generate_cover_image: generateCoverImage,
    generate_audio: generateAudio,
    generate_questions: generateQuestions,
    generate_next_episode: generateNextEpisode,
  };

  // Starts the pod generation process
  const startPodGeneration = () => {
    if (!topic) return;

    clientLogger.log(
      "PodWidget",
      "startPodGeneration",
      `Starting generation with topic: ${topic}`
    );

    // Reset previous results
    setResults({});

    // Start with the first step
    runNextStep("generate_metadata");

    // Expand the first accordion item
    setExpandedItems(["generate_metadata"]);
  };

  // Run a specific step in the process
  const runNextStep = (stepId: string) => {
    if (!topic || !stepId) return;

    clientLogger.log("PodWidget", "runNextStep", `Starting step: ${stepId}`, {
      topic,
    });

    setActiveStep(stepId);
    setExpandedItems([stepId]);

    const handler = stepHandlers[stepId as keyof typeof stepHandlers];
    if (handler) {
      clientLogger.log(
        "PodWidget",
        "runNextStep",
        `Calling complete method for step: ${stepId}`
      );
      try {
        // We don't need to reset the completion here
        handler.complete(topic);
      } catch (error) {
        clientLogger.error(
          "PodWidget",
          "runNextStep",
          `Error calling complete for step: ${stepId}`,
          error
        );
      }
    } else {
      clientLogger.warn(
        "PodWidget",
        "runNextStep",
        `No handler found for step: ${stepId}`
      );
    }
  };

  // Check if a step is currently loading
  const isStepLoading = (stepId: string) => {
    const handler = stepHandlers[stepId as keyof typeof stepHandlers];
    const isLoading = activeStep === stepId && handler?.isLoading;
    return isLoading;
  };

  // Get the completion for a specific step
  const getStepCompletion = (stepId: string) => {
    // First check if we have a saved result for this step
    if (results[stepId]) {
      return results[stepId];
    }

    // If this is the active step, return its current streaming completion
    if (activeStep === stepId) {
      const handler = stepHandlers[stepId as keyof typeof stepHandlers];
      if (handler?.completion) {
        return handler.completion;
      }
    }

    // Otherwise return empty string
    return "";
  };

  return (
    <div className="flex flex-col border p-6 w-full max-w-3xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startPodGeneration();
        }}
        className="flex gap-2 mb-6"
      >
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic for your pod..."
          autoFocus
        />
        <Button type="submit" disabled={!topic || activeStep !== ""}>
          {activeStep ? "Generating..." : "Generate Pod"}
        </Button>
      </form>

      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={(values) => {
          clientLogger.log(
            "Accordion",
            "onValueChange",
            `Accordion values changed`,
            values
          );
          setExpandedItems(values);
        }}
        className="w-full"
      >
        {POD_STEPS.map((step) => (
          <AccordionItem
            key={step.id}
            value={step.id}
            disabled={isStepLoading(step.id) || !getStepCompletion(step.id)}
          >
            <AccordionTrigger>{step.name}</AccordionTrigger>
            <AccordionContent>
              <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded">
                {getStepCompletion(step.id) ||
                  (expandedItems.includes(step.id) &&
                  !getStepCompletion(step.id)
                    ? "Waiting to generate..."
                    : "Not generated yet")}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

const Pod = () => {
  useEffect(() => {
    clientLogger.log("Pod", "mount", "Pod component mounted");
    return () => {
      clientLogger.log("Pod", "unmount", "Pod component unmounted");
    };
  }, []);

  return (
    <>
      <ExperimentHeader />
      <div className="flex flex-col items-center justify-center min-h-screen py-12 not-prose">
        <PodWidget />
      </div>
    </>
  );
};

export default Pod;
