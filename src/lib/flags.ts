import { flag } from "flags/next";

// Example feature flag with a simple decision function
export const exampleFlag = flag({
  key: "example-flag",
  decide() {
    return Math.random() > 0.5;
  },
});

// Example of a flag with options
export const greetingFlag = flag<string>({
  key: "greeting",
  options: ["Hello", "Hi", "Welcome"],
  decide() {
    return "Hello";
  },
});

// Feature flag for LiveCursors
export const showCursorsFlag = flag({
  key: "show-cursors",
  decide() {
    // To test turning cursors off, change this to false
    return true;
  },
});

// Group flags for convenient precomputation
export const marketingFlags = [exampleFlag, greetingFlag] as const;
