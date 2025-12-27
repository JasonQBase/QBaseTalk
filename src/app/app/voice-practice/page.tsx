"use client";

import { useState, useEffect } from "react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { Mic, TrendingUp, Clock, Target, History } from "lucide-react";
import { VoiceRecorder } from "@/components/features/VoiceRecorder";
import {
  PRACTICE_SENTENCES,
  getRecordingHistory,
  type PronunciationRecording,
} from "@/lib/services/pronunciation";

export default function VoicePracticePage() {
  const [selectedSentence, setSelectedSentence] = useState(
    PRACTICE_SENTENCES[0]
  );
  const [recordings, setRecordings] = useState<PronunciationRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, []);

  async function loadRecordings() {
    try {
      setLoading(true);
      const data = await getRecordingHistory(10);
      setRecordings(data);
    } catch (error) {
      console.error("Failed to load recordings:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleRecordingComplete = () => {
    loadRecordings();
  };

  const stats = {
    total: recordings.length,
    averageScore:
      recordings.filter((r) => r.ai_score).length > 0
        ? Math.round(
            recordings
              .filter((r) => r.ai_score)
              .reduce((sum, r) => sum + (r.ai_score || 0), 0) /
              recordings.filter((r) => r.ai_score).length
          )
        : 0,
    recentScore: recordings[0]?.ai_score || 0,
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
        </div>
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">Voice Practice</h1>
        <p className="text-muted-foreground">
          Practice your pronunciation and get AI-powered feedback
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="from-card to-primary/5 border-primary/10 flex items-center gap-4 bg-linear-to-br">
          <div className="bg-primary/10 ring-primary/20 rounded-full p-3 ring-1">
            <Mic className="text-primary h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{stats.total}</p>
            <p className="text-muted-foreground text-sm font-medium">
              Total Recordings
            </p>
          </div>
        </Card>

        <Card className="from-card flex items-center gap-4 border-green-500/10 bg-linear-to-br to-green-500/5">
          <div className="rounded-full bg-green-500/10 p-3 ring-1 ring-green-500/20">
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">
              {stats.averageScore}
            </p>
            <p className="text-muted-foreground text-sm font-medium">
              Average Score
            </p>
          </div>
        </Card>

        <Card className="from-card flex items-center gap-4 border-yellow-500/10 bg-linear-to-br to-yellow-500/5">
          <div className="rounded-full bg-yellow-500/10 p-3 ring-1 ring-yellow-500/20">
            <Target className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">
              {stats.recentScore}
            </p>
            <p className="text-muted-foreground text-sm font-medium">
              Latest Score
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Practice Area (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          <VoiceRecorder
            targetText={selectedSentence.text}
            onRecordingComplete={handleRecordingComplete}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sentence Selector */}
          <Card>
            <h3 className="mb-4 font-bold">Practice Sentences</h3>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {PRACTICE_SENTENCES.map((sentence) => (
                <button
                  key={sentence.id}
                  onClick={() => setSelectedSentence(sentence)}
                  className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                    selectedSentence.id === sentence.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Badge
                      className={`text-xs ${
                        sentence.difficulty === "Beginner"
                          ? "border-green-500/20 bg-green-500/10 text-green-400"
                          : sentence.difficulty === "Intermediate"
                            ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                            : "border-purple-500/20 bg-purple-500/10 text-purple-400"
                      }`}
                    >
                      {sentence.difficulty}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {sentence.category}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium">
                    {sentence.text}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {sentence.phonetic}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Recording History */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold">
                <History className="h-5 w-5" />
                Recent Recordings
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? "Hide" : "Show"}
              </Button>
            </div>

            {showHistory && (
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {recordings.length === 0 ? (
                  <div className="py-8 text-center">
                    <Mic className="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p className="text-muted-foreground text-sm">
                      No recordings yet
                    </p>
                  </div>
                ) : (
                  recordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="border-border hover:border-primary/50 rounded-lg border p-3 transition-colors"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <p className="line-clamp-1 flex-1 text-sm font-medium">
                          {recording.text}
                        </p>
                        {recording.ai_score && (
                          <span className="text-primary ml-2 text-sm font-bold">
                            {recording.ai_score}
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        {new Date(recording.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
