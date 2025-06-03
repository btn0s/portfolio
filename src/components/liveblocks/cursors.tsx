"use client";

import {
  useOthers,
  useUpdateMyPresence,
  useMyPresence,
  useSelf,
} from "@liveblocks/react";
import { useEffect, useState, useRef } from "react";
import { LuMousePointer2 } from "react-icons/lu";
import confetti from "canvas-confetti";
import { usePathname } from "next/navigation";
import { useSoundSettings } from "@/contexts/sound-context";
import {
  loadCursorPosition,
  saveCursorPosition,
  getOrCreateSession,
  type StoredSessionData,
} from "@/lib/cursor-storage";

// Configuration
const SHOW_MY_CURSOR = true;
const SHOW_OTHER_CURSORS = true;

// Function to detect if device is using touch
const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

// Function to trigger confetti
function throwConfetti(x: number, y: number) {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: {
      x: x / window.innerWidth,
      y: y / window.innerHeight,
    },
    colors: ["#ffb347", "#ffcc33", "#51e2f5", "#9df9ef", "#edf756"],
  });
}

// Color options for cursors
const COLORS = {
  blue: {
    bg: "bg-blue-500/50 backdrop-blur-xs border-blue-500 border-1",
    fill: "#3b82f6",
    text: "text-white",
  },
  pink: {
    bg: "bg-pink-500/50 backdrop-blur-xs border-pink-500 border-1",
    fill: "#ec4899",
    text: "text-white",
  },
  orange: {
    bg: "bg-orange-500/50 backdrop-blur-xs border-orange-500 border-1",
    fill: "#f97316",
    text: "text-white",
  },
  yellow: {
    bg: "bg-yellow-500/50 backdrop-blur-xs border-yellow-500 border-1",
    fill: "#eab308",
    text: "text-black",
  },
  green: {
    bg: "bg-green-500/50 backdrop-blur-xs border-green-500 border-1",
    fill: "#22c55e",
    text: "text-white",
  },
};

// Get a color based on connection ID - spread them out by multiplying by a prime number
const getColorForId = (id: number) => {
  const colorKeys = Object.keys(COLORS);
  // Multiply by a prime number to spread out the colors more
  const spreadId = (id * 31) % colorKeys.length;
  const colorKey = colorKeys[spreadId] as keyof typeof COLORS;
  return COLORS[colorKey];
};

// Get a color based on stored color index
const getColorByIndex = (index: number) => {
  const colorKeys = Object.keys(COLORS);
  const colorKey = colorKeys[index % colorKeys.length] as keyof typeof COLORS;
  return COLORS[colorKey];
};

// Create a stable color mapping for session IDs
const sessionColorMap = new Map<string, number>();

// Get a color for a session ID (creates stable mapping)
const getColorForSession = (
  sessionId: string | null | undefined,
  fallbackId: number
) => {
  if (!sessionId) {
    // Fallback to connection ID based color
    return getColorForId(fallbackId);
  }

  if (!sessionColorMap.has(sessionId)) {
    // Create a stable color index based on session ID hash
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      const char = sessionId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const colorIndex = Math.abs(hash) % Object.keys(COLORS).length;
    sessionColorMap.set(sessionId, colorIndex);
  }

  return getColorByIndex(sessionColorMap.get(sessionId)!);
};

// Star Wars themed fallback names
const STAR_WARS_NAMES = [
  "Sebulba",
  "Ben Quadinaros",
  "Gasgano",
  "Mars Guo",
  "Ody Mandrell",
  "Boles Roor",
  "Aldar Beedo",
  "Clegg Holdfast",
  "Dud Bolt",
];

// Get a Star Wars name based on ID
const getNameForId = (id: number) =>
  STAR_WARS_NAMES[id % STAR_WARS_NAMES.length];

// Component for cursor name tag
const LiveCursorNameTag = ({
  name,
  color,
}: {
  name: string;
  color: string;
}) => (
  <div
    className={`absolute top-3 left-1 ml-4 mt-1 rounded-[4px] ${color} text-white px-2 py-0.5 whitespace-nowrap text-xs`}
  >
    {name}
  </div>
);

