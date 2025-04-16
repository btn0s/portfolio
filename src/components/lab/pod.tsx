"use client";

import { useState, useEffect, useRef } from "react";
import { ExperimentHeader } from "@/components/header";
import { useCompletion } from "@ai-sdk/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Pause,
  Play,
  Bug,
  RefreshCcw,
  MoreVertical,
  Trash,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Types
type PodResult = Record<string, string>;
type PodData = {
  id: number;
  topic: string;
  results?: PodResult;
};
type StepId = "search" | "generate_script" | "generate_audio";
type StepHandler = ReturnType<typeof useCompletion>;

// Define the steps in the pod generation process
const POD_STEPS: Array<{
  id: StepId;
  name: string;
  description: string;
}> = [
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

// Map step IDs to TextLoop indices
const STEP_TO_LOOP_INDEX: Record<StepId, number> = {
  search: 0,
  generate_script: 1,
  generate_audio: 2,
};

// Constants for localStorage
const STORAGE_KEYS = {
  PODS: "saved-pods",
  NEXT_ID: "saved-next-pod-id",
};

// Storage utilities
const storageUtils = {
  savePods: (pods: PodData[], nextId: number): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PODS, JSON.stringify(pods));
      localStorage.setItem(STORAGE_KEYS.NEXT_ID, nextId.toString());
      clientLogger.log(
        "storageUtils",
        "savePods",
        `Saved ${pods.length} pods to localStorage`
      );
    } catch (error) {
      clientLogger.error(
        "storageUtils",
        "savePods",
        "Failed to save pods to localStorage",
        error
      );
    }
  },

  loadPods: (): { pods: PodData[]; nextId: number } => {
    const defaultReturn = { pods: [], nextId: 1 };

    try {
      const savedPods = localStorage.getItem(STORAGE_KEYS.PODS);
      const savedNextId = localStorage.getItem(STORAGE_KEYS.NEXT_ID);

      const pods = savedPods ? JSON.parse(savedPods) : [];
      const nextId = savedNextId ? parseInt(savedNextId, 10) : 1;

      clientLogger.log(
        "storageUtils",
        "loadPods",
        `Loaded ${pods.length} pods from localStorage`
      );

      return { pods, nextId };
    } catch (error) {
      clientLogger.error(
        "storageUtils",
        "loadPods",
        "Failed to load from localStorage",
        error
      );
      return defaultReturn;
    }
  },
};

// Utilities for handling blob URLs
const blobUtils = {
  revokeUrls: (urls: string[], instanceId: string): void => {
    urls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
        clientLogger.log(
          instanceId,
          "cleanup",
          `Revoked blob URL: ${url.substring(0, 30)}...`
        );
      } catch (error) {
        clientLogger.error(
          instanceId,
          "cleanup",
          `Failed to revoke URL: ${url.substring(0, 30)}...`,
          error
        );
      }
    });
  },

  createUrl: (blob: Blob, urls: string[]): string => {
    const url = URL.createObjectURL(blob);
    urls.push(url);
    return url;
  },

  // Convert blob to base64 for storage
  blobToBase64: (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  // Convert base64 back to blob URL for use
  base64ToUrl: (base64: string, urls: string[]): string => {
    try {
      // Extract actual data from data URL
      const parts = base64.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || "audio/mpeg";
      const binStr = atob(parts[1]);
      const arr = new Uint8Array(binStr.length);

      for (let i = 0; i < binStr.length; i++) {
        arr[i] = binStr.charCodeAt(i);
      }

      const blob = new Blob([arr], { type: mime });
      return blobUtils.createUrl(blob, urls);
    } catch (error) {
      clientLogger.error(
        "blobUtils",
        "base64ToUrl",
        "Error converting base64 to blob URL",
        error
      );
      return "";
    }
  },
};

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
  savedResults?: PodResult;
  onComplete?: (results: PodResult) => void;
};

