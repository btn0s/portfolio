"use client";

import { createContext, useContext, useState, useEffect } from "react";

type SoundContextType = {
  isMuted: boolean;
  toggleMute: () => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  // Default to not muted
  const [isMuted, setIsMuted] = useState(false);

  // Try to load preference from localStorage on initial load
  useEffect(() => {
    const savedMuteState = localStorage.getItem("sound-muted");
    if (savedMuteState) {
      setIsMuted(savedMuteState === "true");
    }
  }, []);

  // Save preference when it changes
  useEffect(() => {
    localStorage.setItem("sound-muted", isMuted.toString());
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSoundSettings = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSoundSettings must be used within a SoundProvider");
  }
  return context;
};
