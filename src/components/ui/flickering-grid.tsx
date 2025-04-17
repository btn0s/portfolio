"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useOthers,
  useMyPresence,
  useUpdateMyPresence,
} from "@liveblocks/react";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;

  maxOpacity?: number;
  rippleDuration?: number;
  rippleSize?: number;
  rippleIntensity?: number;
  enableRipple?: boolean;
  colorShift?: boolean;
  rippleDecay?: number;
  waveFrequency?: number;
  multiplayer?: boolean;
  debug?: boolean;
}

// Ripple interface to track ripple animations
interface Ripple {
  id: string;
  x: number;
  y: number;
  startTime: number;
  maxRadius: number;
  intensity: number;
  velocity: number;
  hue: number;
  userId?: string; // Track which user created this ripple
}

// Define types for presence data
interface RipplePresence {
  ripple?: {
    id: string;
    x: number;
    y: number;
    maxRadius: number;
    intensity: number;
    velocity: number;
    hue: number;
  } | null;
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
  rippleDuration = 1500,
  rippleSize = 150,
  rippleIntensity = 0.7,
  enableRipple = true,
  colorShift = true,
  rippleDecay = 0.85,
  waveFrequency = 0.3,
  multiplayer = true,
  debug = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Track mouse position and active ripples
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const baseColorRef = useRef<{ r: number; g: number; b: number }>({
    r: 0,
    g: 0,
    b: 0,
  });
  const lastRippleTime = useRef<number>(0);
  const rippleThrottleMs = 50; // Minimum time between ripples for throttling

  // Add a ref to track last ripple time for each cursor
  const lastCursorRippleRef = useRef<Record<string, number>>({});
  // Store debug points for visualization
  const debugPointsRef = useRef<Array<{ x: number; y: number; color: string }>>(
    []
  );

  // Liveblocks integration
  const others = multiplayer ? useOthers() : null;
  const [myPresence, updateMyPresence] = multiplayer
    ? [useMyPresence()[0], useMyPresence()[1]]
    : [null, null];

