"use server";

import { promises as fs } from "node:fs";
import path from "node:path";

export type SavedNodePosition = {
  id: string;
  position: { x: number; y: number };
};

/**
 * Load saved node positions from the file system
 */
export async function getSavedNodePositions(): Promise<SavedNodePosition[]> {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "content",
      "node-positions.json",
    );

    try {
      await fs.access(filePath);
      const fileContent = await fs.readFile(filePath, "utf-8");
      return JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or can't be read
      return [];
    }
  } catch (error) {
    console.error("Error loading saved positions:", error);
    return [];
  }
}

/**
 * Save node positions to a file
 */
export async function saveNodePositions(
  positions: SavedNodePosition[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // Ensure the content directory exists
    const contentDir = path.join(process.cwd(), "src", "content");
    await fs.mkdir(contentDir, { recursive: true });

    // Save the nodes data to a JSON file
    const filePath = path.join(contentDir, "node-positions.json");
    await fs.writeFile(filePath, JSON.stringify(positions, null, 2));

    return { success: true };
  } catch (error) {
    console.error("Error saving node positions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
