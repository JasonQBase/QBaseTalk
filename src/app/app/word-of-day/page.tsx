"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WordOfDayCard } from "@/components/features/WordOfDayCard";
import { WOTDPracticeQuiz } from "@/components/features/WOTDPracticeQuiz";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Calendar,
  TrendingUp,
  Trophy,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import {
  getTodayWord,
  getWordHistory,
  getWOTDStats,
  type WOTDWithProgress,
} from "@/lib/services/wotd";
import Link from "next/link";

export default function WordOfTheDayPage() {
  const [todayWord, setTodayWord] = useState<WOTDWithProgress | null>(null);
  const [wordHistory, setWordHistory] = useState<WOTDWithProgress[]>([]);
  const [stats, setStats] = useState({
    totalViewed: 0,
    totalPracticed: 0,
    totalMastered: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [word, history, userStats] = await Promise.all([
        getTodayWord(),
        getWordHistory(7),
        getWOTDStats(),
      ]);

      setTodayWord(word);
      setWordHistory(history);
      setStats(userStats);
    } catch (error) {
      console.error("Error loading WOTD data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = () => {
    // Reload data to update stats
    loadData();
    setShowQuiz(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showQuiz && todayWord) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 p-6 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => setShowQuiz(false)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Word
          </Button>
          <WOTDPracticeQuiz
            word={todayWord}
            onComplete={handleQuizComplete}
            onClose={() => setShowQuiz(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-orange-50 p-6 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/app/dashboard">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="bg-linear-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-4xl font-bold text-transparent">
              Word of the Day
            </h1>
            <p className="text-muted-foreground mt-2">
              Expand your vocabulary, one word at a time
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-blue-500/20 bg-linear-to-br from-blue-500/10 to-blue-600/10 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-muted-foreground text-xs">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="border-green-500/20 bg-linear-to-br from-green-500/10 to-green-600/10 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalViewed}</p>
                <p className="text-muted-foreground text-xs">Words Viewed</p>
              </div>
            </div>
          </Card>

          <Card className="border-purple-500/20 bg-linear-to-br from-purple-500/10 to-purple-600/10 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/20 p-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPracticed}</p>
                <p className="text-muted-foreground text-xs">Words Practiced</p>
              </div>
            </div>
          </Card>

          <Card className="border-yellow-500/20 bg-linear-to-br from-yellow-500/10 to-yellow-600/10 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/20 p-2">
                <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalMastered}</p>
                <p className="text-muted-foreground text-xs">Words Mastered</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Word */}
        {todayWord && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WordOfDayCard
              word={todayWord}
              onPracticeClick={() => setShowQuiz(true)}
            />
          </motion.div>
        )}

        {/* Word History */}
        {wordHistory.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">Previous Words</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wordHistory.slice(1).map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group cursor-pointer p-4 transition-shadow hover:shadow-lg">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          {word.word}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {word.pronunciation}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="ml-2 shrink-0 text-xs"
                      >
                        {new Date(word.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Badge>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm">
                      {word.definition}
                    </p>
                    {word.progress && (
                      <div className="flex flex-wrap gap-2">
                        {word.progress.mastered && (
                          <Badge className="bg-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400">
                            <Trophy className="mr-1 h-3 w-3" />
                            Mastered
                          </Badge>
                        )}
                        {word.progress.practiced && !word.progress.mastered && (
                          <Badge className="bg-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
                            Practiced
                          </Badge>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!todayWord && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              No word of the day available yet. Check back later!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
