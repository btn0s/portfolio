"use client";

import { useState, useEffect, useRef } from "react";
import { ExperimentHeader } from "@/components/header";
import { useCompletion } from "@ai-sdk/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Pause, Play, Bug, RefreshCcw } from "lucide-react";
import { TextEffect } from "../motion-primitives/text-effect";
import { TextLoop } from "../motion-primitives/text-loop";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { TextShimmer } from "../motion-primitives/text-shimmer";
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
    id: "generate_audio",
    name: "Generate Audio",
    description: "Convert script to audio",
  },
];

const AudioPlayer = ({
  audioUrl,
  metadata,
}: {
  audioUrl: string;
  metadata?: { title: string };
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="flex flex-col gap-2 w-full bg-muted/50 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (audioRef.current) {
                if (isPlaying) {
                  audioRef.current.pause();
                } else {
                  audioRef.current.play();
                }
                setIsPlaying(!isPlaying);
              }
            }}
            disabled={!audioUrl}
            className="h-8 w-8"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          {metadata?.title && (
            <span className="text-sm font-medium truncate">
              {metadata.title}
            </span>
          )}
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        controls
        className="w-full h-8"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
};

type PodInstanceProps = {
  topic: string;
  index: number;
  onComplete?: () => void;
};

const PodInstance = ({ topic, index, onComplete }: PodInstanceProps) => {
  const [activeStep, setActiveStep] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState("Researching topic...");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const instanceId = useRef(`pod-${index}-${Date.now()}`);

  // Map step IDs to TextLoop indices
  const stepToLoopIndex = {
    search: 0,
    generate_script: 1,
    generate_audio: 2,
  };

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Create separate completion hooks for each step with body parameter
  const searchInfo = useCompletion({
    api: "/api/pod/research",
    body: {
      prompt: "",
    },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log(
        `Pod-${instanceId.current}`,
        "searchInfo",
        "Completion received",
        {
          length: completion.length,
        }
      );
      setResults((prev) => ({ ...prev, search: completion }));
      setStatusMessage("Research complete. Generating script...");
      // Move to the next step
      runNextStep("generate_script");
    },
    onError: (error) => {
      clientLogger.error(
        `Pod-${instanceId.current}`,
        "searchInfo",
        error.toString()
      );
      setActiveStep("");
      setStatusMessage("Error during research. Please try again.");
    },
  });

  const generateScript = useCompletion({
    api: "/api/pod/script",
    body: {
      prompt: "",
    },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log(
        `Pod-${instanceId.current}`,
        "generateScript",
        "Completion received",
        {
          length: completion.length,
        }
      );

      // First save the script result
      const scriptContent = completion;
      setResults((prev) => ({ ...prev, generate_script: scriptContent }));
      setStatusMessage("Script complete. Generating audio...");

      // Use a more reliable approach to ensure the script is available for audio
      setTimeout(() => {
        clientLogger.log(
          `Pod-${instanceId.current}`,
          "generateScript",
          "Starting audio generation with script",
          { scriptLength: scriptContent.length }
        );

        // Pass the script directly to the audio generation step
        generateAudio.complete(scriptContent, {
          body: {
            prompt: scriptContent,
          },
        });
      }, 100);
    },
    onError: (error) => {
      clientLogger.error(
        `Pod-${instanceId.current}`,
        "generateScript",
        error.toString()
      );
      setActiveStep("");
      setStatusMessage("Error generating script. Please try again.");
    },
  });

  const generateAudio = useCompletion({
    api: "/api/pod/audio",
    body: {
      prompt: "",
    },
    onResponse: async (response) => {
      if (!response.ok) {
        clientLogger.error(
          `Pod-${instanceId.current}`,
          "generateAudio",
          "Error response",
          {
            status: response.status,
          }
        );
        setActiveStep("");
        setStatusMessage("Error generating audio. Please try again.");
        return;
      }

      try {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        clientLogger.log(
          `Pod-${instanceId.current}`,
          "generateAudio",
          "Audio blob created",
          {
            size: blob.size,
            type: blob.type,
          }
        );

        setResults((prev) => ({
          ...prev,
          generate_audio: url,
        }));

        // Clear active step and update status when finished
        setActiveStep("");
        setStatusMessage("Audio generated successfully!");

        // Notify parent component that generation is complete
        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        clientLogger.error(
          `Pod-${instanceId.current}`,
          "generateAudio",
          "Error processing audio",
          error
        );
        setActiveStep("");
        setStatusMessage("Error processing audio. Please try again.");
      }
    },
    onError: (error) => {
      clientLogger.error(
        `Pod-${instanceId.current}`,
        "generateAudio",
        error.toString()
      );
      setActiveStep("");
      setStatusMessage("Error generating audio. Please try again.");
    },
  });

  // Map step IDs to their respective completion hooks
  const stepHandlers = {
    search: searchInfo,
    generate_script: generateScript,
    generate_audio: generateAudio,
  };

  // Run a specific step in the process
  const runNextStep = (currentStep: string) => {
    clientLogger.log(
      `Pod-${instanceId.current}`,
      "runNextStep",
      `Starting step: ${currentStep}`,
      {
        topic,
        currentResults: Object.keys(results),
      }
    );

    setActiveStep(currentStep);

    const handler = stepHandlers[currentStep as keyof typeof stepHandlers];
    if (handler) {
      clientLogger.log(
        `Pod-${instanceId.current}`,
        "runNextStep",
        `Calling complete method for step: ${currentStep}`
      );

      try {
        // Handle script parameter for audio generation
        if (currentStep === "generate_audio") {
          if (!results.generate_script) {
            clientLogger.error(
              `Pod-${instanceId.current}`,
              "runNextStep",
              "Cannot generate audio without a script",
              { availableResults: Object.keys(results) }
            );
            setActiveStep("");
            setStatusMessage(
              "Error: No script available for audio generation."
            );
            return;
          }

          const audioPrompt = results.generate_script;
          clientLogger.log(
            `Pod-${instanceId.current}`,
            "runNextStep",
            "Generating audio with script",
            { scriptLength: audioPrompt.length }
          );

          // The complete method expects the prompt as the first parameter
          generateAudio.complete(audioPrompt, {
            body: {
              prompt: audioPrompt,
            },
          });
          return;
        }

        // For search and script steps - pass the topic as the prompt
        if (currentStep === "search") {
          searchInfo.complete(topic, {
            body: {
              prompt: topic,
            },
          });
        } else if (currentStep === "generate_script") {
          generateScript.complete(topic, {
            body: {
              prompt: topic,
            },
          });
        }
      } catch (error) {
        clientLogger.error(
          `Pod-${instanceId.current}`,
          "runNextStep",
          `Error calling complete for step: ${currentStep}`,
          error
        );
        setActiveStep("");
        setStatusMessage(`Error during ${currentStep}. Please try again.`);
      }
    }
  };

  // Start the generation process automatically when the component mounts
  useEffect(() => {
    clientLogger.log(
      `Pod-${instanceId.current}`,
      "initialize",
      `Starting generation for topic: ${topic}`
    );
    runNextStep("search");
  }, [topic]);

  const isComplete = results.generate_audio;

  return (
    <div className="flex flex-col bg-muted/50 p-4 rounded-lg w-full max-w-3xl gap-4 mb-4">
      <div className="flex items-center justify-between gap-12">
        <div className="flex flex-col">
          <h2 className="font-medium truncate">{topic}</h2>
          {!results.generate_audio && activeStep && (
            <TextLoop
              className="text-xs text-muted-foreground"
              interval={99999} // Very long interval so it doesn't auto-change
              trigger={false} // Disable automatic animation
              currentIndex={
                stepToLoopIndex[activeStep as keyof typeof stepToLoopIndex] || 0
              }
            >
              <span>Starting up...</span>
              <TextShimmer>Researching topic...</TextShimmer>
              <TextShimmer>Generating script...</TextShimmer>
              <TextShimmer>Converting to audio...</TextShimmer>
            </TextLoop>
          )}
          {!activeStep && isComplete && (
            <span className="text-xs text-muted-foreground">Complete</span>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {results.generate_audio && (
            <audio
              ref={audioRef}
              src={results.generate_audio}
              controls
              className="shrink-0 h-8"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
          {isComplete && (
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
              <RefreshCcw className="h-4 w-4" />
              <span className="sr-only">Regenerate</span>
            </Button>
          )}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
              >
                <Bug className="h-4 w-4" />
                <span className="sr-only">Debug</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  Debug: Generated Content for "{topic}"
                </DrawerTitle>
                <DrawerDescription>
                  View the raw generated content for each step
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Research</h3>
                  <div className="whitespace-pre-wrap font-mono text-xs bg-muted p-4 rounded max-h-[200px] overflow-auto">
                    {results.search || "Not generated yet"}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Script</h3>
                  <div className="whitespace-pre-wrap font-mono text-xs bg-muted p-4 rounded max-h-[200px] overflow-auto">
                    {results.generate_script || "Not generated yet"}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Audio</h3>
                  <div className="bg-muted p-4 rounded">
                    {results.generate_audio
                      ? "Audio generated successfully"
                      : "Not generated yet"}
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
};

const PodWidget = () => {
  const [topic, setTopic] = useState("");
  const [pods, setPods] = useState<{ id: number; topic: string }[]>([]);
  const [nextPodId, setNextPodId] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Starts the pod generation process
  const startPodGeneration = () => {
    if (!topic || isGenerating) return;

    clientLogger.log(
      "PodWidget",
      "startPodGeneration",
      `Creating new pod for topic: ${topic}`
    );

    // Add a new pod with the current topic
    setPods((prev) => [{ id: nextPodId, topic }, ...prev]);
    setNextPodId((prev) => prev + 1);
    setIsGenerating(true);

    // Clear the topic for next input
    setTopic("");
  };

  const handlePodComplete = () => {
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startPodGeneration();
        }}
        className="flex gap-2 sticky top-0 bg-background p-4 rounded-lg border shadow-sm z-10"
      >
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic for your pod..."
          autoFocus
        />
        <Button type="submit" disabled={!topic || isGenerating}>
          {isGenerating ? "Generating..." : "Generate Pod"}
        </Button>
      </form>

      <div className="space-y-0">
        {pods.map((pod, index) => (
          <PodInstance
            key={pod.id}
            topic={pod.topic}
            index={pod.id}
            onComplete={index === 0 ? handlePodComplete : undefined}
          />
        ))}
      </div>
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
