"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "./Card";
import { Button } from "./button";
import { Badge } from "./Badge";
import { Trophy, Flame, Star, Lock } from "lucide-react";
import {
  getTodayChallenge,
  type DailyChallenge,
} from "@/lib/services/challenge";
import { createClient } from "@/lib/supabase/client";

interface DailyChallengeCardProps {
  onStartChallenge: (challenge: DailyChallenge) => void;
}

const challengeTypeIcons = {
  vocab_quiz: "📚",
  pronunciation: "🗣️",
  grammar: "✍️",
  conversation: "💬",
};

const challengeTypeLabels = {
  vocab_quiz: "Vocabulary Quiz",
  pronunciation: "Pronunciation Practice",
  grammar: "Grammar Challenge",
  conversation: "Conversation Practice",
};

export function DailyChallengeCard({
  onStartChallenge,
}: DailyChallengeCardProps) {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadChallenge();
    loadStreak();
  }, []);

  async function loadChallenge() {
    try {
      setLoading(true);
      const data = await getTodayChallenge();
      setChallenge(data);
    } catch (error) {
      console.error("Failed to load challenge:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStreak() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("users_extended")
        .select("current_streak")
        .eq("id", user.id)
        .single();

      if (data) {
        setStreak(data.current_streak || 0);
      }
    }
  }

  if (loading) {
    return (
      <Card className="border-primary/30 from-primary/20 via-primary/10 overflow-hidden bg-linear-to-br to-transparent p-8">
        <div className="h-32 animate-pulse space-y-4">
          <div className="bg-muted h-6 w-1/2 rounded" />
          <div className="bg-muted h-4 w-3/4 rounded" />
          <div className="bg-muted h-10 w-32 rounded" />
        </div>
      </Card>
    );
  }

  if (!challenge) {
    return null;
  }

  const isCompleted = challenge.completed;
  const icon = challengeTypeIcons[challenge.challenge_type];
  const label = challengeTypeLabels[challenge.challenge_type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="group border-primary/30 from-primary/20 via-primary/10 hover:border-primary/50 hover:shadow-glow relative overflow-hidden bg-linear-to-br to-transparent p-8 transition-all">
        {/* Decorative Elements */}
        <div className="bg-primary/10 absolute top-0 right-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="text-primary mb-2 flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold tracking-wide">
                  DAILY CHALLENGE
                </span>
              </div>
              <h2 className="mb-2 text-3xl font-bold">
                {isCompleted ? (
                  <span className="gradient-text">Challenge Completed! 🎉</span>
                ) : (
                  <span>Ready for Today&apos;s Challenge?</span>
                )}
              </h2>
              <p className="text-muted-foreground">
                {isCompleted
                  ? `Great job! You scored ${challenge.score}/${challenge.content.questions?.length || challenge.content.words?.length || 5}. Come back tomorrow!`
                  : `Complete today's ${label.toLowerCase()} to maintain your streak`}
              </p>
            </div>

            {/* Streak Display */}
            <motion.div
              className="flex flex-col items-center gap-1 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Flame className="h-6 w-6 text-orange-400" />
              <div className="text-2xl font-bold text-orange-400">{streak}</div>
              <div className="text-xs font-medium text-orange-300">
                day streak
              </div>
            </motion.div>
          </div>

          {/* Challenge Info */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="bg-card/50 flex items-center gap-2 rounded-lg px-4 py-2">
              <span className="text-2xl">{icon}</span>
              <span className="font-semibold">{label}</span>
            </div>

            <Badge
              className={`border ${
                challenge.difficulty === "Beginner"
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : challenge.difficulty === "Intermediate"
                    ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                    : "border-purple-500/20 bg-purple-500/10 text-purple-400"
              }`}
            >
              {challenge.difficulty}
            </Badge>

            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">+100 XP</span>
            </div>
          </div>

          {/* Action Button */}
          {isCompleted ? (
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                disabled
                className="cursor-not-allowed gap-2 opacity-60"
              >
                <Lock className="h-5 w-5" />
                Completed
              </Button>
              <p className="text-muted-foreground text-sm">
                Next challenge unlocks in{" "}
                <span className="text-primary font-semibold">
                  {calculateTimeUntilMidnight()}
                </span>
              </p>
            </div>
          ) : (
            <Button
              size="lg"
              className="shadow-glow gap-2"
              onClick={() => onStartChallenge(challenge)}
            >
              <Trophy className="h-5 w-5" />
              Start Challenge
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function calculateTimeUntilMidnight(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}
