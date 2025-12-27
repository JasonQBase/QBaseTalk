"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Lock, Sparkles, TrendingUp } from "lucide-react";
import {
  getBadgeProgress,
  type BadgeProgress,
  checkAndAwardBadges,
} from "@/lib/services/badges";

interface BadgeSystemProps {
  category?:
    | "streak"
    | "vocabulary"
    | "conversation"
    | "game"
    | "milestone"
    | "all";
  showProgress?: boolean;
}

export function BadgeSystem({
  category = "all",
  showProgress = true,
}: BadgeSystemProps) {
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  useEffect(() => {
    const loadBadges = async () => {
      setLoading(true);
      try {
        // Check for new badges first
        await checkAndAwardBadges();

        // Load badge progress
        const progress = await getBadgeProgress();
        const filtered =
          category === "all"
            ? progress
            : progress.filter((b) => b.badge.category === category);

        setBadges(filtered);
      } catch (error) {
        console.error("Error loading badges:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, [category]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-500/20 to-gray-500/5";
      case "rare":
        return "from-blue-500/20 to-blue-500/5";
      case "epic":
        return "from-purple-500/20 to-purple-500/5";
      case "legendary":
        return "from-yellow-500/20 to-yellow-500/5";
      default:
        return "from-gray-500/20 to-gray-500/5";
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "rare":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "epic":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "legendary":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const filteredBadges = badges.filter((b) => {
    if (filter === "unlocked") return b.unlocked;
    if (filter === "locked") return !b.unlocked;
    return true;
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-muted/20 h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header Stats */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="text-primary h-5 w-5" />
            <span className="text-lg font-semibold">
              {unlockedCount} / {totalCount} Badges
            </span>
          </div>
          <div className="bg-muted/20 mt-1 h-2 w-48 overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              className="bg-primary h-full"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(["all", "unlocked", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredBadges.map((badgeProgress, index) => {
            const { badge, unlocked, progress, target, percentage } =
              badgeProgress;

            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`relative overflow-hidden ${
                    unlocked
                      ? "border-primary/30 bg-card"
                      : "border-border/20 bg-muted/10 opacity-60"
                  }`}
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${getRarityColor(badge.rarity)} opacity-50`}
                  />

                  <div className="relative p-6">
                    {/* Icon & Lock Status */}
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-2xl text-4xl ${
                          unlocked ? "bg-primary/10" : "bg-muted/20"
                        }`}
                      >
                        {unlocked ? badge.icon : "🔒"}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          className={`border ${getRarityBadgeColor(badge.rarity)}`}
                        >
                          {badge.rarity}
                        </Badge>
                        {!unlocked && (
                          <Lock className="text-muted-foreground h-4 w-4" />
                        )}
                        {unlocked && (
                          <div className="flex items-center gap-1 text-xs text-green-400">
                            <Sparkles className="h-3 w-3" />
                            <span>+{badge.xp_reward} XP</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badge Info */}
                    <h3
                      className={`mb-2 text-lg font-bold ${
                        unlocked ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {badge.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {badge.description}
                    </p>

                    {/* Progress Bar (only for locked badges if showProgress is true) */}
                    {!unlocked && showProgress && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Progress
                          </span>
                          <span className="font-medium">
                            {progress} / {target}
                          </span>
                        </div>
                        <div className="bg-muted/20 h-1.5 w-full overflow-hidden rounded-full">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="bg-primary h-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Unlocked indicator */}
                    {unlocked && (
                      <div className="flex items-center gap-1 text-xs font-medium text-green-400">
                        <Trophy className="h-3 w-3" />
                        <span>Unlocked!</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <Card className="p-12 text-center">
          <div className="bg-muted/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Trophy className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No {filter} badges</h3>
          <p className="text-muted-foreground text-sm">
            {filter === "unlocked"
              ? "Start learning to unlock your first badge!"
              : "All badges have been unlocked! Amazing work!"}
          </p>
        </Card>
      )}
    </div>
  );
}
