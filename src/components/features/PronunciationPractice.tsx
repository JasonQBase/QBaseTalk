"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
  Mic,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Pause,
} from "lucide-react";

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition: {
    new (): SpeechRecognitionInstance;
  };
}

interface Word {
  id: string;
  word: string;
  pronunciation: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const PRACTICE_WORDS: Word[] = [
  {
    id: "1",
    word: "Schedule",
    pronunciation: "/ˈʃedjuːl/",
    difficulty: "Beginner",
  },
  {
    id: "2",
    word: "Colleague",
    pronunciation: "/ˈkɒliːɡ/",
    difficulty: "Intermediate",
  },
  {
    id: "3",
    word: "Entrepreneur",
    pronunciation: "/ˌɒntrəprəˈnɜː/",
    difficulty: "Advanced",
  },
  {
    id: "4",
    word: "Pronunciation",
    pronunciation: "/prəˌnʌnsɪˈeɪʃən/",
    difficulty: "Intermediate",
  },
  {
    id: "5",
    word: "Restaurant",
    pronunciation: "/ˈrestərɒnt/",
    difficulty: "Beginner",
  },
  {
    id: "6",
    word: "Environment",
    pronunciation: "/ɪnˈvaɪrənmənt/",
    difficulty: "Intermediate",
  },
  {
    id: "7",
    word: "Comfortable",
    pronunciation: "/ˈkʌmftəbəl/",
    difficulty: "Beginner",
  },
  {
    id: "8",
    word: "Extraordinary",
    pronunciation: "/ɪkˈstrɔːdənəri/",
    difficulty: "Advanced",
  },
];

interface PronunciationResult {
  word: string;
  userInput: string;
  score: number;
  feedback: string;
  isCorrect: boolean;
}

export function PronunciationPractice() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [results, setResults] = useState<PronunciationResult[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const currentWord = PRACTICE_WORDS[currentWordIndex];

  // Helper functions declared before usage
  const getEditDistance = useCallback((str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }, []);

  const calculateSimilarity = useCallback(
    (str1: string, str2: string): number => {
      // Simple Levenshtein distance-based similarity
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;

      if (longer.length === 0) return 1.0;

      const editDistance = getEditDistance(longer, shorter);
      return (longer.length - editDistance) / longer.length;
    },
    [getEditDistance]
  );

  const getFeedback = useCallback((score: number): string => {
    if (score >= 90) return "Excellent! Perfect pronunciation!";
    if (score >= 80) return "Great job! Very close!";
    if (score >= 70) return "Good! Keep practicing!";
    if (score >= 60) return "Not bad, but needs improvement.";
    return "Try again! Listen carefully and repeat.";
  }, []);

  const handlePronunciationResult = useCallback(
    (transcript: string, confidence: number) => {
      const targetWord = currentWord.word.toLowerCase();
      const similarity = calculateSimilarity(transcript, targetWord);
      const score = Math.round((similarity * 0.7 + confidence * 0.3) * 100);
      const isCorrect = score >= 70;

      const result: PronunciationResult = {
        word: currentWord.word,
        userInput: transcript,
        score,
        feedback: getFeedback(score),
        isCorrect,
      };

      setResults((prev) => [...prev, result]);

      // Move to next word or complete session
      setTimeout(() => {
        setCurrentWordIndex((prev) => {
          if (prev < PRACTICE_WORDS.length - 1) {
            return prev + 1;
          } else {
            setSessionComplete(true);
            return prev;
          }
        });
      }, 2000);
    },
    [currentWord.word, calculateSimilarity, getFeedback]
  );

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognitionClass = (window as WindowWithSpeechRecognition)
        .webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionClass();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const confidence = event.results[0][0].confidence;
        handlePronunciationResult(transcript, confidence);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognitionInstance;
    }
  }, [handlePronunciationResult]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const playPronunciation = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = "en-US";
      utterance.rate = 0.8;

      setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);

      speechSynthesis.speak(utterance);
    }
  };

  const resetSession = () => {
    setCurrentWordIndex(0);
    setResults([]);
    setSessionComplete(false);
  };

  const difficultyColors = {
    Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
    Intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Advanced: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  if (sessionComplete) {
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const averageScore = Math.round(totalScore / results.length);
    const correctCount = results.filter((r) => r.isCorrect).length;

    return (
      <div className="bg-background min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="p-8">
              <div className="mb-6">
                <div className="bg-primary/20 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <CheckCircle2 className="text-primary h-10 w-10" />
                </div>
                <h2 className="mb-2 text-3xl font-bold">Session Complete!</h2>
                <p className="text-muted-foreground">
                  Great job practicing your pronunciation
                </p>
              </div>

              <div className="mb-8 grid gap-4 md:grid-cols-3">
                <Card className="border-border/40 bg-primary/5 p-4">
                  <div className="text-primary text-3xl font-bold">
                    {averageScore}%
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Average Score
                  </div>
                </Card>
                <Card className="border-border/40 bg-green-500/5 p-4">
                  <div className="text-3xl font-bold text-green-400">
                    {correctCount}/{PRACTICE_WORDS.length}
                  </div>
                  <div className="text-muted-foreground text-sm">Correct</div>
                </Card>
                <Card className="border-border/40 bg-cyan-500/5 p-4">
                  <div className="text-3xl font-bold text-cyan-400">
                    +{averageScore}
                  </div>
                  <div className="text-muted-foreground text-sm">XP Earned</div>
                </Card>
              </div>

              <div className="mb-6 space-y-2">
                <h3 className="mb-3 text-lg font-semibold">Your Results</h3>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="border-border/40 bg-card/50 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {result.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <div>
                        <div className="font-medium">{result.word}</div>
                        <div className="text-muted-foreground text-xs">
                          You said: &quot;{result.userInput}&quot;
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{result.score}%</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={resetSession} size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Practice Again
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const lastResult = results[results.length - 1];

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-4xl font-bold">Pronunciation Practice</h1>
          <p className="text-muted-foreground text-lg">
            Improve your English pronunciation with AI-powered feedback
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {currentWordIndex + 1} / {PRACTICE_WORDS.length}
            </span>
          </div>
          <div className="bg-muted/20 h-2 w-full overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((currentWordIndex + 1) / PRACTICE_WORDS.length) * 100}%`,
              }}
              className="from-primary h-full bg-linear-to-r to-cyan-500"
            />
          </div>
        </motion.div>

        {/* Main Practice Card */}
        <motion.div
          key={currentWordIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <Badge
                className={`border ${difficultyColors[currentWord.difficulty]}`}
              >
                {currentWord.difficulty}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={playPronunciation}
                disabled={isPlaying}
                className="gap-2"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Listen
              </Button>
            </div>

            <div className="mb-8 text-center">
              <h2 className="mb-3 text-5xl font-bold">{currentWord.word}</h2>
              <p className="text-muted-foreground text-xl">
                {currentWord.pronunciation}
              </p>
            </div>

            {/* Recording Button */}
            <div className="mb-6 text-center">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className={`h-24 w-24 rounded-full ${
                  isRecording
                    ? "animate-pulse bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/90"
                }`}
              >
                <Mic className="h-10 w-10" />
              </Button>
              <p className="text-muted-foreground mt-4 text-sm">
                {isRecording
                  ? "Listening... Speak now!"
                  : "Tap to start recording"}
              </p>
            </div>

            {/* Last Result Feedback */}
            {lastResult && lastResult.word === currentWord.word && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border p-4 ${
                  lastResult.isCorrect
                    ? "border-green-500/20 bg-green-500/5"
                    : "border-red-500/20 bg-red-500/5"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  {lastResult.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className="font-semibold">
                    Score: {lastResult.score}%
                  </span>
                </div>
                <p className="text-sm">{lastResult.feedback}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  You said: &quot;{lastResult.userInput}&quot;
                </p>
              </motion.div>
            )}
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
              <Volume2 className="text-primary h-4 w-4" />
              Tips for Better Pronunciation
            </h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>• Listen to the word first before speaking</li>
              <li>• Speak clearly and at a moderate pace</li>
              <li>• Try to match the stress and intonation</li>
              <li>• Practice in a quiet environment for best results</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
