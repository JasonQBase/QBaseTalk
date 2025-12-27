"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import {
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Award,
  BarChart3,
  Activity,
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-4xl font-bold">Learning Analytics</h1>
          <p className="text-muted-foreground text-lg">
            Track your progress and insights
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-2">
            {(["week", "month", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="border-border/40 from-primary/10 bg-linear-to-br to-transparent p-6">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="text-primary h-5 w-5" />
              <span className="text-muted-foreground text-sm font-medium">
                Study Time
              </span>
            </div>
            <div className="text-3xl font-bold">12.5h</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="h-3 w-3" />
              +15% from last week
            </div>
          </Card>

          <Card className="border-border/40 bg-linear-to-br from-cyan-500/10 to-transparent p-6">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-cyan-400" />
              <span className="text-muted-foreground text-sm font-medium">
                Words Learned
              </span>
            </div>
            <div className="text-3xl font-bold">127</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="h-3 w-3" />
              +23 new words
            </div>
          </Card>

          <Card className="border-border/40 bg-linear-to-br from-purple-500/10 to-transparent p-6">
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              <span className="text-muted-foreground text-sm font-medium">
                Accuracy
              </span>
            </div>
            <div className="text-3xl font-bold">87%</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="h-3 w-3" />
              +5% improvement
            </div>
          </Card>

          <Card className="border-border/40 bg-linear-to-br from-orange-500/10 to-transparent p-6">
            <div className="mb-2 flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-400" />
              <span className="text-muted-foreground text-sm font-medium">
                XP Earned
              </span>
            </div>
            <div className="text-3xl font-bold">1,450</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="h-3 w-3" />
              +350 this week
            </div>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Study Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                <BarChart3 className="text-primary h-5 w-5" />
                Daily Study Time
              </h3>

              {/* Simple Bar Chart */}
              <div className="space-y-4">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, index) => {
                    const hours = [2.5, 1.8, 3.2, 2.1, 2.8, 1.5, 2.3][index];
                    const percentage = (hours / 3.5) * 100;

                    return (
                      <div key={day} className="flex items-center gap-4">
                        <div className="text-muted-foreground w-12 text-sm font-medium">
                          {day}
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted/20 h-8 w-full overflow-hidden rounded-lg">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{
                                delay: 0.3 + index * 0.05,
                                duration: 0.5,
                              }}
                              className="from-primary h-full bg-linear-to-r to-cyan-500"
                            />
                          </div>
                        </div>
                        <div className="w-16 text-right text-sm font-semibold">
                          {hours}h
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </Card>
          </motion.div>

          {/* Activity Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold">
                <Activity className="text-primary h-5 w-5" />
                Activity Breakdown
              </h3>

              <div className="space-y-4">
                {[
                  { name: "Vocabulary", value: 35, color: "bg-purple-500" },
                  { name: "Conversations", value: 28, color: "bg-cyan-500" },
                  {
                    name: "Practice Sessions",
                    value: 22,
                    color: "bg-green-500",
                  },
                  { name: "Mini-Games", value: 15, color: "bg-yellow-500" },
                ].map((activity, index) => (
                  <div key={activity.name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">{activity.name}</span>
                      <span className="text-muted-foreground">
                        {activity.value}%
                      </span>
                    </div>
                    <div className="bg-muted/20 h-2 w-full overflow-hidden rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activity.value}%` }}
                        transition={{
                          delay: 0.3 + index * 0.05,
                          duration: 0.5,
                        }}
                        className={`h-full ${activity.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-border/40 bg-muted/20 mt-6 rounded-lg border p-4">
                <div className="text-muted-foreground text-sm">
                  💡 Tip: Balance your learning activities for best results
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Learning Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold">
              <Calendar className="text-primary h-5 w-5" />
              Achievements & Milestones
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="border-border/40 bg-muted/20 rounded-lg border p-4">
                <div className="mb-2 text-4xl">🔥</div>
                <div className="font-semibold">12 Day Streak</div>
                <div className="text-muted-foreground text-xs">
                  Your longest: 15 days
                </div>
              </div>

              <div className="border-border/40 bg-muted/20 rounded-lg border p-4">
                <div className="mb-2 text-4xl">🎯</div>
                <div className="font-semibold">24 Lessons Complete</div>
                <div className="text-muted-foreground text-xs">
                  76 more to go!
                </div>
              </div>

              <div className="border-border/40 bg-muted/20 rounded-lg border p-4">
                <div className="mb-2 text-4xl">⭐</div>
                <div className="font-semibold">Level 5 Achiever</div>
                <div className="text-muted-foreground text-xs">
                  450 XP to Level 6
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
