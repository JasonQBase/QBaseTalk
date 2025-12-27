"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
  Mic,
  ChevronLeft,
  Trophy,
  History,
  Play,
  BarChart2,
} from "lucide-react";
import { VoiceRecorder } from "@/components/features/VoiceRecorder";
import {
  PRACTICE_SENTENCES,
  getRecordingHistory,
  type PracticeSentence,
  type PronunciationRecording,
} from "@/lib/services/pronunciation";
import { formatDistanceToNow } from "date-fns";

export default function PronunciationPage() {
  const [selectedSentence, setSelectedSentence] =
    useState<PracticeSentence | null>(null);
  const [history, setHistory] = useState<PronunciationRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<
    "All" | "Beginner" | "Intermediate" | "Advanced"
  >("All");

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      const data = await getRecordingHistory(10);
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleRecordingComplete = () => {
    loadHistory();
  };

  const filteredSentences =
    activeLevel === "All"
      ? PRACTICE_SENTENCES
      : PRACTICE_SENTENCES.filter((s) => s.difficulty === activeLevel);

  const stats = {
    totalPracticed: history.length,
    avgScore:
      history.length > 0
        ? Math.round(
            history.reduce((sum, r) => sum + (r.ai_score || 0), 0) /
              history.length
          )
        : 0,
    bestScore:
      history.length > 0 ? Math.max(...history.map((r) => r.ai_score || 0)) : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        {selectedSentence && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedSentence(null)}
            className="rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        <div>
          <h1 className="mb-2 text-3xl font-bold">
            {selectedSentence ? "Practice Session" : "Pronunciation Training"}
          </h1>
          <p className="text-muted-foreground">
            {selectedSentence
              ? "Record your voice and get instant AI feedback"
              : "Master your accent with AI-powered feedback"}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedSentence ? (
          <motion.div
            key="recorder"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto max-w-2xl"
          >
            <VoiceRecorder
              targetText={selectedSentence.text}
              onRecordingComplete={handleRecordingComplete}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card variant="default" className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-full p-3">
                  <Mic className="text-primary h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.totalPracticed}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Sessions Completed
                  </div>
                </div>
              </Card>
              <Card variant="default" className="flex items-center gap-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <BarChart2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.avgScore}%</div>
                  <div className="text-muted-foreground text-sm">
                    Average Score
                  </div>
                </div>
              </Card>
              <Card variant="default" className="flex items-center gap-4">
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.bestScore}%</div>
                  <div className="text-muted-foreground text-sm">
                    Best Score
                  </div>
                </div>
              </Card>
            </div>

            {/* Level Filter */}
            <div className="flex gap-2">
              {(["All", "Beginner", "Intermediate", "Advanced"] as const).map(
                (level) => (
                  <Button
                    key={level}
                    variant={activeLevel === level ? "primary" : "outline"}
                    onClick={() => setActiveLevel(level)}
                    size="sm"
                  >
                    {level}
                  </Button>
                )
              )}
            </div>

            {/* Sentence Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSentences.map((sentence, index) => (
                <motion.div
                  key={sentence.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    variant="interactive"
                    className="flex h-full cursor-pointer flex-col"
                    onClick={() => setSelectedSentence(sentence)}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <Badge variant="secondary" className="bg-background/50">
                        {sentence.category}
                      </Badge>
                      <Badge
                        className={
                          sentence.difficulty === "Beginner"
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : sentence.difficulty === "Intermediate"
                              ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                              : "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
                        }
                      >
                        {sentence.difficulty}
                      </Badge>
                    </div>

                    <p className="mb-2 flex-1 text-lg font-medium">
                      &quot;{sentence.text}&quot;
                    </p>
                    <p className="text-muted-foreground mb-4 font-mono text-sm">
                      {sentence.phonetic}
                    </p>

                    <div className="text-primary mt-auto flex items-center text-sm font-medium group-hover:underline">
                      <Play className="mr-1 h-4 w-4 fill-current" />
                      Start Practice
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent History */}
            {history.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <History className="text-muted-foreground h-5 w-5" />
                  <h2 className="text-xl font-bold">Recent Attempts</h2>
                </div>
                <div className="space-y-3">
                  {history.map((record) => (
                    <Card
                      key={record.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{record.text}</p>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <span>
                            {formatDistanceToNow(new Date(record.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          {record.duration_seconds && (
                            <span>• {record.duration_seconds}s</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {record.ai_score && (
                          <div
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              record.ai_score >= 90
                                ? "bg-green-500/20 text-green-500"
                                : record.ai_score >= 70
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : "bg-red-500/20 text-red-500"
                            }`}
                          >
                            {record.ai_score}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