// Component for rendering a single cursor
const CursorElement = ({
  position,
  color,
  name,
  isClicking,
  isThrowingConfetti,
  isExiting,
  isLocalCursor = false,
}: {
  position: CursorCoordinates;
  color: { bg: string; fill: string; text: string };
  name: string;
  isClicking: boolean;
  isThrowingConfetti?: boolean;
  isExiting?: boolean;
  isLocalCursor?: boolean;
}) => {
  // Calculate position adjusted for local scroll
  const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;

  // Calculate the visual position based on document coordinates and local scroll
  // For local cursor, just use its direct viewport coordinates.
  const left = isLocalCursor ? position.x : position.pageX - scrollX;
  const top = isLocalCursor ? position.y : position.pageY - scrollY;

  // Trigger confetti effect using the calculated visual position
  useEffect(() => {
    if (isThrowingConfetti) {
      // Use 'left' and 'top' which represent the current viewport position
      throwConfetti(left, top);
    }
  }, [isThrowingConfetti, left, top]);

  // Only apply exit animation for remote cursors, not local
  const shouldApplyExitAnimation = !isLocalCursor && isExiting;

  return (
    <div
      className="fixed transition-opacity duration-200 cursor-none"
      style={{
        // Use the calculated visual position
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 50,
      }}
    >
      <div
        className="transition-all duration-200"
        style={{
          transform: shouldApplyExitAnimation
            ? "scale(0)"
            : isClicking
              ? "scale(0.9)"
              : "scale(1)",
          opacity: shouldApplyExitAnimation ? 0 : 1,
          transition: shouldApplyExitAnimation
            ? "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease"
            : "transform 0.15s ease",
        }}
      >
        <LuMousePointer2
          className="h-6 w-6 -translate-x-[4px] -translate-y-[4px] [fill:color-mix(in_oklab,currentColor,black_20%)]"
          color={color.fill}
        />
        <LiveCursorNameTag name={name} color={color.bg} />
      </div>
    </div>
  );
};

