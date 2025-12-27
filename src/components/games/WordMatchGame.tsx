"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import {
  Shuffle,
  Trophy,
  Star,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";

interface Word {
  word: string;
  meaning: string;
}

const WORD_POOL: Word[] = [
  { word: "Ambitious", meaning: "Having a strong desire for success" },
  { word: "Benevolent", meaning: "Kind and generous" },
  { word: "Cautious", meaning: "Careful to avoid problems" },
  { word: "Diligent", meaning: "Hard-working and careful" },
  { word: "Eloquent", meaning: "Fluent and persuasive speaking" },
  { word: "Frugal", meaning: "Economical with money" },
  { word: "Genuine", meaning: "Authentic and sincere" },
  { word: "Humble", meaning: "Not proud or arrogant" },
  { word: "Innovative", meaning: "Introducing new ideas" },
  { word: "Jovial", meaning: "Cheerful and friendly" },
];

export function WordMatchGame() {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null
  );
  const [gameComplete, setGameComplete] = useState(false);

  // Initialize game words once on mount
  const [gameWords, setGameWords] = useState<Word[]>(() => {
    return [...WORD_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
  });

  const [shuffledMeanings, setShuffledMeanings] = useState<string[]>(() => {
    const selectedWords = [...WORD_POOL]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    return selectedWords.map((w) => w.meaning).sort(() => Math.random() - 0.5);
  });

  const startNewRound = useCallback(() => {
    // Select 5 random words
    const selectedWords = [...WORD_POOL]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    setGameWords(selectedWords);
    setShuffledMeanings(
      [...selectedWords].map((w) => w.meaning).sort(() => Math.random() - 0.5)
    );
    setMatched(new Set());
    setSelectedWord(null);
    setSelectedMeaning(null);
    setFeedback(null);
  }, []);

  const handleWordClick = (word: string) => {
    if (matched.has(word)) return;
    setSelectedWord(word);
    if (selectedMeaning) {
      checkMatch(word, selectedMeaning);
    }
  };

  const handleMeaningClick = (meaning: string) => {
    if (
      Array.from(matched).some(
        (w) => gameWords.find((gw) => gw.word === w)?.meaning === meaning
      )
    )
      return;
    setSelectedMeaning(meaning);
    if (selectedWord) {
      checkMatch(selectedWord, meaning);
    }
  };

  const checkMatch = (word: string, meaning: string) => {
    const wordObj = gameWords.find((w) => w.word === word);

    if (wordObj && wordObj.meaning === meaning) {
      setFeedback("correct");
      setMatched((prev) => new Set([...prev, word]));
      setScore((prev) => prev + 10);

      setTimeout(() => {
        setSelectedWord(null);
        setSelectedMeaning(null);
        setFeedback(null);

        // Check if round is complete
        if (matched.size + 1 === gameWords.length) {
          if (round < 3) {
            setTimeout(() => {
              setRound((prev) => prev + 1);
              startNewRound();
            }, 1000);
          } else {
            setGameComplete(true);
          }
        }
      }, 800);
    } else {
      setFeedback("incorrect");
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedMeaning(null);
        setFeedback(null);
      }, 800);
    }
  };

  const resetGame = () => {
    setScore(0);
    setRound(1);
    setGameComplete(false);
    startNewRound();
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
                <h2 className="mb-2 text-3xl font-bold">Game Complete!</h2>
                <p className="text-muted-foreground">
                  Excellent vocabulary matching!
                </p>
              </div>

              <Card className="border-border/40 bg-primary/5 mb-6 p-6">
                <div className="text-primary text-4xl font-bold">{score}</div>
                <div className="text-muted-foreground text-sm">Total Score</div>
              </Card>

              <Button onClick={resetGame} size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Play Again
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold">Word Match</h1>
              <p className="text-muted-foreground text-lg">
                Match words with their meanings
              </p>
            </div>
            <div className="flex gap-4">
              <Card className="border-border/40 bg-primary/5 flex items-center gap-2 px-4 py-2">
                <Star className="text-primary h-5 w-5" />
                <span className="text-xl font-bold">{score}</span>
              </Card>
              <Card className="border-border/40 flex items-center gap-2 px-4 py-2">
                <Zap className="h-5 w-5 text-cyan-400" />
                <span className="text-xl font-bold">Round {round}/3</span>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Card
                className={`border p-4 text-center ${
                  feedback === "correct"
                    ? "border-green-500/40 bg-green-500/10"
                    : "border-red-500/40 bg-red-500/10"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {feedback === "correct" ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <span className="font-semibold text-green-400">
                        Correct! +10 points
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-400" />
                      <span className="font-semibold text-red-400">
                        Try again!
                      </span>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Board */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Words Column */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Words</h3>
            <div className="space-y-3">
              {gameWords.map((word, index) => (
                <motion.div
                  key={word.word}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => handleWordClick(word.word)}
                    disabled={matched.has(word.word)}
                    className={`w-full justify-start text-lg font-semibold ${
                      matched.has(word.word)
                        ? "border-green-500/40 bg-green-500/10 opacity-50"
                        : selectedWord === word.word
                          ? "border-primary bg-primary/10"
                          : ""
                    }`}
                  >
                    {matched.has(word.word) && (
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                    )}
                    {word.word}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Meanings Column */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Meanings</h3>
            <div className="space-y-3">
              {shuffledMeanings.map((meaning, index) => {
                const isMatched = Array.from(matched).some(
                  (w) =>
                    gameWords.find((gw) => gw.word === w)?.meaning === meaning
                );

                return (
                  <motion.div
                    key={meaning}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handleMeaningClick(meaning)}
                      disabled={isMatched}
                      className={`w-full justify-start text-left ${
                        isMatched
                          ? "border-green-500/40 bg-green-500/10 opacity-50"
                          : selectedMeaning === meaning
                            ? "border-primary bg-primary/10"
                            : ""
                      }`}
                    >
                      {isMatched && (
                        <CheckCircle2 className="mr-2 h-5 w-5 shrink-0 text-green-400" />
                      )}
                      <span className="flex-1">{meaning}</span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="border-border/40 bg-muted/20 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Shuffle className="text-primary h-4 w-4" />
              How to Play
            </h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Select a word from the left column</li>
              <li>• Select the matching meaning from the right column</li>
              <li>• Earn 10 points for each correct match</li>
              <li>• Complete 3 rounds to finish the game</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
