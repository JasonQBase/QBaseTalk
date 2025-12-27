"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Leaderboard } from "@/components/features/Leaderboard";
import { Trophy, Calendar, TrendingUp, Users } from "lucide-react";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all-time">(
    "all-time"
  );

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-2xl">
              <Trophy className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Leaderboard</h1>
              <p className="text-muted-foreground text-lg">
                See how you rank against other learners
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeframe Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-2">
            {(
              [
                { value: "weekly", label: "This Week", icon: Calendar },
                { value: "monthly", label: "This Month", icon: TrendingUp },
                { value: "all-time", label: "All Time", icon: Users },
              ] as const
            ).map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setTimeframe(option.value)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all ${
                    timeframe === option.value
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 grid gap-4 md:grid-cols-3"
        >
          <Card className="border-border/40 bg-linear-to-br from-yellow-500/10 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Gold</span>
            </div>
            <div className="text-2xl font-bold">Top 10</div>
            <div className="text-muted-foreground text-xs">Elite learners</div>
          </Card>

          <Card className="border-border/40 bg-linear-to-br from-gray-500/10 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gray-300" />
              <span className="text-sm font-medium">Silver</span>
            </div>
            <div className="text-2xl font-bold">Top 50</div>
            <div className="text-muted-foreground text-xs">
              Advanced learners
            </div>
          </Card>

          <Card className="border-border/40 bg-linear-to-br from-orange-500/10 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-medium">Bronze</span>
            </div>
            <div className="text-2xl font-bold">Top 100</div>
            <div className="text-muted-foreground text-xs">Active learners</div>
          </Card>
        </motion.div>

        {/* Leaderboard Component */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Leaderboard
            timeframe={timeframe}
            limit={50}
            showCurrentUser={true}
          />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-border/40 bg-muted/20 p-6">
            <h3 className="mb-3 font-semibold">How Rankings Work</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Trophy className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <span>Rankings are based on your total XP earned</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Complete lessons, games, and conversations to earn more XP
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <span>Maintain your streak for bonus XP multipliers</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