const PodInstance = ({
  topic,
  index,
  savedResults,
  onComplete,
  onDelete,
}: PodInstanceProps & {
  onDelete?: () => void;
}) => {
  const [activeStep, setActiveStep] = useState<StepId | "">("");
  const [results, setResults] = useState<PodResult>({});
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const instanceId = useRef(`pod-${index}-${Date.now()}`);
  const blobUrlsRef = useRef<string[]>([]);
  const stepHandlersRef = useRef<Record<StepId, StepHandler>>(
    {} as Record<StepId, StepHandler>
  );

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load saved results and convert base64 audio to blob URL
  useEffect(() => {
    if (savedResults) {
      setResults(savedResults);

      // If there's base64 audio data, convert it to a blob URL for playback
      if (
        savedResults.generate_audio &&
        savedResults.generate_audio.startsWith("data:")
      ) {
        const url = blobUtils.base64ToUrl(
          savedResults.generate_audio,
          blobUrlsRef.current
        );
        setAudioUrl(url);

        clientLogger.log(
          instanceId.current,
          "initialize",
          "Converted base64 audio to blob URL",
          { urlLength: url.length }
        );
      }
    }
  }, [savedResults]);

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      blobUtils.revokeUrls(blobUrlsRef.current, instanceId.current);
    };
  }, []);

  // Helper function to handle errors consistently
  const handleError = (step: string, message: string, errorData?: any) => {
    clientLogger.error(instanceId.current, step, message, errorData);
    setActiveStep("");
  };

  // Declare function to run the next step (needed for search/script hooks)
  const runNextStep = (currentStep: StepId) => {
    clientLogger.log(
      instanceId.current,
      "runNextStep",
      `Starting step: ${currentStep}`,
      { topic, currentResults: Object.keys(results) }
    );

    setActiveStep(currentStep);

    const handler = stepHandlersRef.current[currentStep];
    if (!handler) return;

    try {
      // Handle script parameter for audio generation
      if (currentStep === "generate_audio") {
        if (!results.generate_script) {
          handleError("runNextStep", "Cannot generate audio without a script", {
            availableResults: Object.keys(results),
          });
          return;
        }

        const audioPrompt = results.generate_script;
        clientLogger.log(
          instanceId.current,
          "runNextStep",
          "Generating audio with script",
          { scriptLength: audioPrompt.length }
        );

        handler.complete(audioPrompt, {
          body: { prompt: audioPrompt },
        });
        return;
      }

      // For search and script steps
      const prompt =
        currentStep === "search" || currentStep === "generate_script"
          ? topic
          : "";
      handler.complete(prompt, {
        body: { prompt },
      });
    } catch (error) {
      handleError(
        "runNextStep",
        `Error calling complete for step: ${currentStep}`,
        error
      );
    }
  };

  // Function to create the audio completion hook
  const generateAudio = useCompletion({
    api: "/api/pod/audio",
    body: { prompt: "" },
    onResponse: async (response) => {
      if (!response.ok) {
        handleError("generateAudio", "Error response", {
          status: response.status,
        });
        return;
      }

      try {
        const blob = await response.blob();

        // Create temporary URL for current session playback
        const url = blobUtils.createUrl(blob, blobUrlsRef.current);
        setAudioUrl(url);

        // Convert to base64 for storage
        const base64AudioData = await blobUtils.blobToBase64(blob);

        clientLogger.log(
          instanceId.current,
          "generateAudio",
          "Audio blob converted to base64",
          {
            blobSize: blob.size,
            type: blob.type,
            base64Length: base64AudioData.length,
          }
        );

        // Update results with the base64 audio data for storage
        const updatedResults = {
          ...results,
          generate_audio: base64AudioData,
        };

        setResults(updatedResults);
        setActiveStep("");

        // Notify parent component that generation is complete
        onComplete?.(updatedResults);
      } catch (error) {
        handleError("generateAudio", "Error processing audio", error);
      }
    },
    onError: (error) => handleError("generateAudio", error.toString()),
  });

  // Create completion hooks for each step
  const searchInfo = useCompletion({
    api: "/api/pod/research",
    body: { prompt: "" },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log(
        instanceId.current,
        "searchInfo",
        "Completion received",
        { length: completion.length }
      );
      setResults((prev) => ({ ...prev, search: completion }));
      runNextStep("generate_script");
    },
    onError: (error) => {
      clientLogger.error(instanceId.current, "searchInfo", error.toString());
      setActiveStep("");
    },
  });

  const generateScript = useCompletion({
    api: "/api/pod/script",
    body: { prompt: "" },
    streamProtocol: "text",
    onFinish: (_, completion) => {
      clientLogger.log(
        instanceId.current,
        "generateScript",
        "Completion received",
        { length: completion.length }
      );

      const scriptContent = completion;
      setResults((prev) => ({ ...prev, generate_script: scriptContent }));

      setTimeout(() => {
        clientLogger.log(
          instanceId.current,
          "generateScript",
          "Starting audio generation with script",
          { scriptLength: scriptContent.length }
        );

        generateAudio.complete(scriptContent, {
          body: { prompt: scriptContent },
        });
      }, 100);
    },
    onError: (error) => {
      clientLogger.error(
        instanceId.current,
        "generateScript",
        error.toString()
      );
      setActiveStep("");
    },
  });

  // Update the stepHandlers ref
  useEffect(() => {
    stepHandlersRef.current = {
      search: searchInfo,
      generate_script: generateScript,
      generate_audio: generateAudio,
    };
  }, [searchInfo, generateScript, generateAudio]);

  // Reset instance and start generation
  const handleRegenerate = () => {
    clientLogger.log(
      instanceId.current,
      "regenerate",
      "Regenerating pod for topic",
      { topic }
    );

    setResults({});
    setAudioUrl("");
    setActiveStep("");

    setTimeout(() => {
      runNextStep("search");
    }, 100);
  };

  // Skip generation if we already have saved results
  useEffect(() => {
    if (savedResults?.generate_audio) {
      clientLogger.log(
        instanceId.current,
        "initialize",
        "Using saved results, skipping generation",
        { topic }
      );
      setActiveStep("");
    } else {
      clientLogger.log(
        instanceId.current,
        "initialize",
        `Starting generation for topic: ${topic}`
      );
      runNextStep("search");
    }
  }, [topic, savedResults]);

  const isComplete = Boolean(results.generate_audio);

  return (
    <div className="flex flex-col bg-muted/50 p-4 rounded-lg w-full max-w-3xl gap-4 mb-4">
      <div className="flex items-center justify-between gap-12">
        <div className="flex flex-col">
          <h2 className="font-medium truncate">{topic}</h2>
          {!results.generate_audio && activeStep && (
            <TextLoop
              className="text-xs text-muted-foreground"
              interval={99999}
              trigger={false}
              currentIndex={
                activeStep ? STEP_TO_LOOP_INDEX[activeStep] || 0 : 0
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
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="shrink-0 h-8"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isComplete && (
                <DropdownMenuItem onClick={handleRegenerate}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setIsDrawerOpen(true)}>
                <Bug className="h-4 w-4 mr-2" />
                Debug
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
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
  const [pods, setPods] = useState<PodData[]>([]);
  const [nextPodId, setNextPodId] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load pods from localStorage on mount
  useEffect(() => {
    const { pods, nextId } = storageUtils.loadPods();
    setPods(pods);
    setNextPodId(nextId);
  }, []);

  // Save a pod's results to localStorage
  const savePodToStorage = (podId: number, podResults: PodResult) => {
    const updatedPods = pods.map((pod) =>
      pod.id === podId ? { ...pod, results: podResults } : pod
    );

    setPods(updatedPods);
    storageUtils.savePods(updatedPods, nextPodId);
  };

  // Delete a pod
  const deletePod = (podId: number) => {
    clientLogger.log(
      "PodWidget",
      "deletePod",
      `Deleting pod with ID: ${podId}`
    );

    const updatedPods = pods.filter((pod) => pod.id !== podId);
    setPods(updatedPods);
    storageUtils.savePods(updatedPods, nextPodId);
  };

  // Starts the pod generation process
  const startPodGeneration = () => {
    if (!topic || isGenerating) return;

    clientLogger.log(
      "PodWidget",
      "startPodGeneration",
      `Creating new pod for topic: ${topic}`
    );

    // Create the new pod
    const newPodId = nextPodId;
    const newPod = { id: newPodId, topic };

    // Update state with the new pod
    const updatedPods = [newPod, ...pods];
    setPods(updatedPods);

    // Save to localStorage immediately
    storageUtils.savePods(updatedPods, newPodId + 1);

    // Update next ID after saving
    setNextPodId(newPodId + 1);
    setIsGenerating(true);

    // Clear the topic for next input
    setTopic("");
  };

  const handlePodComplete = (podId: number, results: PodResult) => {
    setIsGenerating(false);
    savePodToStorage(podId, results);
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
            savedResults={pod.results}
            onComplete={(results) =>
              index === 0 ? handlePodComplete(pod.id, results) : undefined
            }
            onDelete={() => deletePod(pod.id)}
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
