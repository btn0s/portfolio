"use client";

import {
  useOthers,
  useUpdateMyPresence,
  useMyPresence,
} from "@liveblocks/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { LuMousePointer2 } from "react-icons/lu";
import confetti from "canvas-confetti";
import { usePathname } from "next/navigation";

// Configuration
const SHOW_MY_CURSOR = true;
const SHOW_OTHER_CURSORS = true;

// Function to detect if device is using touch
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0) || 
    // @ts-ignore
    (navigator.msMaxTouchPoints > 0);
};

// Define cursor coordinates type
type CursorCoordinates = {
  x: number; // Viewport X
  y: number; // Viewport Y
  pageX: number; // Document X
  pageY: number; // Document Y
};

// Define types for presence data
type Presence = {
  cursor: CursorCoordinates | undefined;
  name?: string;
  isClicking?: boolean;
  isThrowingConfetti?: boolean;
  isExiting?: boolean;
};

// Define the type for Liveblocks presence
declare module "@liveblocks/react" {
  interface Presence {
    cursor?: CursorCoordinates | null;
    name?: string | null;
    isClicking?: boolean;
    isThrowingConfetti?: boolean;
    isExiting?: boolean;
  }
}

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
  blue: { bg: "bg-blue-500", fill: "#3b82f6", text: "text-white" },
  pink: { bg: "bg-pink-500", fill: "#ec4899", text: "text-white" },
  orange: { bg: "bg-orange-500", fill: "#f97316", text: "text-white" },
  yellow: { bg: "bg-yellow-500", fill: "#eab308", text: "text-black" },
  green: { bg: "bg-green-500", fill: "#22c55e", text: "text-white" },
};

