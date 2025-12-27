"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Medal, Crown, Flame, User } from "lucide-react";
import {
  getLeaderboard,
  getUserRank,
  type LeaderboardEntry,
  type LeaderboardStats,
} from "@/lib/services/leaderboard";
import { createClient } from "@/lib/supabase/client";

interface LeaderboardProps {
  timeframe?: "weekly" | "monthly" | "all-time";
  limit?: number;
  showCurrentUser?: boolean;
}

export function Leaderboard({
  timeframe = "all-time",
  limit = 50,
  showCurrentUser = true,
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<LeaderboardStats | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setCurrentUserId(user.id);
          const stats = await getUserRank();
          setUserStats(stats);
        }

        const data = await getLeaderboard(timeframe, limit);
        setEntries(data);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [timeframe, limit]);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-orange-400";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="bg-muted/20 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats Card */}
      {showCurrentUser && userStats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/30 from-primary/10 bg-linear-to-br to-transparent p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-muted-foreground mb-1 text-sm font-medium">
                  Your Rank
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-primary text-3xl font-bold">
                    #{userStats.userRank}
                  </span>
                  <div className="text-sm">
                    <div className="font-medium">
                      Top {userStats.percentile}%
                    </div>
                    <div className="text-muted-foreground">
                      of {userStats.totalUsers.toLocaleString()} learners
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-primary/20 flex h-16 w-16 items-center justify-center rounded-full">
                <TrendingUp className="text-primary h-8 w-8" />
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const isCurrentUser = entry.user_id === currentUserId;

          return (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className={`p-4 transition-all hover:scale-[1.02] ${
                  isCurrentUser
                    ? "border-primary/40 bg-primary/5 shadow-glow"
                    : "bg-card hover:bg-accent/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex w-12 items-center justify-center">
                    {getMedalIcon(entry.rank) || (
                      <span
                        className={`text-xl font-bold ${getRankColor(entry.rank)}`}
                      >
                        {entry.rank}
                      </span>
                    )}
                  </div>

                  <Avatar className="from-primary h-12 w-12 border-2 border-white/10 bg-linear-to-br to-cyan-500">
                    <AvatarImage src={entry.avatar_url} alt={entry.username} />
                    <AvatarFallback className="bg-transparent">
                      <User className="h-6 w-6 text-white" />
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`font-semibold ${isCurrentUser ? "text-primary" : ""}`}
                      >
                        {entry.username}
                      </h3>
                      {isCurrentUser && (
                        <Badge className="border-primary/40 bg-primary/10 text-primary border">
                          You
                        </Badge>
                      )}
                      {entry.current_streak > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Flame className="h-3 w-3 text-orange-400" />
                          <span className="font-medium">
                            {entry.current_streak}
                          </span>
                        </div>
                      )}
                    </div>
                    {entry.level && (
                      <p className="text-muted-foreground text-sm">
                        Level {entry.level}
                      </p>
                    )}
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-lg font-bold">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      {entry.total_xp.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground text-xs">XP</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {entries.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No Rankings Yet</h3>
          <p className="text-muted-foreground text-sm">
            Start learning to appear on the leaderboard!
          </p>
        </Card>
      )}
    </div>
  );
}
