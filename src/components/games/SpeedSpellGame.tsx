"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import {
  Timer,
  Trophy,
  Star,
  Zap,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

const WORDS = [
  "SCHEDULE",
  "COLLEAGUE",
  "RESTAURANT",
  "ENVIRONMENT",
  "COMFORTABLE",
  "PRESENTATION",
  "PRONUNCIATION",
  "VOCABULARY",
  "FLUENT",
  "GRAMMAR",
  "CONVERSATION",
  "PRACTICE",
];

export function SpeedSpellGame() {
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );

  const selectNewWord = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord);
    setUserInput("");
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameActive(false);
            setGameComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameActive, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setWordsCompleted(0);
    setGameActive(true);
    setGameComplete(false);
    selectNewWord();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (userInput.toUpperCase() === currentWord) {
      setFeedback("correct");
      setScore((prev) => prev + 10);
      setWordsCompleted((prev) => prev + 1);

      setTimeout(() => {
        selectNewWord();
      }, 500);
    } else {
      setFeedback("incorrect");
      setTimeout(() => {
        setFeedback(null);
        setUserInput("");
      }, 800);
    }
  };

  if (gameComplete) {
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
                <h2 className="mb-2 text-3xl font-bold">Time\u2019s Up!</h2>
                <p className="text-muted-foreground">
                  Great job on your typing speed!
                </p>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <Card className="border-border/40 bg-primary/5 p-4">
                  <div className="text-primary text-3xl font-bold">{score}</div>
                  <div className="text-muted-foreground text-sm">
                    Total Score
                  </div>
                </Card>
                <Card className="border-border/40 bg-cyan-500/5 p-4">
                  <div className="text-3xl font-bold text-cyan-400">
                    {wordsCompleted}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Words Spelled
                  </div>
                </Card>
              </div>

              <Button onClick={startGame} size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Play Again
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!gameActive) {
    return (
      <div className="bg-background min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-8">
              <div className="mb-6 text-center">
                <div className="bg-primary/20 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <Zap className="text-primary h-10 w-10" />
                </div>
                <h1 className="mb-2 text-4xl font-bold">Speed Spell</h1>
                <p className="text-muted-foreground text-lg">
                  Type words as fast as you can!
                </p>
              </div>

              <div className="border-border/40 bg-muted/20 mb-6 rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">How to Play</h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>
                    • You have 60 seconds to spell as many words as possible
                  </li>
                  <li>• Type the word shown on screen correctly</li>
                  <li>• Earn 10 points for each correct word</li>
                  <li>• Beat your high score!</li>
                </ul>
              </div>

              <Button onClick={startGame} size="lg" className="w-full gap-2">
                <Timer className="h-5 w-5" />
                Start Game
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Speed Spell</h1>
            <div className="flex gap-4">
              <Card className="border-border/40 bg-primary/5 flex items-center gap-2 px-4 py-2">
                <Star className="text-primary h-5 w-5" />
                <span className="text-xl font-bold">{score}</span>
              </Card>
              <Card
                className={`border-border/40 flex items-center gap-2 px-4 py-2 ${
                  timeLeft <= 10 ? "animate-pulse bg-red-500/10" : ""
                }`}
              >
                <Timer
                  className={`h-5 w-5 ${timeLeft <= 10 ? "text-red-400" : "text-cyan-400"}`}
                />
                <span className="text-xl font-bold">{timeLeft}s</span>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Main Game Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-12">
            {/* Word Display */}
            <div className="mb-8 text-center">
              <motion.h2
                key={currentWord}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-2 text-6xl font-bold tracking-wider"
              >
                {currentWord}
              </motion.h2>
              <p className="text-muted-foreground text-sm">
                {currentWord.length} letters
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type the word here..."
                autoFocus
                className={`bg-background focus:ring-primary w-full rounded-lg border-2 px-6 py-4 text-center text-2xl font-semibold tracking-widest uppercase transition-colors focus:ring-2 focus:outline-none ${
                  feedback === "correct"
                    ? "border-green-500 bg-green-500/5"
                    : feedback === "incorrect"
                      ? "border-red-500 bg-red-500/5"
                      : "border-border/40 focus:border-primary"
                }`}
              />
            </form>

            {/* Feedback */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-center gap-2 rounded-lg border p-3 ${
                  feedback === "correct"
                    ? "border-green-500/40 bg-green-500/10 text-green-400"
                    : "border-red-500/40 bg-red-500/10 text-red-400"
                }`}
              >
                {feedback === "correct" ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Correct! +10 points</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Try again!</span>
                  </>
                )}
              </motion.div>
            )}

            {/* Stats */}
            <div className="mt-8 flex justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold">{wordsCompleted}</div>
                <div className="text-muted-foreground text-xs">
                  Words Completed
                </div>
              </div>
              <div className="bg-border h-12 w-px" />
              <div>
                <div className="text-2xl font-bold">
                  {wordsCompleted > 0
                    ? Math.round((score / wordsCompleted) * 10) / 10
                    : 0}
                </div>
                <div className="text-muted-foreground text-xs">Avg. Speed</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="border-border/40 bg-muted/20 p-4">
            <p className="text-muted-foreground text-center text-sm">
              💡 Tip: Focus on accuracy first, then speed will follow!
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
