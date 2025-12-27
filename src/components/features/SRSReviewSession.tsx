"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Volume2, Trophy } from "lucide-react";
import { type SRSData, REVIEW_QUALITIES, calculateNextReview } from "@/lib/srs";

interface VocabularyWord {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  example?: string;
  category?: string;
  srs_data?: SRSData;
}

interface SRSReviewSessionProps {
  words: VocabularyWord[];
  onComplete: (results: ReviewResult[]) => void;
  onExit: () => void;
}

interface ReviewResult {
  wordId: string;
  quality: 1 | 2 | 3 | 4;
  newSRSData: SRSData;
}

export function SRSReviewSession({
  words,
  onComplete,
  onExit,
}: SRSReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  const handleQualitySelect = (quality: 1 | 2 | 3 | 4) => {
    const currentSRS = currentWord.srs_data || {
      ease_factor: 2.5,
      interval_days: 1,
      repetitions: 0,
      next_review_date: new Date().toISOString(),
      last_reviewed: new Date().toISOString(),
    };

    const newSRSData = calculateNextReview(currentSRS, quality);

    setResults([
      ...results,
      {
        wordId: currentWord.id,
        quality,
        newSRSData,
      },
    ]);

    // Move to next word
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setSessionComplete(true);
    }
  };

  const playPronunciation = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (sessionComplete) {
    const averageQuality =
      results.reduce((sum, r) => sum + r.quality, 0) / results.length;
    const perfectCount = results.filter((r) => r.quality === 4).length;

    return (
      <div className="bg-background min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8 text-center">
              <div className="mb-6">
                <div className="bg-primary/20 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <Trophy className="text-primary h-10 w-10" />
                </div>
                <h2 className="mb-2 text-3xl font-bold">Review Complete!</h2>
                <p className="text-muted-foreground">
                  Great job on your review session
                </p>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <Card className="border-border/40 bg-primary/5 p-4">
                  <div className="text-primary text-3xl font-bold">
                    {words.length}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Words Reviewed
                  </div>
                </Card>
                <Card className="border-border/40 bg-green-500/5 p-4">
                  <div className="text-3xl font-bold text-green-400">
                    {perfectCount}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Perfect Recalls
                  </div>
                </Card>
                <Card className="border-border/40 bg-cyan-500/5 p-4">
                  <div className="text-3xl font-bold text-cyan-400">
                    {averageQuality.toFixed(1)}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Avg. Quality
                  </div>
                </Card>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => onComplete(results)}
                  size="lg"
                  className="flex-1"
                >
                  Finish
                </Button>
                <Button onClick={onExit} variant="outline" size="lg">
                  Exit
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {currentIndex + 1} / {words.length}
            </span>
          </div>
          <div className="bg-muted/20 h-2 w-full overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="from-primary h-full bg-linear-to-r to-cyan-500"
            />
          </div>
        </div>

        {/* Flashcard */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6 min-h-[400px] p-8">
              {!showAnswer ? (
                /* Question Side */
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={playPronunciation}
                      className="gap-2"
                    >
                      <Volume2 className="h-4 w-4" />
                      Listen
                    </Button>
                  </div>

                  <h2 className="mb-4 text-5xl font-bold">
                    {currentWord.word}
                  </h2>

                  {currentWord.pronunciation && (
                    <p className="text-muted-foreground mb-6 text-xl">
                      {currentWord.pronunciation}
                    </p>
                  )}

                  {currentWord.category && (
                    <div className="mb-6">
                      <span className="bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
                        {currentWord.category}
                      </span>
                    </div>
                  )}

                  <p className="text-muted-foreground text-lg">
                    Try to recall the meaning...
                  </p>

                  <Button
                    onClick={() => setShowAnswer(true)}
                    size="lg"
                    className="mt-8"
                  >
                    Show Answer
                  </Button>
                </div>
              ) : (
                /* Answer Side */
                <div className="flex h-full flex-col">
                  <div className="mb-6 flex-1">
                    <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                      Meaning
                    </h3>
                    <p className="mb-6 text-2xl font-semibold">
                      {currentWord.meaning}
                    </p>

                    {currentWord.example && (
                      <>
                        <h3 className="text-muted-foreground mb-2 text-sm font-medium">
                          Example
                        </h3>
                        <p className="text-muted-foreground italic">
                          {currentWord.example}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Quality Buttons */}
                  <div>
                    <h3 className="text-muted-foreground mb-3 text-center text-sm font-medium">
                      How well did you remember?
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {REVIEW_QUALITIES.map((q) => (
                        <Button
                          key={q.quality}
                          onClick={() => handleQualitySelect(q.quality)}
                          variant="outline"
                          className={`flex flex-col gap-1 p-4 ${
                            q.quality === 1
                              ? "hover:border-red-500/40 hover:bg-red-500/10"
                              : q.quality === 2
                                ? "hover:border-yellow-500/40 hover:bg-yellow-500/10"
                                : q.quality === 3
                                  ? "hover:border-green-500/40 hover:bg-green-500/10"
                                  : "hover:border-cyan-500/40 hover:bg-cyan-500/10"
                          }`}
                        >
                          <span className="text-lg font-bold">{q.label}</span>
                          <span className="text-muted-foreground text-xs">
                            {q.description}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onExit}>
            Exit Review
          </Button>

          {showAnswer && (
            <p className="text-muted-foreground text-sm">
              💡 Select your recall quality above
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