function LiveCursors() {
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();
  const pathname = usePathname();
  const { playSound } = useSoundSettings();
  const self = useSelf();

  // Check if user is on a touch device
  const [isTouch, setIsTouch] = useState(false);
  // Track if mouse has moved yet
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  // State for visual rendering of local cursor position
  const [localCursorVisualPosition, setLocalCursorVisualPosition] =
    useState<CursorCoordinates | null>(null);
  // Session data for persistent identity
  const [sessionData, setSessionData] = useState<StoredSessionData | null>(
    null
  );

  // Refs for non-rendering state or immediate access
  const cursorPosition = useRef<CursorCoordinates | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const isMetaKeyPressed = useRef(false);
  const isThrowingConfetti = useRef(false);
  const isExiting = useRef(false);
  const animationFrameId = useRef<number | null>(null);

  // Function to check if element is clickable
  const isClickableElement = (element: Element | null): boolean => {
    if (!element) return false;

    // Check for common clickable elements
    const clickableElements = ["a", "button", "input", "select", "textarea"];
    if (clickableElements.includes(element.tagName.toLowerCase())) return true;

    // Check for elements with click-related attributes
    const clickAttributes = ["onclick", "role"];
    if (clickAttributes.some((attr) => element.hasAttribute(attr))) return true;

    // Check for elements with cursor: pointer
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.cursor === "pointer") return true;

    return false;
  };

  // Function to get clickable element at position
  const getClickableElementAtPosition = (
    x: number,
    y: number
  ): Element | null => {
    const elements = document.elementsFromPoint(x, y);
    return elements.find(isClickableElement) || null;
  };

  // Initialize session and presence
  useEffect(() => {
    // Get or create session data
    const session = getOrCreateSession(
      STAR_WARS_NAMES,
      Object.keys(COLORS).length
    );
    setSessionData(session);

    try {
      updateMyPresence({
        name: session.name,
        sessionId: session.sessionId,
        isClicking: false,
        isThrowingConfetti: false,
        isExiting: false,
      });
    } catch (e) {
      // Ignore presence update errors
    }
  }, [updateMyPresence]);

  // Handle route changes
  useEffect(() => {
    // On mount, try to restore cursor position from localStorage
    const savedPosition = loadCursorPosition();
    if (savedPosition && !isTouch) {
      const { x, y } = savedPosition;
      const scrollX = window.scrollX || 0;
      const scrollY = window.scrollY || 0;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const newPosition = {
        x,
        y,
        pageX: x + scrollX,
        pageY: y + scrollY,
        xPercent: x / viewportWidth,
        yPercent: y / viewportHeight,
      };

      cursorPosition.current = newPosition;

      try {
        updateMyPresence({
          cursor: newPosition,
        });
      } catch (e) {
        // Ignore presence update errors
      }
      setHasMouseMoved(true);
    }

    return () => {
      // When component unmounts or before route change, save current position
      if (cursorPosition.current) {
        saveCursorPosition({
          x: cursorPosition.current.x,
          y: cursorPosition.current.y,
        });
      }

      // Also mark as exiting for animation
      isExiting.current = true;
      try {
        updateMyPresence({
          isExiting: true,
        });
      } catch (e) {
        // Ignore presence update errors
      }
    };
  }, [pathname, updateMyPresence, isTouch]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        updateMyPresence({
          isExiting: true,
        });
      } catch (e) {
        // Ignore presence update errors
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [updateMyPresence]);

  // Set up event listeners
  useEffect(() => {
    // Skip cursor initialization for touch devices
    if (isTouch) return;

    // Mouse movement handler
    const handlePointerMove = (event: PointerEvent) => {
      // Reset exiting state if mouse re-enters
      if (isExiting.current) {
        isExiting.current = false;
        // Ensure visual state reflects this if needed, though presence update handles others
      }

      // Calculate all cursor coordinates
      const newPosition = {
        x: event.clientX,
        y: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        xPercent: event.clientX / window.innerWidth,
        yPercent: event.clientY / window.innerHeight,
      };

      // Update local cursor position ref immediately for network/saving
      cursorPosition.current = newPosition;

      // Schedule visual update in next animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(() => {
        setLocalCursorVisualPosition(newPosition);
      });

      // If this is the first mouse movement, set the flag
      if (!hasMouseMoved) {
        setHasMouseMoved(true);
      }

      // Try to update presence
      try {
        updateMyPresence({
          cursor: newPosition,
          isExiting: false,
        });
      } catch (e) {
        // Ignore presence update errors
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      setIsClicking(true);
      isMetaKeyPressed.current = event.metaKey || event.ctrlKey;

      if (isMetaKeyPressed.current) {
        playSound("confetti");
        isThrowingConfetti.current = true;
      } else {
        // Check if we're clicking a clickable element
        const clickableElement = getClickableElementAtPosition(
          event.clientX,
          event.clientY
        );
        playSound("click", !!clickableElement);
      }

      try {
        updateMyPresence({
          isClicking: true,
          isThrowingConfetti: isMetaKeyPressed.current,
        });
      } catch (e) {
        // Ignore presence update errors
      }
    };

    const handleMouseUp = () => {
      setIsClicking(false);
      isThrowingConfetti.current = false;

      try {
        updateMyPresence({
          isClicking: false,
          isThrowingConfetti: false,
        });
      } catch (e) {
        // Ignore presence update errors
      }
    };

    // Key handlers for meta keys
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Meta" || event.key === "Control") {
        isMetaKeyPressed.current = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Meta" || event.key === "Control") {
        isMetaKeyPressed.current = false;
      }
    };

    // Cleanup when cursor leaves window
    const handlePointerLeave = () => {
      isExiting.current = true;

      try {
        updateMyPresence({
          isExiting: true,
        });
      } catch (e) {
        // Ignore presence update errors
      }

      // Give animation time to play before removing cursor
      setTimeout(() => {
        if (document.visibilityState === "hidden") {
          try {
            updateMyPresence({ cursor: undefined });
          } catch (e) {
            // Ignore presence update errors
          }
          cursorPosition.current = null;
          // Optionally hide local cursor immediately visually
          // setLocalCursorVisualPosition(null);
        }
      }, 300);
    };

    // Handle visibility change (tab change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // User switched tabs, mark cursor as exiting but keep position
        isExiting.current = true;
        try {
          updateMyPresence({
            isExiting: true,
          });
        } catch (e) {
          // Ignore presence update errors
        }
      } else {
        // User came back to tab
        isExiting.current = false;
        try {
          updateMyPresence({
            isExiting: false,
          });
        } catch (e) {
          // Ignore presence update errors
        }
      }
    };

    // Add event listeners - only for non-touch devices
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up all event listeners
    return () => {
      // Cancel any pending animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [updateMyPresence, isTouch, hasMouseMoved, playSound]);

  // Set touch detection on mount
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
      {/* Top-left: Online status or share hint */}
      <div className="fixed bottom-6 left-6 z-40 pointer-events-none">
        <span className="text-xs font-mono text-muted-foreground/50">
          {others.length > 0
            ? `${others.length} online - share with a friend`
            : "share with a friend"}
        </span>
      </div>

      {/* Top-right: Cmd+click hint */}
      <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
        <span className="text-xs font-mono text-muted-foreground/50">
          cmd+click for a surprise
        </span>
      </div>

      {/* Show my cursor only if not on a touch device AND mouse has moved or position was restored */}
      {/* Use the visual position state for rendering */}
      {localCursorVisualPosition &&
        SHOW_MY_CURSOR &&
        !isTouch &&
        hasMouseMoved &&
        sessionData && (
          <CursorElement
            position={localCursorVisualPosition} // Use state for smooth rendering
            color={getColorByIndex(sessionData.colorIndex)} // Use session color
            name="you"
            isClicking={isClicking}
            isThrowingConfetti={isThrowingConfetti.current}
            isExiting={isExiting.current}
            isLocalCursor={true}
          />
        )}

      {/* Show other cursors */}
      {SHOW_OTHER_CURSORS &&
        others.map((other) => {
          const presence = other.presence;
          if (!presence?.cursor) return null;

          // Assign color based on session ID (with connection ID fallback)
          const cursorColor = getColorForSession(
            presence.sessionId,
            other.connectionId
          );
          // Get a fallback name
          const fallbackName = getNameForId(other.connectionId);

          return (
            <CursorElement
              key={other.connectionId}
              position={presence.cursor}
              color={cursorColor}
              name={presence.name || fallbackName}
              isClicking={!!presence.isClicking}
              isThrowingConfetti={!!presence.isThrowingConfetti}
              isExiting={!!presence.isExiting}
            />
          );
        })}
    </div>
  );
}

export default LiveCursors;
