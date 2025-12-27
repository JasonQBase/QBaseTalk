"use client";

import { useCallback, useState } from "react";

export function useSound() {
  // Initialize state with lazy initializer to avoid setState in useEffect
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("sound-muted");
    return stored ? JSON.parse(stored) : false;
  });

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem("sound-muted", JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const playSound = useCallback(
    (type: "success" | "error" | "click") => {
      if (isMuted) return;

      // In a real app we would load actual audio files.
      // For this demo/freestyle, we'll try to use the Web Audio API for simple synthesized sounds
      // to avoid needing external assets.

      if (typeof window === "undefined") return;

      try {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext: typeof window.AudioContext;
            }
          ).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "success") {
          // High pitched "ding"
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(
            1046.5,
            ctx.currentTime + 0.1
          ); // C6
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        } else if (type === "error") {
          // Low pitched "buzz"
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (e) {
        console.error("Audio playback failed", e);
      }
    },
    [isMuted]
  );

  return { playSound, isMuted, toggleMute };
}
