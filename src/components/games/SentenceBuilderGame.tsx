"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
  Puzzle,
  Trophy,
  Star,
  CheckCircle2,
  RotateCcw,
  Lightbulb,
} from "lucide-react";

interface SentencePart {
  id: string;
  text: string;
  order: number;
}

const SENTENCES = [
  {
    sentence: "I am learning English every day",
    difficulty: "Beginner",
    translation: "Tôi đang học tiếng Anh mỗi ngày",
  },
  {
    sentence: "She has been working here for five years",
    difficulty: "Intermediate",
    translation: "Cô ấy đã làm việc ở đây được năm năm",
  },
  {
    sentence: "We should have finished the project by now",
    difficulty: "Advanced",
    translation: "Chúng ta lẽ ra phải hoàn thành dự án rồi",
  },
  {
    sentence: "They are planning to travel next month",
    difficulty: "Beginner",
    translation: "Họ đang lên kế hoạch du lịch tháng sau",
  },
  {
    sentence: "The presentation was more interesting than I expected",
    difficulty: "Intermediate",
    translation: "Bài thuyết trình thú vị hơn tôi mong đợi",
  },
];

export function SentenceBuilderGame() {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selectedParts, setSelectedParts] = useState<SentencePart[]>([]);
  const [availableParts, setAvailableParts] = useState<SentencePart[]>([]);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  const shuffleSentence = () => {
    const sentence = SENTENCES[currentSentenceIndex];
    const words = sentence.sentence.split(" ");
    const parts: SentencePart[] = words.map((word, index) => ({
      id: `word-${index}`,
      text: word,
      order: index,
    }));

    setAvailableParts([...parts].sort(() => Math.random() - 0.5));
    setSelectedParts([]);
    setIsCorrect(null);
    setShowHint(false);
  };

  useEffect(() => {
    shuffleSentence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePartClick = (part: SentencePart) => {
    setSelectedParts([...selectedParts, part]);
    setAvailableParts(availableParts.filter((p) => p.id !== part.id));
    setIsCorrect(null);
  };

  const handleRemovePart = (part: SentencePart) => {
    setAvailableParts([...availableParts, part]);
    setSelectedParts(selectedParts.filter((p) => p.id !== part.id));
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    const userSentence = selectedParts.map((p) => p.text).join(" ");
    const correctSentence = SENTENCES[currentSentenceIndex].sentence;

    if (userSentence === correctSentence) {
      setIsCorrect(true);
      const points =
        SENTENCES[currentSentenceIndex].difficulty === "Beginner"
          ? 10
          : SENTENCES[currentSentenceIndex].difficulty === "Intermediate"
            ? 15
            : 20;
      setScore(score + points);

      setTimeout(() => {
        if (currentSentenceIndex < SENTENCES.length - 1) {
          setCurrentSentenceIndex(currentSentenceIndex + 1);
          shuffleSentence();
        } else {
          setGameComplete(true);
        }
      }, 2000);
    } else {
      setIsCorrect(false);
    }
  };

  const resetGame = () => {
    setCurrentSentenceIndex(0);
    setScore(0);
    setGameComplete(false);
    shuffleSentence();
  };

  const difficultyColors = {
    Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
    Intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Advanced: "bg-purple-500/10 text-purple-400 border-purple-500/20",
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
                <h2 className="mb-2 text-3xl font-bold">All Done!</h2>
                <p className="text-muted-foreground">
                  You completed all sentences!
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

  const currentSentence = SENTENCES[currentSentenceIndex];

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold">Sentence Builder</h1>
              <p className="text-muted-foreground text-lg">
                Arrange words to form correct sentences
              </p>
            </div>
            <div className="flex gap-4">
              <Card className="border-border/40 bg-primary/5 flex items-center gap-2 px-4 py-2">
                <Star className="text-primary h-5 w-5" />
                <span className="text-xl font-bold">{score}</span>
              </Card>
              <Card className="border-border/40 flex items-center gap-2 px-4 py-2">
                <Puzzle className="h-5 w-5 text-cyan-400" />
                <span className="text-xl font-bold">
                  {currentSentenceIndex + 1}/{SENTENCES.length}
                </span>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Game Card */}
        <motion.div
          key={currentSentenceIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <Badge
                className={`border ${difficultyColors[currentSentence.difficulty as keyof typeof difficultyColors]}`}
              >
                {currentSentence.difficulty}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                {showHint ? "Hide" : "Show"} Hint
              </Button>
            </div>

            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6"
                >
                  <Card className="border-border/40 bg-primary/5 p-4">
                    <p className="text-muted-foreground text-sm italic">
                      {currentSentence.translation}
                    </p>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Area (Answer) */}
            <div className="mb-6">
              <h3 className="text-muted-foreground mb-3 text-sm font-semibold">
                Your Sentence:
              </h3>
              <div className="border-primary/40 bg-primary/5 min-h-[80px] rounded-lg border-2 border-dashed p-4">
                <div className="flex flex-wrap gap-2">
                  {selectedParts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Tap words below to build your sentence...
                    </p>
                  ) : (
                    selectedParts.map((part) => (
                      <motion.div
                        key={part.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => handleRemovePart(part)}
                          className="border-primary/40 bg-primary/10 hover:bg-primary/20"
                        >
                          {part.text}
                        </Button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Available Words */}
            <div className="mb-6">
              <h3 className="text-muted-foreground mb-3 text-sm font-semibold">
                Available Words:
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableParts.map((part) => (
                  <motion.div
                    key={part.id}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => handlePartClick(part)}
                      className="hover:border-primary hover:bg-primary/10"
                    >
                      {part.text}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Check Button */}
            <div className="mb-4">
              <Button
                onClick={checkAnswer}
                disabled={selectedParts.length === 0 || isCorrect === true}
                size="lg"
                className="w-full"
              >
                Check Answer
              </Button>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Card
                    className={`border p-4 text-center ${
                      isCorrect
                        ? "border-green-500/40 bg-green-500/10"
                        : "border-red-500/40 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                          <span className="font-semibold text-green-400">
                            Perfect! Moving to next sentence...
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-red-400">
                          Not quite right. Try again!
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
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
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              <Puzzle className="text-primary h-4 w-4" />
              How to Play
            </h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Tap words in the correct order to form a sentence</li>
              <li>• Use the hint if you need help with translation</li>
              <li>• Earn points based on difficulty level</li>
              <li>• Complete all sentences to finish the game</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
