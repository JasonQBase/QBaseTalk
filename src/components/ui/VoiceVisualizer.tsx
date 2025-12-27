"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface VoiceVisualizerProps {
  isActive?: boolean;
  barCount?: number;
  className?: string;
}

export function VoiceVisualizer({
  isActive = false,
  barCount = 12,
  className = "",
}: VoiceVisualizerProps) {
  const [randomHeights, setRandomHeights] = useState<number[]>([]);

  useEffect(() => {
    // Randomize heights on mount only to prevent hydration mismatch
    // eslint-disable-next-line
    setRandomHeights(
      Array.from({ length: barCount }, () => Math.random() * 60 + 20)
    );
  }, [barCount]);

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {randomHeights.map((randomHeight, index) => {
        const height = isActive ? randomHeight : 20;

        return (
          <motion.div
            key={index}
            className="bg-primary w-1 rounded-full"
            initial={{ height: "20%" }}
            animate={{
              height: isActive ? `${height}%` : "20%",
            }}
            transition={{
              duration: 0.3,
              repeat: isActive ? Infinity : 0,
              repeatType: "reverse",
              delay: index * 0.05,
            }}
          />
        );
      })}
    </div>
  );
}
