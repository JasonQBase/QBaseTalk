"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Play, Trophy, Target, ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { courses as MOCK_COURSES } from "@/lib/data/courses";
import { getUserProfile, UserProfile } from "@/lib/services/gamification";
import { createClient } from "@/lib/supabase/client";
import { DailyChallengeCard } from "@/components/ui/DailyChallengeCard";
import { ChallengeModal } from "@/components/ui/ChallengeModal";
import { StreakCalendar } from "@/components/features/StreakCalendar";

// ... (skipping unchanged imports)

import { StreakCounter } from "@/components/features/StreakCounter";
import { type DailyChallenge } from "@/lib/services/challenge";
import { WordOfDayCard } from "@/components/features/WordOfDayCard";
import { getTodayWord, type WOTDWithProgress } from "@/lib/services/wotd";
import { LearningPathWidget } from "@/components/features/LearningPathWidget";

// Get the first active course or default to first course
// Get the first active course or default to first course
const currentCourse = MOCK_COURSES[0];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedChallenge, setSelectedChallenge] =
    useState<DailyChallenge | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [todayWord, setTodayWord] = useState<WOTDWithProgress | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const [profile, wotd] = await Promise.all([
            getUserProfile(user.id),
            getTodayWord(),
          ]);
          setUserProfile(profile);
          setTodayWord(wotd);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SkeletonCard className="h-16" />
          <SkeletonCard className="h-16" />
          <SkeletonCard className="h-16" />
          <SkeletonCard className="h-16" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Current Course Skeleton */}
            <SkeletonCard className="h-64" />
            {/* Recommended Skeleton */}
            <SkeletonCard className="h-48" />
          </div>
          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <SkeletonCard className="h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  const firstName = userProfile?.display_name?.split(" ")[0] || "Learner";

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            You&apos;re on a{" "}
            <span className="font-semibold text-orange-500">
              {userProfile?.current_streak || 0} day streak
            </span>
            . Keep it up!
          </p>
        </motion.div>

        <div className="flex gap-4">
          {/* Streak Counter Widget */}
          <div
            onClick={() => (window.location.href = "/app/streaks")}
            className="cursor-pointer"
          >
            <StreakCounter
              size="small"
              onViewDetails={() => (window.location.href = "/app/streaks")}
            />
          </div>
          <Card variant="default" className="flex items-center gap-3 px-4 py-2">
            <Trophy className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            <span className="font-bold">{userProfile?.xp || 0} XP</span>
          </Card>
        </div>
      </div>

      {/* Daily Challenge Section */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <DailyChallengeCard
          onStartChallenge={(challenge) => {
            setSelectedChallenge(challenge);
            setShowChallengeModal(true);
          }}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (2 cols wide) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Learning Path Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <LearningPathWidget />
          </motion.div>

          {/* Continue Learning Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card
              variant="highlight"
              className="group relative overflow-hidden p-0"
            >
              <div className="absolute inset-0 z-10 bg-linear-to-r from-black/80 to-transparent" />
              <Image
                src={currentCourse.image}
                alt={currentCourse.title}
                fill
                className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="relative z-20 flex h-full min-h-[300px] flex-col items-start justify-between p-8">
                <div>
                  <Badge variant="primary" className="mb-4">
                    Continue Learning
                  </Badge>
                  <h2 className="mb-2 max-w-lg text-3xl font-bold text-white">
                    {currentCourse.title}
                  </h2>
                  <p className="mb-6 line-clamp-2 max-w-lg text-white/80">
                    {currentCourse.description}
                  </p>
                </div>

                <div className="w-full max-w-lg">
                  <div className="mb-2 flex justify-between text-sm text-white/90">
                    <span>Business Module • Lesson 3 of 12</span>
                    <span>35% Complete</span>
                  </div>
                  <ProgressBar
                    value={35}
                    variant="linear"
                    className="mb-6 h-2"
                  />

                  <Link href={`/app/learn/${currentCourse.id}`}>
                    <Button
                      size="lg"
                      variant="primary"
                      className="w-full sm:w-auto"
                    >
                      <Play className="mr-2 h-5 w-5 fill-current" />
                      Resume Lesson
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recommended Courses */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Recommended for You</h3>
              <Link
                href="/app/courses"
                className="text-primary flex items-center text-sm hover:underline"
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {MOCK_COURSES.slice(1, 3).map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    href={`/app/courses/${course.id}`}
                    className="block h-full"
                  >
                    <Card
                      variant="interactive"
                      className="flex h-full flex-col"
                    >
                      <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="secondary"
                            className="border-0 bg-black/50 text-white backdrop-blur-md"
                          >
                            {course.level}
                          </Badge>
                        </div>
                      </div>
                      <h4 className="mb-2 text-lg font-bold">{course.title}</h4>
                      <div className="text-muted-foreground mt-auto flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> 45m
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" /> 12 Lessons
                        </span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
          {/* Study Streak Calendar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <StreakCalendar />
          </motion.div>

          {/* Word of the Day Widget */}
          {todayWord && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.27 }}
            >
              <WordOfDayCard
                word={todayWord}
                compact
                onPracticeClick={() =>
                  (window.location.href = "/app/word-of-day")
                }
              />
            </motion.div>
          )}

          {/* Daily Goal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="default">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <Target className="text-primary h-5 w-5" />
                Daily Goal
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">XP Earned</span>
                  <span className="text-muted-foreground text-sm">
                    35 / 50 XP
                  </span>
                </div>
                <ProgressBar value={70} variant="linear" />
                <p className="text-muted-foreground text-center text-xs">
                  Complete one more lesson to reach your goal!
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Achievement Spotlight */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="default">
              <h3 className="mb-4 flex items-center gap-2 font-bold">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Recent Achievement
              </h3>

              <div className="flex flex-col items-center p-2 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-yellow-500/30 bg-linear-to-br from-yellow-400/20 to-orange-500/20">
                  <span className="text-4xl">🦅</span>
                </div>
                <h4 className="text-lg font-bold">Early Bird</h4>
                <p className="text-muted-foreground mb-4 text-sm">
                  Completed a lesson before 8AM
                </p>
                <Button variant="ghost" size="sm" className="w-full">
                  View All Badges
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Challenge Modal */}
      <ChallengeModal
        challenge={selectedChallenge}
        open={showChallengeModal}
        onClose={() => {
          setShowChallengeModal(false);
          setSelectedChallenge(null);
        }}
        onComplete={async () => {
          // Refresh user profile to get updated streak and XP
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const profile = await getUserProfile(user.id);
            setUserProfile(profile);
          }
          setShowChallengeModal(false);
          setSelectedChallenge(null);
        }}
      />
    </div>
  );
}
