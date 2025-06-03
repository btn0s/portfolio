// Storage keys for persisting cursor data
const CURSOR_STORAGE_KEY = "liveblocks-cursor-position";
const SESSION_STORAGE_KEY = "liveblocks-cursor-session";

// Type for stored cursor position
export type StoredCursorPosition = {
  x: number;
  y: number;
};

// Type for stored session data
export type StoredSessionData = {
  sessionId: string;
  name: string;
  colorIndex: number;
  timestamp: number;
};

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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

/**
 * Save session data to localStorage
 */
export function saveSessionData(
  sessionData: Omit<StoredSessionData, "timestamp">
): void {
  if (typeof window === "undefined") return;

  try {
    const dataWithTimestamp: StoredSessionData = {
      ...sessionData,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(dataWithTimestamp)
    );
  } catch (error) {
    console.error("Failed to save session data:", error);
  }
}

/**
 * Load session data from localStorage
 * @param maxAge Maximum age in milliseconds (default: 24 hours)
 * @returns The stored session data or null if none exists or expired
 */
export function loadSessionData(
  maxAge: number = 24 * 60 * 60 * 1000
): StoredSessionData | null {
  if (typeof window === "undefined") return null;

  try {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedSession) return null;

    const sessionData = JSON.parse(savedSession) as StoredSessionData;

    // Validate the structure
    if (
      typeof sessionData.sessionId === "string" &&
      typeof sessionData.name === "string" &&
      typeof sessionData.colorIndex === "number" &&
      typeof sessionData.timestamp === "number"
    ) {
      // Check if session is still valid (not expired)
      const now = Date.now();
      if (now - sessionData.timestamp <= maxAge) {
        return sessionData;
      } else {
        // Session expired, clean it up
        clearSessionData();
      }
    }
  } catch (error) {
    console.error("Failed to load session data:", error);
  }

  return null;
}

/**
 * Create a new session with generated identity
 * @param nameOptions Array of possible names
 * @param colorCount Number of available colors
 * @returns New session data
 */
export function createNewSession(
  nameOptions: string[],
  colorCount: number
): StoredSessionData {
  const sessionId = generateSessionId();
  const name = nameOptions[Math.floor(Math.random() * nameOptions.length)];
  const colorIndex = Math.floor(Math.random() * colorCount);

  const sessionData: StoredSessionData = {
    sessionId,
    name,
    colorIndex,
    timestamp: Date.now(),
  };

  saveSessionData(sessionData);
  return sessionData;
}

/**
 * Clear session data from localStorage
 */
export function clearSessionData(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear session data:", error);
  }
}

/**
 * Get or create session data
 * @param nameOptions Array of possible names
 * @param colorCount Number of available colors
 * @returns Session data (existing or newly created)
 */
export function getOrCreateSession(
  nameOptions: string[],
  colorCount: number
): StoredSessionData {
  const existingSession = loadSessionData();
  if (existingSession) {
    return existingSession;
  }

  return createNewSession(nameOptions, colorCount);
}
