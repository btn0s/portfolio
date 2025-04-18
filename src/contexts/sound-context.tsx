"use client";

import { createContext, useContext, useState, useEffect } from "react";
import useSound from "use-sound";

// Sound settings
export const SOUND_VOLUME = 0.3;

// Sound files
export const SOUNDS = {
  click: "/assets/audio/click.wav",
  clickAlt: "/assets/audio/click-alt.mp3",
  confetti: "/assets/audio/sad-party-horn.wav",
  drop: "/assets/audio/drop.mp3",
};

// Types
type SoundContextType = {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (sound: keyof typeof SOUNDS, alt?: boolean) => void;
};

// Create context
const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Storage key for persisting mute preference
const MUTE_STORAGE_KEY = "sound-muted";

// Provider component
export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  // State for mute toggle
  const [isMuted, setIsMuted] = useState(false);

  // Load sounds with useSound hook
  const [playClick] = useSound(SOUNDS.click, {
    volume: isMuted ? 0 : SOUND_VOLUME,
  });
  const [playClickAlt] = useSound(SOUNDS.clickAlt, {
    volume: isMuted ? 0 : SOUND_VOLUME,
  });
  const [playConfetti] = useSound(SOUNDS.confetti, {
    volume: isMuted ? 0 : SOUND_VOLUME,
  });
  const [playDrop] = useSound(SOUNDS.drop, {
    volume: isMuted ? 0 : SOUND_VOLUME,
  });

  // Sound player utility
  const playSound = (sound: keyof typeof SOUNDS, alt?: boolean) => {
    if (isMuted) return;

    switch (sound) {
      case "click":
        alt ? playClickAlt() : playClick();
        break;
      case "confetti":
        playConfetti();
        break;
      case "drop":
        playDrop();
        break;
    }
  };

  // Try to load preference from localStorage on initial load
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedMuteState = localStorage.getItem(MUTE_STORAGE_KEY);
    if (savedMuteState) {
      setIsMuted(savedMuteState === "true");
    }
  }, []);

  // Save preference when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem(MUTE_STORAGE_KEY, isMuted.toString());
  }, [isMuted]);

  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

// Hook for component access to sound context
export const useSoundSettings = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSoundSettings must be used within a SoundProvider");
  }
  return context;
};
