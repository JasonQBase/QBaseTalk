"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { getStreakStats, type StreakStats } from "@/lib/services/streaks";
import { Trophy, Lock, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/progress";

const MILESTONES = [
  { days: 7, name: "Week Warrior", color: "bg-emerald-500", xp: 50 },
  { days: 14, name: "Fortnight Fighter", color: "bg-teal-500", xp: 100 },
  { days: 30, name: "Monthly Master", color: "bg-blue-500", xp: 200 },
  { days: 60, name: "Double Diamond", color: "bg-purple-500", xp: 350 },
  { days: 100, name: "Century Champion", color: "bg-pink-500", xp: 500 },
  { days: 365, name: "Year Legend", color: "bg-orange-500", xp: 1000 },
];

export function StreakMilestones() {
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
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <div className="text-muted-foreground text-center">
          <p>Could not load milestone data.</p>
          <button
            onClick={loadStats}
            className="text-primary mt-2 text-sm underline"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const achievedMilestoneIds = new Set(
    stats.achievedMilestones.map((m) => m.milestone_days)
  );

  const nextMilestone = MILESTONES.find((m) => m.days > stats.currentStreak);
  const progressPercent = nextMilestone
    ? (stats.currentStreak / nextMilestone.days) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Progress to next milestone */}
      {nextMilestone && (
        <Card className="from-primary/5 to-primary/10 bg-linear-to-br p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Next Milestone</h3>
                <p className="text-muted-foreground text-sm">
                  {nextMilestone.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {stats.daysToNextMilestone}
                </div>
                <div className="text-muted-foreground text-xs">days to go</div>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={progressPercent} className="h-3" />
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{stats.currentStreak} days</span>
                <span>{nextMilestone.days} days</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">
                Reward:{" "}
                <strong className="text-foreground">
                  +{nextMilestone.xp} XP
                </strong>
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* All milestones */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Milestone Badges</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MILESTONES.map((milestone, index) => {
            const isAchieved = achievedMilestoneIds.has(milestone.days);
            const isCurrent = nextMilestone?.days === milestone.days;

            return (
              <motion.div
                key={milestone.days}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative overflow-hidden p-4 transition-all ${isAchieved ? "border-2 border-yellow-500/50 bg-linear-to-br from-yellow-500/10 to-orange-500/10" : ""} ${isCurrent ? "ring-primary ring-2" : ""} ${!isAchieved && !isCurrent ? "opacity-60" : ""} `}
                >
                  {/* Background decoration */}
                  {isAchieved && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      <CheckCircle2 className="h-8 w-8 text-yellow-500" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${isAchieved ? milestone.color : "bg-gray-300 dark:bg-gray-700"} `}
                    >
                      {isAchieved ? (
                        <Trophy className="h-6 w-6 text-white" />
                      ) : (
                        <Lock className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-semibold">{milestone.name}</h4>
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs">
                            Next
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-2 text-sm">
                        {milestone.days} day streak
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                          <Sparkles className="h-3 w-3" />
                          <span>+{milestone.xp} XP</span>
                        </div>
                        {[30, 100, 365].includes(milestone.days) && (
                          <div className="text-blue-600 dark:text-blue-400">
                            +1 Freeze
                          </div>
                        )}
                      </div>

                      {isAchieved && stats.achievedMilestones && (
                        <div className="text-muted-foreground mt-2 text-xs">
                          Achieved{" "}
                          {new Date(
                            stats.achievedMilestones.find(
                              (m) => m.milestone_days === milestone.days
                            )?.achieved_at || ""
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <Card className="bg-muted/50 p-6">
        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          <div>
            <div className="text-primary text-2xl font-bold">
              {stats.achievedMilestones.length}
            </div>
            <div className="text-muted-foreground text-sm">Milestones</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.currentStreak}
            </div>
            <div className="text-muted-foreground text-sm">Current Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.longestStreak}
            </div>
            <div className="text-muted-foreground text-sm">Longest Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.freezesAvailable}
            </div>
            <div className="text-muted-foreground text-sm">Freezes Left</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