  const memoizedColor = useMemo(() => {
    const toRGBA = (color: string) => {
      if (typeof window === "undefined") {
        return `rgba(0, 0, 0,`;
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 0, 0,";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      // Store base color components for potential color shifts
      baseColorRef.current = { r, g, b };
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const getColorWithShift = useCallback(
    (opacity: number, hueShift: number = 0) => {
      if (!colorShift || hueShift === 0) {
        return `${memoizedColor}${opacity})`;
      }

      // Apply a subtle hue shift
      const { r, g, b } = baseColorRef.current;

      // Convert RGB to HSL, shift hue, convert back to RGB
      const [h, s, l] = rgbToHsl(r, g, b);
      const newHue = (h + hueShift) % 360;
      const [newR, newG, newB] = hslToRgb(newHue, s, l);

      return `rgba(${newR}, ${newG}, ${newB}, ${opacity})`;
    },
    [memoizedColor, colorShift]
  );

  // Helper functions for color conversion
  const rgbToHsl = (
    r: number,
    g: number,
    b: number
  ): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return [h * 360, s, l];
  };

  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): [number, number, number] => {
    h /= 360;
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.floor(width / (squareSize + gridGap));
      const rows = Math.floor(height / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity]
  );

  // Add ripple at current mouse position
  const addRipple = useCallback(
    (x: number, y: number, isClick: boolean = false, userId?: string) => {
      if (!enableRipple) return;

      const now = performance.now();

      // Apply throttling for non-click ripples to prevent too many during fast mouse movement
      if (!isClick && now - lastRippleTime.current < rippleThrottleMs) {
        return;
      }

      lastRippleTime.current = now;

      // Create random hue shift for this ripple
      const hueShift = colorShift ? Math.random() * 30 - 15 : 0;

      // Clicks create stronger, faster ripples
      const intensity = isClick ? rippleIntensity * 1.5 : rippleIntensity;
      const velocity = isClick ? 1.5 : 1.0;

      // Generate a unique ID for this ripple
      const rippleId = `ripple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newRipple: Ripple = {
        id: rippleId,
        x,
        y,
        startTime: now,
        maxRadius: isClick ? rippleSize * 1.5 : rippleSize,
        intensity,
        velocity,
        hue: hueShift,
        userId,
      };

      ripplesRef.current.push(newRipple);

      // If using multiplayer and no userId is provided (meaning this is a local ripple),
      // broadcast the ripple to other users
      if (multiplayer && updateMyPresence && !userId) {
        updateMyPresence({
          ripple: {
            id: rippleId,
            x,
            y,
            maxRadius: newRipple.maxRadius,
            intensity,
            velocity,
            hue: hueShift,
          },
        });

        // Clear the ripple from presence after a brief delay (so others can receive it)
        setTimeout(() => {
          updateMyPresence({ ripple: null });
        }, 100);
      }

      return newRipple;
    },
    [
      enableRipple,
      rippleSize,
      rippleIntensity,
      colorShift,
      multiplayer,
      updateMyPresence,
      rippleThrottleMs,
    ]
  );

  // Process incoming ripples from other users
  useEffect(() => {
    if (!multiplayer || !others) return;

    // DPR is primarily needed for drawing, not coordinate calculation here
    // const dpr = window.devicePixelRatio || 1;

    others.forEach((other) => {
      const otherPresence = other.presence as unknown as RipplePresence;
      if (otherPresence.ripple) {
        const { id, x, y, maxRadius, intensity, velocity, hue } =
          otherPresence.ripple;

        // Check if we already have this ripple (avoid duplicates)
        const existingRipple = ripplesRef.current.find((r) => r.id === id);
        if (!existingRipple) {
          // Add the ripple with the other user's ID
          addRipple(
            x,
            y,
            intensity > rippleIntensity,
            other.connectionId.toString()
          );
        }
      }

      // Create ripples from remote cursor movements using pageX/pageY
      const cursor = (other.presence as any)?.cursor;
      if (
        cursor?.pageX !== undefined &&
        cursor?.pageY !== undefined &&
        containerRef.current
      ) {
        // Get container's position relative to the document
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerDocLeft = containerRect.left + window.scrollX;
        const containerDocTop = containerRect.top + window.scrollY;
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Calculate ripple position relative to the container's top-left corner (unscaled CSS pixels)
        const rippleX = cursor.pageX - containerDocLeft;
        const rippleY = cursor.pageY - containerDocTop;

        // Scale coordinates by DPR for consistency with canvas drawing << REVERTED
        // const rippleX = relativeX * dpr;
        // const rippleY = relativeY * dpr;

        // For debugging, store calculated points (unscaled relative coordinates)
        if (debug) {
          debugPointsRef.current.push({
            x: rippleX,
            y: rippleY,
            color: `hsl(${(other.connectionId * 30) % 360}, 100%, 50%)`, // Color based on user ID
          });
          if (debugPointsRef.current.length > 20) {
            debugPointsRef.current.shift();
          }
        }

        // Bounds check using unscaled relative coordinates
        if (
          rippleY >= 0 &&
          rippleY <= containerHeight &&
          rippleX >= 0 &&
          rippleX <= containerWidth
        ) {
          // Throttle ripple creation based on cursor movement
          const rippleKey = `${other.connectionId}_cursor_ripple`;
          const lastRippleTime = lastCursorRippleRef.current[rippleKey] || 0;
          const now = performance.now();

          if (now - lastRippleTime > 500) {
            // Create ripple every 500ms - Pass unscaled relative coordinates
            addRipple(rippleX, rippleY, false, other.connectionId.toString());
            lastCursorRippleRef.current[rippleKey] = now;
          }
        }
      }
    });
  }, [others, addRipple, multiplayer, rippleIntensity, debug]);

  // Update active ripples
  const updateRipples = useCallback(
    (currentTime: number) => {
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        const elapsed = currentTime - ripple.startTime;
        return elapsed < rippleDuration;
      });
    },
    [rippleDuration]
  );

  // Calculate how much a ripple affects a specific square
  const calculateRippleEffect = useCallback(
    (ripple: Ripple, squareX: number, squareY: number, currentTime: number) => {
      const dx = squareX - ripple.x;
      const dy = squareY - ripple.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const elapsed = currentTime - ripple.startTime;
      const progress = elapsed / rippleDuration;

      // Current radius of the ripple (expands over time with velocity)
      const currentRadius =
        ripple.maxRadius * Math.min(progress * 1.2 * ripple.velocity, 1);

      // How far from the leading edge of the ripple (positive = inside ripple, negative = outside)
      const distanceFromRippleEdge = currentRadius - distance;

      // Apply decay over time (ripples lose energy)
      const decayFactor = Math.pow(rippleDecay, progress * 10);

      // Ripple effect is strongest at the edge and decreases toward the center and outside
      if (distanceFromRippleEdge < -20 || distanceFromRippleEdge > 20) {
        return { effect: 0, hue: 0 };
      }

      // Create a wave-like effect using sine with configurable frequency
      const waveEffect =
        Math.sin(distanceFromRippleEdge * waveFrequency) * 0.5 + 0.5;

      // Scale effect based on ripple intensity and fade out as ripple ages
      const effect =
        waveEffect * ripple.intensity * (1 - progress) * decayFactor;

      return {
        effect,
        hue: ripple.hue,
      };
    },
    [rippleDuration, rippleDecay, waveFrequency]
  );

  // Update squares based on flickering and ripples
  const updateSquares = useCallback(
    (
      squares: Float32Array,
      deltaTime: number,
      cols: number,
      rows: number,
      currentTime: number
    ) => {
      const itemSize = squareSize + gridGap;

      // First, apply random flickering
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }

      // Store hue shifts for each square that has ripple effects
      const hueShifts = new Float32Array(squares.length);

      // Then apply ripple effects
      if (enableRipple && ripplesRef.current.length > 0) {
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const index = i * rows + j;
            const squareX = i * itemSize + squareSize / 2;
            const squareY = j * itemSize + squareSize / 2;

            let totalRippleEffect = 0;
            let weightedHueShift = 0;
            let totalWeight = 0;

            // Combine effects from all active ripples with interference patterns
            for (const ripple of ripplesRef.current) {
              const { effect, hue } = calculateRippleEffect(
                ripple,
                squareX,
                squareY,
                currentTime
              );

              if (effect > 0) {
                totalRippleEffect += effect;
                weightedHueShift += hue * effect;
                totalWeight += effect;
              }
            }

            // Calculate weighted average hue shift
            hueShifts[index] =
              totalWeight > 0 ? weightedHueShift / totalWeight : 0;

            // Apply ripple effect to square opacity (clamped between 0 and 1)
            if (totalRippleEffect > 0) {
              squares[index] = Math.min(maxOpacity + totalRippleEffect, 1);
            }
          }
        }
      }

      // Store hue shifts for use in drawing
      return hueShifts;
    },
    [
      flickerChance,
      maxOpacity,
      squareSize,
      gridGap,
      enableRipple,
      calculateRippleEffect,
    ]
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      hueShifts: Float32Array,
      dpr: number
    ) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const index = i * rows + j;
          const opacity = squares[index];
          const hueShift = hueShifts[index];

          // Apply color with potential hue shift
          ctx.fillStyle = getColorWithShift(opacity, hueShift);

          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          );
        }
      }
    },
    [memoizedColor, squareSize, gridGap, getColorWithShift]
  );

  // Draw debug visualization on top of the canvas if enabled
  const drawDebugVisualization = useCallback(
    (ctx: CanvasRenderingContext2D, dpr: number) => {
      if (!debug) return;

      // Draw debug points (coordinates are unscaled, so scale them now for drawing)
      debugPointsRef.current.forEach((point, i) => {
        ctx.beginPath();
        // Scale by dpr here for drawing
        ctx.arc(point.x * dpr, point.y * dpr, 5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();

        // Draw a number next to the point to show the sequence
        ctx.font = `${12 * dpr}px Arial`;
        // Scale text position by dpr
        ctx.fillText(String(i), (point.x + 10) * dpr, (point.y + 5) * dpr);
      });
    },
    [debug]
  );

  // Use PointerEvent for better performance and cross-device support
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!containerRef.current || !enableRipple) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePos.current = { x, y };

      // Create ripples on mouse movement regardless of speed
      // Apply minimal throttling to prevent overwhelming the system
      const now = performance.now();
      if (now - lastRippleTime.current > rippleThrottleMs) {
        addRipple(x, y, false);
      }
    },
    [addRipple, enableRipple, rippleThrottleMs]
  );

  // Handle pointer enter
  const handlePointerEnter = useCallback(
    (e: PointerEvent) => {
      if (!containerRef.current || !enableRipple) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePos.current = { x, y };
      addRipple(x, y, false);
    },
    [addRipple, enableRipple]
  );

  // Handle mouse click for bigger ripples
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || !enableRipple) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create a stronger ripple on click
      addRipple(x, y, true);
    },
    [addRipple, enableRipple]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = Math.min((time - lastTime) / 1000, 0.1); // Cap deltaTime to avoid large jumps
      lastTime = time;

      updateRipples(time);
      const hueShifts = updateSquares(
        gridParams.squares,
        deltaTime,
        gridParams.cols,
        gridParams.rows,
        time
      );

      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        hueShifts,
        gridParams.dpr
      );
      drawDebugVisualization(ctx, gridParams.dpr);
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    intersectionObserver.observe(canvas);

    // Add pointer event listeners for better performance
    if (enableRipple) {
      container.addEventListener(
        "pointermove",
        handlePointerMove as EventListener
      );
      container.addEventListener(
        "pointerenter",
        handlePointerEnter as EventListener
      );
      container.addEventListener("click", handleClick);
    }

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      // Remove event listeners
      if (enableRipple) {
        container.removeEventListener(
          "pointermove",
          handlePointerMove as EventListener
        );
        container.removeEventListener(
          "pointerenter",
          handlePointerEnter as EventListener
        );
        container.removeEventListener("click", handleClick);
      }
    };
  }, [
    setupCanvas,
    updateSquares,
    drawGrid,
    drawDebugVisualization,
    width,
    height,
    isInView,
    enableRipple,
    handlePointerMove,
    handlePointerEnter,
    handleClick,
    updateRipples,
  ]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

export { FlickeringGrid };
