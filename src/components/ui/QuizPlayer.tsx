"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./Card";
import { Button } from "./button";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { Quiz } from "@/lib/data/quizzes";
import { useSound } from "@/hooks/useSound";
import { Confetti } from "@/components/ui/Confetti";

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete?: (score: number, passed: boolean) => void;
  onExit?: () => void;
}

export function QuizPlayer({ quiz, onComplete, onExit }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { playSound } = useSound();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    if (!showExplanation) {
      setSelectedAnswer(optionIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setIsComplete(true);
  };

  const calculateScore = () => {
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points;
      if (answers[index] === question.correctAnswer) {
        correctCount++;
        earnedPoints += question.points;
      }
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);

    // Play sound based on result
    if (percentage >= quiz.passingScore) {
      playSound("success");
    } else {
      playSound("error");
    }

    return { percentage, correctCount, earnedPoints, totalPoints };
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setShowExplanation(false);
    setIsComplete(false);
  };

  if (isComplete) {
    const score = calculateScore();
    const passed = score.percentage >= quiz.passingScore;

    if (onComplete) {
      onComplete(score.percentage, passed);
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl"
      >
        <Confetti active={passed} />
        <Card variant="highlight" className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6"
          >
            {passed ? (
              <div className="gradient-primary mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            ) : (
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
                <RotateCcw className="h-10 w-10 text-red-400" />
              </div>
            )}
          </motion.div>

          <h2 className="mb-2 text-3xl font-bold">
            {passed ? "🎉 Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {passed
              ? "You've passed the quiz!"
              : `You need ${quiz.passingScore}% to pass`}
          </p>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4">
              <div className="gradient-text text-3xl font-bold">
                {score.percentage}%
              </div>
              <div className="text-muted-foreground text-sm">Score</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-primary text-3xl font-bold">
                {score.correctCount}/{quiz.questions.length}
              </div>
              <div className="text-muted-foreground text-sm">Correct</div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={handleRestart}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="primary" onClick={onExit}>
              Continue Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          <Badge variant="primary">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Badge>
        </div>
        <ProgressBar value={progress} variant="linear" showLabel />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="default" className="mb-6">
            <div className="mb-6 flex items-start gap-3">
              <div className="gradient-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">
                  {currentQuestion.question}
                </h3>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4" />
                  <span>{currentQuestion.points} points</span>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showResult = showExplanation;

                const variant = "interactive";
                let className = "cursor-pointer transition-all";

                if (showResult) {
                  if (isCorrect) {
                    className += " border-green-500 bg-green-500/10";
                  } else if (isSelected && !isCorrect) {
                    className += " border-red-500 bg-red-500/10";
                  }
                }

                return (
                  <Card
                    key={index}
                    variant={variant}
                    className={className}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-border/40 mt-6 border-t pt-6"
                >
                  <div className="flex gap-3">
                    <div className="bg-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      💡
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold">Explanation</h4>
                      <p className="text-muted-foreground mb-3 text-sm">
                        {currentQuestion.explanation}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                      >
                        <Sparkles className="h-3 w-3" />
                        Ask AI for more details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit}>
          Exit Quiz
        </Button>
        <div className="flex gap-3">
          {!showExplanation ? (
            <Button
              variant="primary"
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
            >
              Submit Answer
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNextQuestion}>
              {currentQuestionIndex < quiz.questions.length - 1
                ? "Next Question"
                : "See Results"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
