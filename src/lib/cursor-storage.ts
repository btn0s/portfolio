// Storage key for persisting cursor position
const CURSOR_STORAGE_KEY = "liveblocks-cursor-position";

// Type for stored cursor position
export type StoredCursorPosition = {
  x: number;
  y: number;
};

/**
 * Save cursor position to localStorage
 */
export function saveCursorPosition(position: StoredCursorPosition): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CURSOR_STORAGE_KEY, JSON.stringify(position));
  } catch (error) {
    console.error("Failed to save cursor position:", error);
  }
}

/**
 * Load cursor position from localStorage
 * @returns The stored cursor position or null if none exists
 */
export function loadCursorPosition(): StoredCursorPosition | null {
  if (typeof window === "undefined") return null;

  try {
    const savedPosition = localStorage.getItem(CURSOR_STORAGE_KEY);
    if (!savedPosition) return null;

    const position = JSON.parse(savedPosition) as StoredCursorPosition;
    if (typeof position.x === "number" && typeof position.y === "number") {
      return position;
    }
  } catch (error) {
    console.error("Failed to load cursor position:", error);
  }

  return null;
}
