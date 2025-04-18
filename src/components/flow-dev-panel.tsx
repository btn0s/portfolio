import React, { useState } from "react";
import { useReactFlow, useOnSelectionChange } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { FlowSaveButton } from "./flow-save-button";

// Simplified sticker transform type from sticker-stack-node.tsx
type StickerTransform = {
  rotation: number;
};

// Helper interface for node data with stickerPaths and transforms
interface StickerNodeData {
  stickerPaths: string[];
  stickerTransforms?: StickerTransform[];
  [key: string]: any; // Allow additional properties
}

export default function FlowDevPanel() {
  const { getNodes, setNodes } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [stickerTransforms, setStickerTransforms] = useState<
    StickerTransform[]
  >([]);

  // Listen for selection changes
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      if (nodes.length === 1) {
        const node = nodes[0];
        setSelectedNode(node);

        // If it's a sticker stack node, initialize the transforms
        if (
          node.type === "stickerStackNode" &&
          node.data &&
          Array.isArray((node.data as StickerNodeData).stickerPaths)
        ) {
          const nodeData = node.data as StickerNodeData;
          const transforms: StickerTransform[] = [];

          // For each sticker, get its transform or create a default one
          nodeData.stickerPaths.forEach((_: any, index: number) => {
            if (
              nodeData.stickerTransforms &&
              nodeData.stickerTransforms[index]
            ) {
              transforms[index] = {
                rotation: nodeData.stickerTransforms[index].rotation,
              };
            } else {
              transforms[index] = { rotation: 0 };
            }
          });

          setStickerTransforms(transforms);
        } else {
          setStickerTransforms([]);
        }
      } else {
        setSelectedNode(null);
        setStickerTransforms([]);
      }
    },
  });

  // Update sticker rotation for a specific index
  const updateStickerRotation = (index: number, rotation: number) => {
    if (!selectedNode || selectedNode.type !== "stickerStackNode") return;

    const newTransforms = [...stickerTransforms];
    newTransforms[index] = { rotation };
    setStickerTransforms(newTransforms);

    // Update the node data
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                stickerTransforms: newTransforms,
              },
            }
          : node
      )
    );
  };

  // Reset a sticker's rotation to 0
  const resetStickerRotation = (index: number) => {
    updateStickerRotation(index, 0);
  };

  // No need to show if not in development mode
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Render nothing if no node is selected
  if (!selectedNode) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg opacity-80 hover:opacity-100 transition-opacity">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Dev Panel</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-xs text-muted-foreground">Select a node to edit</p>
          <div className="mt-2">
            <FlowSaveButton />
          </div>
        </CardContent>
      </Card>
    );
  }

  const nodeData = selectedNode.data as StickerNodeData;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 shadow-lg opacity-80 hover:opacity-100 transition-opacity">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Editing {selectedNode.id}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {/* Position controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="position-x" className="text-xs">
                Position X
              </Label>
              <Input
                id="position-x"
                type="number"
                value={selectedNode.position.x}
                onChange={(e) => {
                  const x = parseFloat(e.target.value);
                  setNodes((nodes) =>
                    nodes.map((node) =>
                      node.id === selectedNode.id
                        ? { ...node, position: { ...node.position, x } }
                        : node
                    )
                  );
                }}
                className="h-7 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="position-y" className="text-xs">
                Position Y
              </Label>
              <Input
                id="position-y"
                type="number"
                value={selectedNode.position.y}
                onChange={(e) => {
                  const y = parseFloat(e.target.value);
                  setNodes((nodes) =>
                    nodes.map((node) =>
                      node.id === selectedNode.id
                        ? { ...node, position: { ...node.position, y } }
                        : node
                    )
                  );
                }}
                className="h-7 text-xs"
              />
            </div>
          </div>

          {/* Sticker rotation controls - only show for sticker stack nodes */}
          {selectedNode.type === "stickerStackNode" &&
            nodeData.stickerPaths &&
            Array.isArray(nodeData.stickerPaths) && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium">Sticker Rotations</h3>
                {nodeData.stickerPaths.map((_: any, index: number) => (
                  <div
                    key={index}
                    className="border rounded-md p-2 space-y-1 mt-2"
                  >
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`sticker-${index}-rotation`}
                        className="text-xs"
                      >
                        Sticker {index + 1}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(stickerTransforms[index]?.rotation || 0)}°
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Slider
                        id={`sticker-${index}-rotation`}
                        min={-15}
                        max={15}
                        step={0.5}
                        value={[stickerTransforms[index]?.rotation || 0]}
                        onValueChange={(values) =>
                          updateStickerRotation(index, values[0])
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => resetStickerRotation(index)}
                      >
                        R
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          <div className="pt-2">
            <FlowSaveButton />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
