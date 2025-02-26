import type { StaticImageData } from "next/image";
import { useEffect, useState } from "react";

type ContrastTheme = "light" | "dark";
type ImageSource = string | StaticImageData;

interface UseImageContrastOptions {
  /**
   * Threshold for determining dark vs light (0-1)
   * Lower values make more images use dark theme (white text)
   * Default: 0.5
   */
  threshold?: number;

  /**
   * Percentage of the image height to analyze from the bottom
   * Default: 0.3 (bottom 30%)
   */
  sampleAreaHeight?: number;

  /**
   * Pixel sampling rate (higher = more accurate but slower)
   * Default: 16 (sample every 16th pixel)
   */
  samplingRate?: number;

  /**
   * Default theme to use before analysis completes
   * Default: 'dark'
   */
  defaultTheme?: ContrastTheme;
}

/**
 * Hook to analyze an image and determine if it needs light or dark text for contrast
 *
 * @param imageSrc URL of the image to analyze (string or StaticImageData)
 * @param options Configuration options
 * @returns Object containing the detected theme and loading state
 */
export function useImageContrast(
  imageSrc: ImageSource,
  options: UseImageContrastOptions = {},
): {
  theme: ContrastTheme;
  isLoading: boolean;
} {
  const {
    threshold = 0.5,
    sampleAreaHeight = 0.3,
    samplingRate = 16,
    defaultTheme = "dark",
  } = options;

  const [theme, setTheme] = useState<ContrastTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset loading state when image source changes
    setIsLoading(true);

    // Get the actual URL string from the image source
    const imageUrl = typeof imageSrc === "string" ? imageSrc : imageSrc.src;

    // Skip analysis for empty sources
    if (!imageUrl) {
      setTheme(defaultTheme);
      setIsLoading(false);
      return;
    }

    // For external URLs that might have CORS issues, use the default theme
    // This is a simple check for external URLs - adjust as needed
    const isExternalUrl =
      imageUrl.startsWith("http") &&
      !imageUrl.includes(window.location.hostname) &&
      !imageUrl.startsWith("/");

    if (isExternalUrl) {
      // For external URLs, we'll still try to load the image, but with a quick timeout
      // to avoid long waits if CORS is blocking us
      const timeoutId = setTimeout(() => {
        console.log("Using default theme for external image:", imageUrl);
        setTheme(defaultTheme);
        setIsLoading(false);
      }, 500); // Short timeout for external images

      // Create a new image element
      const img = new Image();

      // Set up load handler
      img.onload = () => {
        clearTimeout(timeoutId);
        // For external images that successfully load, we'll use a simplified approach
        // and just use the default theme to avoid CORS issues with canvas
        setTheme(defaultTheme);
        setIsLoading(false);
      };

      // Set up error handler
      img.onerror = () => {
        clearTimeout(timeoutId);
        console.warn(
          "Error loading external image for contrast analysis:",
          imageUrl,
        );
        setTheme(defaultTheme);
        setIsLoading(false);
      };

      // Try to load the image
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      return () => {
        clearTimeout(timeoutId);
        img.onload = null;
        img.onerror = null;
      };
    }

    // For internal images, proceed with full analysis
    // Create a new image element
    const img = new Image();

    // Function to analyze the image
    const analyzeImage = () => {
      try {
        // Create a canvas to analyze the image
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          setTheme(defaultTheme);
          setIsLoading(false);
          return;
        }

        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image to canvas
        context.drawImage(img, 0, 0, img.width, img.height);

        // Get image data from the bottom area where text will appear
        const bottomAreaHeight = Math.floor(img.height * sampleAreaHeight);
        const bottomAreaY = img.height - bottomAreaHeight;

        const imageData = context.getImageData(
          0,
          bottomAreaY,
          img.width,
          bottomAreaHeight,
        );
        const data = imageData.data;

        // Calculate average brightness
        let totalBrightness = 0;
        let pixelCount = 0;

        // Sample pixels (skip some for performance)
        for (let i = 0; i < data.length; i += samplingRate * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate perceived brightness using standard luminance formula
          const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          totalBrightness += brightness;
          pixelCount++;
        }

        const avgBrightness = totalBrightness / pixelCount;

        // Set theme based on brightness threshold
        setTheme(avgBrightness < threshold ? "dark" : "light");
        setIsLoading(false);
      } catch (error) {
        console.warn("Error analyzing image contrast:", error);
        setTheme(defaultTheme);
        setIsLoading(false);
      }
    };

    // Set up load handler
    img.onload = analyzeImage;

    // Set up error handler
    img.onerror = (e) => {
      console.warn("Error loading image for contrast analysis:", imageUrl);
      setTheme(defaultTheme);
      setIsLoading(false);
    };

    // Set source to trigger load
    img.crossOrigin = "anonymous"; // Handle CORS if needed
    img.src = imageUrl;

    // If image is already cached and loaded
    if (img.complete) {
      analyzeImage();
    }

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc, threshold, sampleAreaHeight, samplingRate, defaultTheme]);

  return { theme, isLoading };
}
