"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Trophy, X, Check } from "lucide-react";
import { Confetti } from "@/components/ui/Confetti";
import { type WordOfDay } from "@/lib/services/wotd";
import { markWordPracticed } from "@/lib/services/wotd";

interface WOTDPracticeQuizProps {
  word: WordOfDay;
  onComplete?: (score: number) => void;
  onClose?: () => void;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: "definition" | "usage" | "synonym" | "antonym";
}

export function WOTDPracticeQuiz({
  word,
  onComplete,
  onClose,
}: WOTDPracticeQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Generate quiz questions based on the word
  const questions: QuizQuestion[] = [
    {
      id: "q1",
      question: `What does "${word.word}" mean?`,
      options: generateDefinitionOptions(word.definition),
      correctAnswer: 0,
      type: "definition",
    },
    {
      id: "q2",
      question: `Choose the sentence that correctly uses "${word.word}":`,
      options: [word.example_1, ...generateFakeExamples(word.word)],
      correctAnswer: 0,
      type: "usage",
    },
    ...(word.synonym
      ? [
          {
            id: "q3",
            question: `Which word is a synonym of "${word.word}"?`,
            options: [
              word.synonym.split(",")[0].trim(),
              ...generateDistractions(),
            ],
            correctAnswer: 0,
            type: "synonym" as const,
          },
        ]
      : []),
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    setAnswers([...answers, isCorrect]);

    // Auto advance after 1.5s
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        // Quiz complete
        const finalScore = Math.round(
          ((answers.filter(Boolean).length + (isCorrect ? 1 : 0)) /
            questions.length) *
            100
        );

        markWordPracticed(word.id, finalScore);

        if (finalScore >= 70) {
          setShowConfetti(true);
        }

        setShowResult(true);

        if (onComplete) {
          onComplete(finalScore);
        }
      }
    }, 1500);
  };

  const score = Math.round(
    (answers.filter(Boolean).length / questions.length) * 100
  );

  if (showResult) {
    return (
      <>
        {showConfetti && <Confetti active={true} />}
        <Card className="mx-auto max-w-md p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div
              className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                score >= 70
                  ? "bg-green-500/20 text-green-600"
                  : "bg-yellow-500/20 text-yellow-600"
              }`}
            >
              <Trophy className="h-10 w-10" />
            </div>

            <h2 className="mb-2 text-2xl font-bold">
              {score >= 70 ? "Excellent! 🎉" : "Good Try! 💪"}
            </h2>

            <p className="mb-4 text-4xl font-bold text-purple-600 dark:text-purple-400">
              {score}%
            </p>

            <p className="text-muted-foreground mb-6">
              You got {answers.filter(Boolean).length} out of {questions.length}{" "}
              questions correct
            </p>

            {score >= 80 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3"
              >
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  ⭐ You&apos;ve mastered this word!
                </p>
              </motion.div>
            )}

            <Button onClick={onClose} className="w-full" size="lg">
              Continue Learning
            </Button>
          </motion.div>
        </Card>
      </>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Practice: {word.word}</h3>
          <p className="text-muted-foreground text-sm">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-muted mb-6 h-2 w-full overflow-hidden rounded-full">
        <motion.div
          className="h-full bg-linear-to-r from-purple-500 to-pink-500"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="mb-6 text-xl font-medium">
            {questions[currentQuestion].question}
          </h4>

          {/* Options */}
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect =
                index === questions[currentQuestion].correctAnswer;
              const showFeedback = selectedAnswer !== null;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    showFeedback
                      ? isCorrect
                        ? "border-green-500 bg-green-500/10"
                        : isSelected
                          ? "border-red-500 bg-red-500/10"
                          : "border-border bg-card"
                      : "border-border bg-card hover:border-purple-500 hover:bg-purple-500/5"
                  }`}
                  whileHover={!showFeedback ? { scale: 1.02 } : {}}
                  whileTap={!showFeedback ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{option}</span>
                    {showFeedback && isCorrect && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}

// Helper functions to generate quiz options
function generateDefinitionOptions(correctDefinition: string): string[] {
  const fakeDefinitions = [
    "A feeling of great happiness and excitement",
    "The act of doing something without thinking carefully",
    "A person who is very knowledgeable about a subject",
    "Something that is difficult to understand or explain",
    "A strong feeling of dislike or opposition",
  ];

  const options = [
    correctDefinition,
    ...fakeDefinitions.slice(0, 3).filter((d) => d !== correctDefinition),
  ];

  return shuffleArray(options).slice(0, 4);
}

function generateFakeExamples(word: string): string[] {
  return [
    `The ${word} was very interesting to read.`,
    `I need to ${word} before the meeting starts.`,
    `She felt ${word} after finishing the project.`,
  ].slice(0, 3);
}

function generateDistractions(): string[] {
  return shuffleArray([
    "different",
    "similar",
    "opposite",
    "unrelated",
    "contradictory",
    "comparable",
  ]).slice(0, 3);
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
