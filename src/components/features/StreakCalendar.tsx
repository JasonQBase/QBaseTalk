"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getStreakCalendarData,
  type StreakCalendarDay,
} from "@/lib/services/streaks";
import { Loader2, Snowflake } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakCalendarProps {
  days?: number;
  onDayClick?: (day: StreakCalendarDay) => void;
}

export function StreakCalendar({ days = 42, onDayClick }: StreakCalendarProps) {
  const [calendarData, setCalendarData] = useState<StreakCalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCalendar() {
      setLoading(true);
      const data = await getStreakCalendarData(days);
      setCalendarData(data);
      setLoading(false);
    }
    loadCalendar();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Group by weeks (7 days each)
  const weeks: StreakCalendarDay[][] = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  const getDayColor = (day: StreakCalendarDay) => {
    if (day.isFreezeUsed) return "bg-blue-500 dark:bg-blue-600";
    if (day.hasActivity) {
      // Gradient based on activity intensity
      if (day.activityCount >= 5) return "bg-green-600 dark:bg-green-500";
      if (day.activityCount >= 3) return "bg-green-500 dark:bg-green-600";
      return "bg-green-400 dark:bg-green-700";
    }
    return "bg-gray-200 dark:bg-gray-800";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const getDayLabel = () => {
    return ["S", "M", "T", "W", "T", "F", "S"];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Calendar</h3>
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-800" />
            <span>No activity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span>Freeze used</span>
          </div>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2">
        {getDayLabel().map((label, idx) => (
          <div
            key={idx}
            className="text-muted-foreground text-center text-xs font-medium"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-2">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-2">
            {week.map((day, dayIdx) => (
              <TooltipProvider key={dayIdx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (weekIdx * 7 + dayIdx) * 0.01 }}
                      className="relative"
                    >
                      <div
                        className={`aspect-square cursor-pointer rounded-md transition-all ${getDayColor(day)} ${day.isToday ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900" : ""} hover:scale-110 hover:shadow-lg`}
                        onClick={() => onDayClick?.(day)}
                      >
                        {day.isFreezeUsed && (
                          <Snowflake className="absolute inset-0 m-auto h-3 w-3 text-white" />
                        )}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {formatDate(day.date)}
                      </div>
                      {day.hasActivity ? (
                        <>
                          <div className="text-sm">
                            {day.activityCount} activit
                            {day.activityCount > 1 ? "ies" : "y"}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400">
                            +{day.xpEarned} XP
                          </div>
                        </>
                      ) : day.isFreezeUsed ? (
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Freeze used
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">
                          No activity
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
