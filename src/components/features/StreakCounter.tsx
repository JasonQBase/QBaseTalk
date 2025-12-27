"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getStreakStats, type StreakStats } from "@/lib/services/streaks";
import { Flame, Award, Loader2 } from "lucide-react";

interface StreakCounterProps {
  onViewDetails?: () => void;
  size?: "small" | "medium" | "large";
}

export function StreakCounter({
  onViewDetails,
  size = "medium",
}: StreakCounterProps) {
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const data = await getStreakStats();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const sizeClasses = {
    small: "text-2xl",
    medium: "text-4xl",
    large: "text-6xl",
  };

  const containerClasses = {
    small: "p-3",
    medium: "p-4",
    large: "p-6",
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative ${containerClasses[size]} cursor-pointer rounded-2xl border border-orange-500/20 bg-linear-to-br from-orange-500/10 to-red-500/10 transition-all hover:shadow-lg dark:from-orange-400/20 dark:to-red-400/20`}
      onClick={onViewDetails}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-orange-500/5 to-red-500/5 blur-xl" />

      <div className="relative flex flex-col items-center gap-2">
        {/* Fire emoji with animation */}
        <motion.div
          animate={{
            scale: stats.currentStreak > 0 ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: stats.currentStreak > 0 ? Infinity : 0,
            ease: "easeInOut",
          }}
          className={sizeClasses[size]}
        >
          {stats.currentStreak > 0 ? (
            <Flame className="h-12 w-12 fill-orange-500 text-orange-500" />
          ) : (
            <Flame className="h-12 w-12 text-gray-400" />
          )}
        </motion.div>

        {/* Streak count */}
        <div className="text-center">
          <div
            className={`font-bold ${size === "large" ? "text-5xl" : size === "medium" ? "text-3xl" : "text-xl"} bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-red-400`}
          >
            {stats.currentStreak}
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            day streak
          </div>
        </div>

        {/* Motivational message */}
        {stats.currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold text-orange-600 dark:text-orange-400"
          >
            {stats.currentStreak >= 7 ? "🔥 On fire!" : "Keep it up!"}
          </motion.div>
        )}

        {/* Freeze tokens indicator */}
        {stats.freezesAvailable > 0 && (
          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
            <Award className="h-3 w-3" />
            <span>
              {stats.freezesAvailable} freeze
              {stats.freezesAvailable > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Next milestone preview */}
        {size !== "small" && stats.currentStreak < stats.nextMilestone && (
          <div className="text-muted-foreground text-center text-xs">
            {stats.daysToNextMilestone} day
            {stats.daysToNextMilestone > 1 ? "s" : ""} to {stats.nextMilestone}{" "}
            day milestone
          </div>
        )}
      </div>
    </motion.div>
  );
}
