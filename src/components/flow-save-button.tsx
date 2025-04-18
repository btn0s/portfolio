import React from "react";
import { useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FlowSaveButton() {
  const { getNodes, getViewport } = useReactFlow();

  const saveState = async () => {
    // Save node positions, viewport, and sticker rotations
    const nodes = getNodes().map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data:
        node.type === "stickerStackNode"
          ? {
              // For sticker stack nodes, save the rotations
              stickerTransforms: node.data.stickerTransforms,
            }
          : {}, // Empty object for other node types
    }));

    const viewport = getViewport();

    const response = await fetch("/api/flow-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nodes,
        viewport,
      }),
    });

    if (response.ok) {
      toast.success("Flow layout saved");
    } else {
      toast.error("Failed to save flow layout");
    }
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Button variant="outline" size="sm" onClick={saveState}>
      Save Flow
    </Button>
  );
}

export default FlowSaveButton;
