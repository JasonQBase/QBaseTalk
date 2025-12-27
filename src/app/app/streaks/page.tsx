"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StreakCounter } from "@/components/features/StreakCounter";
import { StreakCalendar } from "@/components/features/StreakCalendar";
import { StreakMilestones } from "@/components/features/StreakMilestones";
import { StreakFreezeDialog } from "@/components/features/StreakFreezeDialog";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Calendar, Trophy, History, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StreakCalendarDay } from "@/lib/services/streaks";

export default function StreaksPage() {
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [freezesAvailable] = useState(2);

  function handleDayClick(day: StreakCalendarDay) {
    if (!day.hasActivity && !day.isFreezeUsed) {
      setSelectedDate(day.date);
      setShowFreezeDialog(true);
    }
  }

  function handleFreezeSuccess() {
    // Reload calendar data
    window.location.reload();
  }

  return (
    <div className="from-background to-muted/20 min-h-screen bg-linear-to-b px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <Flame className="h-10 w-10 text-orange-500" />
            <h1 className="bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-4xl font-bold text-transparent dark:from-orange-400 dark:to-red-400">
              Your Learning Streaks
            </h1>
          </div>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Build consistent learning habits and unlock amazing rewards
          </p>
        </motion.div>

        {/* Main streak counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <StreakCounter size="large" />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="milestones"
                className="flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <Card className="p-6">
                <StreakCalendar days={84} onDayClick={handleDayClick} />
              </Card>

              <Card className="bg-linear-to-br from-blue-500/10 to-purple-500/10 p-6">
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <span>💡</span>
                    Tips for Building Streaks
                  </h3>
                  <ul className="text-muted-foreground space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>
                        Study at the same time each day to build a habit
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>
                        Even 10 minutes counts - consistency over quantity
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>
                        Use streak freezes wisely for unavoidable misses
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span>Reach milestones to earn bonus freeze tokens</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones">
              <StreakMilestones />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Streak History</h3>
                  <div className="text-muted-foreground py-12 text-center">
                    <History className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Detailed history coming soon!</p>
                    <p className="text-sm">
                      Track your long-term progress and patterns
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Share button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button variant="outline" size="lg" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share Your Streak
          </Button>
        </motion.div>
      </div>

      {/* Freeze dialog */}
      <StreakFreezeDialog
        isOpen={showFreezeDialog}
        onClose={() => setShowFreezeDialog(false)}
        freezeDate={selectedDate}
        freezesAvailable={freezesAvailable}
        onSuccess={handleFreezeSuccess}
      />
    </div>
  );
}
