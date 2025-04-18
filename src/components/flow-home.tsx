"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeTypes,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import SimpleContentNode from "./simple-content-node";
import WorkCardNode from "./work-card-node";
import StickerStackNode from "./sticker-stack-node";
import { WorkCardProps } from "@/components/work-card";
import FlowDevPanel from "./flow-dev-panel";
import { Toaster } from "sonner";

// Define the initial node(s) - we'll generate these dynamically later
// Base intro node definition
const introNode: Node = {
  id: "intro-text",
  type: "simpleContentNode",
  position: { x: 50, y: 50 },
  data: {
    textContent:
      "I'm a designer and programmer interested in games, tools, artificial intelligence, and driven by the joy of discovery.",
  },
};

const initialEdges: Edge[] = [];

// Define node types for React Flow
const nodeTypes: NodeTypes = {
  simpleContentNode: SimpleContentNode,
  workCardNode: WorkCardNode,
  stickerStackNode: StickerStackNode,
};

// Define props for the FlowHome component
interface FlowHomeProps {
  featuredWork: WorkCardProps[];
  featuredLab: WorkCardProps[];
}

// Create a type that extends Record<string, unknown> to fix Node compatibility
type FlowNodeData = WorkCardProps & Record<string, unknown>;

function generateInitialNodes(
  featuredWork: WorkCardProps[],
  featuredLab: WorkCardProps[],
  centerX: number
) {
  const cardWidth = 300;
  const cardHeightEstimate = 350;
  const paddingX = 30;
  const paddingY = 40;
  const startY = 200;

  return [
    {
      ...introNode,
      position: { x: centerX, y: 50 },
    },
    ...featuredWork.map((work, index) => {
      // Determine if this should be a sticker stack node
      const nodeType = work.stickerPaths ? "stickerStackNode" : "workCardNode";

      return {
        id: `work-${work.slug}`,
        type: nodeType,
        position: {
          x:
            centerX +
            (index % 2 ? cardWidth + paddingX : -cardWidth - paddingX),
          y: startY + Math.floor(index / 2) * (cardHeightEstimate + paddingY),
        },
        data: work as FlowNodeData,
      };
    }),
    ...featuredLab.map((lab, index) => {
      const workRows = Math.ceil(featuredWork.length / 2);
      const labStartY =
        startY + workRows * (cardHeightEstimate + paddingY) + paddingY * 2;
      const isEven = index % 2 === 0;

      // Determine if this should be a sticker stack node
      const nodeType = lab.stickerPaths ? "stickerStackNode" : "workCardNode";

      return {
        id: `lab-${lab.slug}`,
        type: nodeType,
        position: {
          x: centerX + (isEven ? -cardWidth / 2 : cardWidth / 2),
          y:
            labStartY + Math.floor(index / 2) * (cardHeightEstimate + paddingY),
        },
        data: lab as FlowNodeData,
      };
    }),
  ];
}

function mergeNodesWithSavedState(
  currentNodes: Node[],
  savedNodes: Node[]
): Node[] {
  return currentNodes.map((node) => {
    const savedNode = savedNodes.find((n) => n.id === node.id);
    if (savedNode) {
      // Keep the saved position but use current data
      const mergedData = { ...node.data };

      // If this is a sticker stack node, preserve the transforms
      if (
        node.type === "stickerStackNode" &&
        savedNode.data?.stickerTransforms
      ) {
        mergedData.stickerTransforms = savedNode.data.stickerTransforms;
      }

      return {
        ...node,
        position: savedNode.position,
        data: mergedData,
      };
    }
    return node;
  });
}

function Flow({ featuredWork, featuredLab }: FlowHomeProps) {
  const centerX =
    typeof window !== "undefined" ? window.innerWidth / 2 - 150 : 0;
  const { setViewport } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    generateInitialNodes(featuredWork, featuredLab, centerX)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Load saved state in dev mode
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      fetch("/api/flow-state")
        .then((res) => res.json())
        .then((state) => {
          if (state.nodes) {
            // Merge saved positions with current content
            const mergedNodes = mergeNodesWithSavedState(
              generateInitialNodes(featuredWork, featuredLab, centerX),
              state.nodes
            );
            setNodes(mergedNodes);
          }
          if (state.viewport) {
            setViewport(state.viewport);
          }
        })
        .catch(() => {
          console.log("No saved state found, using default layout");
        });
    }
  }, [setNodes, setViewport, featuredWork, featuredLab, centerX]);

  // Default options to enable selection in dev mode
  const defaultEdgeOptions = useMemo(
    () => ({
      animated: false,
    }),
    []
  );

  // Only allow node selection in dev mode
  const selectionMode =
    process.env.NODE_ENV === "development" ? "default" : "none";

  return (
    <div className="h-screen w-screen fixed inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        snapToGrid
        colorMode="dark"
        selectionMode={selectionMode as any}
      >
        <Background gap={10} color="#FFFFFF20" />
      </ReactFlow>

      {/* Dev tools */}
      <FlowDevPanel />
      <Toaster position="bottom-left" />
    </div>
  );
}

// Wrap the component with ReactFlowProvider
function FlowHome(props: FlowHomeProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}

export default FlowHome;
