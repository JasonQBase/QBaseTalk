"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "./Modal";
import { Button } from "./button";
import { Confetti } from "./Confetti";
import { CircularProgress } from "./CircularProgress";
import { Trophy, Clock, Star } from "lucide-react";
import {
  submitChallenge,
  type DailyChallenge,
  type ChallengeResult,
} from "@/lib/services/challenge";

interface ChallengeModalProps {
  challenge: DailyChallenge | null;
  open: boolean;
  onClose: () => void;
  onComplete: (result: ChallengeResult) => void;
}

export function ChallengeModal({
  challenge,
  open,
  onClose,
  onComplete,
}: ChallengeModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (!open || showResults) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [open, showResults]);

  // State resets when modal closes

  if (!challenge) return null;

  const isQuizType =
    challenge.challenge_type === "vocab_quiz" ||
    challenge.challenge_type === "grammar";
  const questions = challenge.content.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!challenge) return;

    const challengeResult = await submitChallenge(challenge.id, answers);

    if (challengeResult) {
      setResult(challengeResult);
      setShowResults(true);

      // Show confetti if score is good
      if (challengeResult.score >= challengeResult.max_score * 0.8) {
        setShowConfetti(true);
      }
    }
  };

  const handleClose = () => {
    if (result) {
      onComplete(result);
    }
    onClose();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Results Screen
  if (showResults && result) {
    const percentage = (result.score / result.max_score) * 100;
    const isPerfect = result.score === result.max_score;

    return (
      <Modal open={open} onOpenChange={handleClose} title="" description="">
        {showConfetti && <Confetti active={true} />}

        <div className="py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mb-6 inline-block"
          >
            <div className="relative">
              <CircularProgress
                percentage={percentage}
                size={160}
                strokeWidth={12}
                color="hsl(var(--primary))"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">{result.score}</div>
                <div className="text-muted-foreground text-sm">
                  / {result.max_score}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-2 text-3xl font-bold">
              {isPerfect
                ? "Perfect Score! 🎉"
                : percentage >= 80
                  ? "Great Job! 🌟"
                  : percentage >= 60
                    ? "Good Effort! 👍"
                    : "Keep Practicing! 💪"}
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              You scored {percentage.toFixed(0)}% on today&apos;s challenge
            </p>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              <div className="border-border/40 bg-card/50 rounded-lg border p-4">
                <div className="text-primary mb-1 flex items-center justify-center gap-2 text-2xl font-bold">
                  <Star className="fill-primary h-6 w-6" />
                  {result.xp_earned}
                </div>
                <div className="text-muted-foreground text-sm">XP Earned</div>
              </div>

              <div className="border-border/40 bg-card/50 rounded-lg border p-4">
                <div className="mb-1 text-2xl font-bold text-orange-400">
                  {result.new_streak}
                </div>
                <div className="text-muted-foreground text-sm">Day Streak</div>
              </div>

              <div className="border-border/40 bg-card/50 rounded-lg border p-4">
                <div className="mb-1 text-2xl font-bold">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-muted-foreground text-sm">Time</div>
              </div>
            </div>

            <Button size="lg" onClick={handleClose} className="w-full gap-2">
              <Trophy className="h-5 w-5" />
              Awesome!
            </Button>
          </motion.div>
        </div>
      </Modal>
    );
  }

  // Quiz Screen
  if (isQuizType && currentQuestion) {
    const selectedAnswer = answers[currentQuestion.id];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <Modal
        open={open}
        onOpenChange={onClose}
        title="Daily Challenge"
        description={`Question ${currentQuestionIndex + 1} of ${questions.length}`}
      >
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <div className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </div>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <motion.div
                className="bg-primary h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() =>
                        handleAnswerSelect(currentQuestion.id, index)
                      }
                      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                        selectedAnswer === index
                          ? "border-primary bg-primary/10"
                          : "border-border/40 bg-card/50 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-semibold ${
                            selectedAnswer === index
                              ? "border-primary bg-primary text-white"
                              : "border-border/60"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <div className="text-muted-foreground text-sm">
              {Object.keys(answers).length} / {questions.length} answered
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
                className="gap-2"
              >
                <Trophy className="h-4 w-4" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  // For other challenge types (pronunciation, conversation)
  return (
    <Modal open={open} onOpenChange={onClose} title="Daily Challenge">
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          This challenge type is coming soon!
        </p>
        <Button onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    </Modal>
  );
}