// Get a color based on connection ID
const getColorForId = (id: number) => {
  const colorKeys = Object.keys(COLORS);
  const colorKey = colorKeys[id % colorKeys.length] as keyof typeof COLORS;
  return COLORS[colorKey];
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
  position: { x: number; y: number; pageX: number; pageY: number };
  color: { bg: string; fill: string; text: string };
  name: string;
  isClicking: boolean;
  isThrowingConfetti?: boolean;
  isExiting?: boolean;
  isLocalCursor?: boolean;
}) => {
  // Trigger confetti effect when isThrowingConfetti changes to true
  useEffect(() => {
    if (isThrowingConfetti) {
      throwConfetti(position.x, position.y);
    }
  }, [isThrowingConfetti, position.x, position.y]);

  // Only apply exit animation for remote cursors, not local
  const shouldApplyExitAnimation = !isLocalCursor && isExiting;

  // Calculate position adjusted for current scroll
  const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;

  // For local cursor use viewport coordinates, for remote cursors use document coordinates adjusted by current scroll
  const leftPos = isLocalCursor ? position.x : position.pageX - scrollX;
  const topPos = isLocalCursor ? position.y : position.pageY - scrollY;

  return (
    <div
      className="fixed transition-opacity duration-200 cursor-none"
      style={{
        left: `${leftPos}px`,
        top: `${topPos}px`,
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
          className="h-6 w-6 -translate-x-[4px] -translate-y-[4px] fill-current/60"
          color={color.fill}
        />
        <LiveCursorNameTag name={name} color={color.bg} />
      </div>
    </div>
  );
};

function LiveCursors() {
  const updateMyPresence = useUpdateMyPresence();
  const [myPresence] = useMyPresence();
  const others = useOthers();
  const pathname = usePathname();

  // Check if user is on a touch device
  const [isTouch, setIsTouch] = useState(false);
  // Track if mouse has moved yet
  const [hasMouseMoved, setHasMouseMoved] = useState(false);

  // Set touch detection on mount
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  // State for tracking mouse position and click state
  const [myId] = useState(() => Math.floor(Math.random() * 1000));
  const myColor = getColorForId(myId);
  const myName = getNameForId(myId);

  // Track cursor state
  const cursorPosition = useRef({ x: 0, y: 0 });
  const isClicking = useRef(false);
  const isMetaKeyPressed = useRef(false);
  const isThrowingConfetti = useRef(false);
  const isExiting = useRef(false);
  const rafId = useRef<number | null>(null);

  // Initialize presence
  useEffect(() => {
    updateMyPresence({
      name: myName,
      isClicking: false,
      isThrowingConfetti: false,
      isExiting: false,
      // Don't set cursor until mouse moves
    });
  }, [myName, updateMyPresence]);

  // Handle route changes
  useEffect(() => {
    return () => {
      // When component unmounts or before route change
      isExiting.current = true;
      updateMyPresence({
        isExiting: true,
      });
    };
  }, [pathname, updateMyPresence]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateMyPresence({
        isExiting: true,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [updateMyPresence]);

  // Update presence in animation frame
  const updatePresence = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollX = window.scrollX || 0;
    const scrollY = window.scrollY || 0;

    // Check if we need to throw confetti (meta key + clicking)
    const shouldThrowConfetti = isMetaKeyPressed.current && isClicking.current;

    // Only set confetti to true once per click
    if (shouldThrowConfetti && !isThrowingConfetti.current) {
      isThrowingConfetti.current = true;

      // Reset after a short delay
      setTimeout(() => {
        isThrowingConfetti.current = false;
        scheduleUpdate();
      }, 500);
    }

    updateMyPresence({
      cursor: {
        x: cursorPosition.current.x,
        y: cursorPosition.current.y,
        pageX: cursorPosition.current.x + scrollX,
        pageY: cursorPosition.current.y + scrollY,
      },
      isClicking: isClicking.current,
      isThrowingConfetti: isThrowingConfetti.current,
      isExiting: isExiting.current,
    });

    rafId.current = null;
  }, [updateMyPresence]);

  // Schedule an update
  const scheduleUpdate = useCallback(() => {
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(updatePresence);
    }
  }, [updatePresence]);

  // Set up event listeners
  useEffect(() => {
    // Skip cursor initialization for touch devices
    if (isTouch) return;

    // Don't initialize cursor position - wait for first mouse move instead

    // Mouse movement handler
    const handlePointerMove = (event: PointerEvent) => {
      // Update cursor position
      cursorPosition.current = {
        x: event.clientX,
        y: event.clientY,
      };

      // If this is the first mouse movement, set the flag
      if (!hasMouseMoved) {
        setHasMouseMoved(true);
      }

      scheduleUpdate();
    };

    // Scroll handler to update remote cursor positions
    const handleScroll = () => {
      // We only need to call scheduleUpdate to ensure other cursors adjust position
      scheduleUpdate();
    };

    // Mouse click handlers
    const handleMouseDown = (event: MouseEvent) => {
      isClicking.current = true;
      isMetaKeyPressed.current = event.metaKey || event.ctrlKey;
      scheduleUpdate();
    };

    const handleMouseUp = () => {
      isClicking.current = false;
      scheduleUpdate();
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
      scheduleUpdate();

      // Give animation time to play
      setTimeout(() => {
        updateMyPresence({ cursor: undefined });
        isExiting.current = false;
      }, 300);
    };

    // Add event listeners - only for non-touch devices
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up all event listeners
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("scroll", handleScroll);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [scheduleUpdate, updateMyPresence, isTouch, hasMouseMoved]);

  // Type cast to access presence properties safely
  const typedMyPresence = myPresence as unknown as Presence;

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
      {/* Show my cursor only if not on a touch device AND mouse has moved */}
      {typedMyPresence.cursor &&
        SHOW_MY_CURSOR &&
        !isTouch &&
        hasMouseMoved && (
          <CursorElement
            position={typedMyPresence.cursor}
            color={myColor}
            name="you"
            isClicking={!!typedMyPresence.isClicking}
            isThrowingConfetti={!!typedMyPresence.isThrowingConfetti}
            isExiting={!!typedMyPresence.isExiting}
            isLocalCursor={true}
          />
        )}

      {/* Show other cursors */}
      {SHOW_OTHER_CURSORS &&
        others.map((other) => {
          // Use type assertion for presence
          const presence = other.presence as unknown as Presence;
          if (!presence?.cursor) return null;

          // Assign color based on connection ID
          const cursorColor = getColorForId(other.connectionId);
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
