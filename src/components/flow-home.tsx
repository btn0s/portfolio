"use client";

import React, { useCallback, useMemo } from "react";
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
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import SimpleContentNode from "./simple-content-node";
import WorkCardNode from "./work-card-node";
import { Toaster } from "sonner";

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

const nodeTypes: NodeTypes = {
  simpleContentNode: SimpleContentNode,
  workCardNode: WorkCardNode,
};

interface FlowHomeProps {
  state: {
    nodes: Node[];
  };
}

function Flow({ state }: FlowHomeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(state.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: false,
    }),
    []
  );

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
        fitView
        className="bg-background"
      >
        <Background gap={10} color="#FFFFFF20" />
      </ReactFlow>

      <Toaster position="bottom-left" />
    </div>
  );
}

function FlowHome(props: FlowHomeProps) {
  return <Flow {...props} />;
}

export default FlowHome;
