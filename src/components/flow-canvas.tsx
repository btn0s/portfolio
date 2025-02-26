"use client";

import { type SavedNodePosition, saveNodePositions } from "@/app/actions";
import imgSrc from "@/assets/images/playbackbone-home.jpg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
  ReactFlow,
  type ReactFlowProps,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import {
  CheckCircleIcon,
  Grid2x2Icon,
  RotateCcwIcon,
  SaveIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const initialEdges: Edge[] = [];

const BaseCustomNode = ({
  title,
  buttonLabel,
  className,
  children,
}: {
  title?: string;
  buttonLabel?: string;
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border border-border bg-background/90 backdrop-blur-xl rounded shadow p-6 duration-100 group",
        className,
      )}
    >
      {title || buttonLabel ? (
        <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-4 absolute inset-2 justify-center items-center p-6 transition-opacity rounded border border-muted bg-background/90 backdrop-blur-sm">
          {title ? <h2 className="text-center font-bold">{title}</h2> : null}
          {buttonLabel ? (
            <Button onClick={() => {}}>{buttonLabel}</Button>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
};

const ImageNode = ({ dragging }: NodeProps) => {
  return (
    <BaseCustomNode className="p-2 max-w-xs rotate-[1deg]">
      <Image src={imgSrc} alt="img" className="border border-muted rounded" />
    </BaseCustomNode>
  );
};

type ImageStackNode = Node<{ images: { src: string; alt: string }[] }>;

const ImageStackNode = ({ data }: NodeProps<ImageStackNode>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="relative w-[400px] duration-200 p-0 bg-transparent border-0 group"
        onDoubleClick={() => setIsOpen(true)}
      >
        <div className="absolute inset-0 -z-30 group-active:shadow-xl" />
        {/* Fake stacked images in background */}
        <BaseCustomNode className="p-2 bg-background absolute inset-0 -z-20 -rotate-[2deg] group-active:scale-[1.025] delay-200">
          <div className="w-full aspect-video bg-muted rounded border border-border" />
        </BaseCustomNode>
        <BaseCustomNode className="p-2 bg-background absolute inset-0 -z-10 rotate-[3deg] group-active:scale-[1.025] delay-100">
          <div className="w-full aspect-video bg-muted rounded border border-border" />
        </BaseCustomNode>

        {/* Main image */}
        <BaseCustomNode className="p-2 group-hover:scale-[1.01] group-active:shadow duration-200 -rotate-[0deg]">
          <Image
            src={data.images[0].src}
            alt="Project preview"
            className="border border-muted rounded w-full"
          />
        </BaseCustomNode>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-none h-[90vh] bg-background/90 backdrop-blur-3xl border-border">
          <VisuallyHidden asChild>
            <DialogTitle>Project Details</DialogTitle>
          </VisuallyHidden>

          <div className="w-full h-full grid grid-cols-[300px_1fr] gap-8">
            {/* Project Description */}
            <div className="flex flex-col gap-6 p-4">
              <div className="prose prose-sm">
                <h2>Project Title</h2>
                <p>
                  A detailed description of the project, its goals, and the
                  technologies used. This can span multiple lines and include
                  various details about the implementation.
                </p>
              </div>
            </div>

            {/* Gallery Grid */}
            <ScrollArea className="max-h-full">
              <div className="grid grid-cols-2 gap-6 p-4 overflow-y-auto">
                {data.images.map((image, i) => (
                  <motion.div
                    key={`image-${image.src}-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.1,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    <BaseCustomNode className="p-2 h-full">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        className="border border-muted rounded w-full h-full object-cover"
                      />
                    </BaseCustomNode>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const IntroNode = () => {
  return (
    <div className="relative isolate max-w-sm flex flex-col gap-4 text-sm">
      <div className="absolute inset-0 rounded-xl bg-white border border-border blur-xl -z-10" />
      <div className="text-muted-foreground">
        <span>✦</span> bt norris
      </div>
      <h1>
        I'm a self-taught designer and programmer. I build prototypes,
        interfaces, and sometimes games.
      </h1>
      <h2>
        I'm currently <b>Senior Design Engineer</b> at
        <Link href="/roles/backbone" className="underline">
          Backbone
        </Link>
        .
      </h2>
      <h3>
        This site is my workspace, I actively use it in my creative process to
        bring ideas to life outside my
        <Link href="/sketchbook" className="underline">
          sketchbook
        </Link>
      </h3>
    </div>
  );
};

const ToolBar = ({
  config,
  setConfig,
}: {
  config: Partial<ReactFlowProps>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<ReactFlowProps>>>;
}) => {
  const flow = useReactFlow();

  if (process.env.NODE_ENV !== "development") return null;

  const resetNodes = () => {
    flow.setNodes(INITIAL_NODES);
  };

  const handleSavePositions = async () => {
    const nodes = flow.getNodes().map((node) => ({
      id: node.id,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
    }));

    try {
      const result = await saveNodePositions(nodes);

      if (result.success) {
        toast.success("Node positions saved to file");
      } else {
        toast.error(`Failed to save node positions: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving node positions:", error);
      toast.error("Error saving node positions");
    }
  };

  const toggleSnapToGrid = () => {
    setConfig((prevState) => ({
      ...prevState,
      snapToGrid: !prevState.snapToGrid,
    }));
  };

  return (
    <div className="absolute top-6 right-6 flex gap-2 z-50 p-2 border border-border rounded-lg bg-background/90 backdrop-blur-sm">
      <span className="bg-black px-1 font-mono font-medium absolute -top-3 text-xs right-3 text-background">
        DEV TOOLS
      </span>
      <Button onClick={resetNodes} variant="outline" size="sm">
        <RotateCcwIcon className="h-4 w-4" /> Reset Nodes
      </Button>
      <Button onClick={handleSavePositions} variant="outline" size="sm">
        <SaveIcon className="h-4 w-4" /> Save Positions
      </Button>
      <Button onClick={toggleSnapToGrid} variant="outline" size="sm">
        <Grid2x2Icon className="h-4 w-4" />
        {config.snapToGrid ? "Disable Snap" : "Enable Snap"}
      </Button>
    </div>
  );
};

const NODE_TYPES = {
  intro: IntroNode,
  image: ImageNode,
  stack: ImageStackNode,
};

const DEFAULT_NODE_POSITION = { x: 32, y: 32 };

const INITIAL_NODE_POSITIONS: {
  id: string;
  position: { x: number; y: number };
}[] = [
  { id: "1", position: { x: 32, y: 32 } },
  { id: "2", position: { x: 32, y: 256 } },
];

const makeNode = ({ id, type, data }: Pick<Node, "id" | "type" | "data">) => ({
  id,
  type,
  data,
  position:
    INITIAL_NODE_POSITIONS.find((node) => node.id === id)?.position ??
    DEFAULT_NODE_POSITION,
});

const INITIAL_NODES = [
  makeNode({ id: "1", type: "intro", data: {} }),
  makeNode({
    id: "2",
    type: "stack",
    data: {
      images: [
        {
          src: imgSrc,
          alt: "Project image 1",
        },
        {
          src: imgSrc,
          alt: "Project image 2",
        },
        {
          src: imgSrc,
          alt: "Project image 3",
        },
      ],
    },
  }),
];

// Client component that uses React Flow
export default function FlowCanvas({
  savedPositions,
}: {
  savedPositions: SavedNodePosition[];
}) {
  // Apply saved positions to initial nodes if available
  const initialNodesWithSavedPositions = INITIAL_NODES.map((node) => {
    const savedNode = savedPositions.find((n) => n.id === node.id);
    if (savedNode) {
      return {
        ...node,
        position: savedNode.position,
      };
    }
    return node;
  });

  const [nodes, setNodes] = useState<Node[]>(initialNodesWithSavedPositions);
  const [edges, setEdges] = useState(initialEdges);

  // config
  const [config, setConfig] = useState<Partial<ReactFlowProps>>({
    snapToGrid: process.env.NODE_ENV === "development",
    snapGrid: [16, 16],
  });

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  return (
    <div style={{ height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        {...config}
      >
        <ToolBar config={config} setConfig={setConfig} />
        <Controls position="bottom-right" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
