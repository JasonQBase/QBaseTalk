"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
  Sparkles,
  Volume2,
  Check,
  BookOpen,
  Trophy,
  Share2,
  ChevronRight,
} from "lucide-react";
import { type WOTDWithProgress } from "@/lib/services/wotd";
import { markWordViewed } from "@/lib/services/wotd";

interface WordOfDayCardProps {
  word: WOTDWithProgress;
  compact?: boolean;
  onPracticeClick?: () => void;
}

export function WordOfDayCard({
  word,
  compact = false,
  onPracticeClick,
}: WordOfDayCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // Auto-mark as viewed when card is displayed
    if (word.id) {
      markWordViewed(word.id);
    }
  }, [word.id]);

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShare = async () => {
    const shareText = `📚 Word of the Day: ${word.word}\n\n${word.definition}\n\nExample: ${word.example_1}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Word of the Day: ${word.word}`,
          text: shareText,
        });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      // Copied to clipboard
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "Intermediate":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "Advanced":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  if (compact) {
    return (
      <Card className="group cursor-pointer border-purple-500/20 bg-linear-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 p-4 transition-all hover:border-purple-500/40 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-orange-500/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-muted-foreground text-xs font-medium">
                Word of the Day
              </span>
            </div>
            <h3 className="mb-1 text-2xl font-bold transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
              {word.word}
            </h3>
            <p className="text-muted-foreground mb-2 text-sm">
              {word.pronunciation}
            </p>
            <p className="line-clamp-2 text-sm">{word.definition}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPracticeClick}
            className="shrink-0"
          >
            View <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header with gradient */}
      <div className="relative overflow-hidden bg-linear-to-br from-purple-500 via-pink-500 to-orange-500 p-6 text-white">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">
                Word of the Day
              </span>
            </div>
            <Badge className={getDifficultyColor(word.difficulty)}>
              {word.difficulty}
            </Badge>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <h2 className="mb-2 text-4xl font-bold">{word.word}</h2>
            <div className="flex items-center gap-3">
              <p className="text-lg opacity-90">{word.pronunciation}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                className="text-white hover:bg-white/20"
                disabled={speaking}
              >
                <Volume2
                  className={`h-4 w-4 ${speaking ? "animate-pulse" : ""}`}
                />
              </Button>
            </div>
            <p className="mt-2 text-sm italic opacity-75">
              {word.part_of_speech}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-6">
        {/* Definition */}
        <div>
          <h3 className="text-muted-foreground mb-2 flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4" />
            Definition
          </h3>
          <p className="text-lg">{word.definition}</p>
        </div>

        {/* Examples */}
        <div>
          <h3 className="text-muted-foreground mb-3 text-sm font-semibold">
            Examples
          </h3>
          <div className="space-y-2">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-muted/50 dark:bg-muted/20 border-border/50 rounded-lg border p-3"
            >
              <p className="text-sm italic">&ldquo;{word.example_1}&rdquo;</p>
            </motion.div>
            {word.example_2 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-muted/50 dark:bg-muted/20 border-border/50 rounded-lg border p-3"
              >
                <p className="text-sm italic">&ldquo;{word.example_2}&rdquo;</p>
              </motion.div>
            )}
            {word.example_3 && revealed && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-muted/50 dark:bg-muted/20 border-border/50 rounded-lg border p-3"
              >
                <p className="text-sm italic">&ldquo;{word.example_3}&rdquo;</p>
              </motion.div>
            )}
          </div>
          {word.example_3 && !revealed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevealed(true)}
              className="mt-2 text-xs"
            >
              Show more examples
            </Button>
          )}
        </div>

        {/* Synonyms & Antonyms */}
        {(word.synonym || word.antonym) && (
          <div className="grid grid-cols-2 gap-4">
            {word.synonym && (
              <div>
                <h3 className="text-muted-foreground mb-2 text-xs font-semibold">
                  Synonyms
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {word.synonym}
                </p>
              </div>
            )}
            {word.antonym && (
              <div>
                <h3 className="text-muted-foreground mb-2 text-xs font-semibold">
                  Antonyms
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {word.antonym}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Progress indicators */}
        {word.progress && (
          <div className="flex flex-wrap gap-2">
            {word.progress.viewed && (
              <Badge variant="secondary" className="text-xs">
                <Check className="mr-1 h-3 w-3" />
                Viewed
              </Badge>
            )}
            {word.progress.practiced && (
              <Badge variant="secondary" className="text-xs">
                <BookOpen className="mr-1 h-3 w-3" />
                Practiced
              </Badge>
            )}
            {word.progress.mastered && (
              <Badge variant="secondary" className="text-xs text-yellow-600">
                <Trophy className="mr-1 h-3 w-3" />
                Mastered
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onPracticeClick}
            className="flex-1 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Practice Now
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
