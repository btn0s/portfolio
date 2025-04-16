"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
}

// Ripple interface to track ripple animations
interface Ripple {
  x: number;
  y: number;
  startTime: number;
  maxRadius: number;
  intensity: number;
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Track mouse position and active ripples
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);

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
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

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
    (x: number, y: number) => {
      if (!enableRipple) return;

      const newRipple: Ripple = {
        x,
        y,
        startTime: performance.now(),
        maxRadius: rippleSize,
        intensity: rippleIntensity,
      };

      ripplesRef.current.push(newRipple);
    },
    [enableRipple, rippleSize, rippleIntensity]
  );

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

      // Current radius of the ripple (expands over time)
      const currentRadius = ripple.maxRadius * Math.min(progress * 1.2, 1);

      // How far from the leading edge of the ripple (positive = inside ripple, negative = outside)
      const distanceFromRippleEdge = currentRadius - distance;

      // Ripple effect is strongest at the edge and decreases toward the center and outside
      if (distanceFromRippleEdge < -20 || distanceFromRippleEdge > 20) {
        return 0;
      }

      // Create a wave-like effect using sine
      const waveEffect = Math.sin(distanceFromRippleEdge * 0.3) * 0.5 + 0.5;

      // Scale effect based on ripple intensity and fade out as ripple ages
      return waveEffect * ripple.intensity * (1 - progress);
    },
    [rippleDuration]
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

      // Then apply ripple effects
      if (enableRipple && ripplesRef.current.length > 0) {
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const index = i * rows + j;
            const squareX = i * itemSize + squareSize / 2;
            const squareY = j * itemSize + squareSize / 2;

            let rippleEffect = 0;

            // Combine effects from all active ripples
            for (const ripple of ripplesRef.current) {
              rippleEffect += calculateRippleEffect(
                ripple,
                squareX,
                squareY,
                currentTime
              );
            }

            // Apply ripple effect to square opacity (clamped between 0 and 1)
            if (rippleEffect > 0) {
              squares[index] = Math.min(maxOpacity + rippleEffect, 1);
            }
          }
        }
      }
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
      dpr: number
    ) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          ctx.fillStyle = `${memoizedColor}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          );
        }
      }
    },
    [memoizedColor, squareSize, gridGap]
  );

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || !enableRipple) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePos.current = { x, y };

      // Add ripple occasionally during mouse movement
      if (Math.random() < 0.05) {
        addRipple(x, y);
      }
    },
    [addRipple, enableRipple]
  );

  // Handle mouse enter
  const handleMouseEnter = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || !enableRipple) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePos.current = { x, y };
      addRipple(x, y);
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

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateRipples(time);
      updateSquares(
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
        gridParams.dpr
      );
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

    // Add mouse event listeners
    if (enableRipple) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseenter", handleMouseEnter);
    }

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      // Remove mouse event listeners
      if (enableRipple) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseenter", handleMouseEnter);
      }
    };
  }, [
    setupCanvas,
    updateSquares,
    drawGrid,
    width,
    height,
    isInView,
    enableRipple,
    handleMouseMove,
    handleMouseEnter,
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
