"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  saveRecording,
  analyzeWithAI,
  type AIFeedback,
} from "@/lib/services/pronunciation";
import { useToast } from "@/lib/hooks/use-toast";

interface VoiceRecorderProps {
  targetText: string;
  onRecordingComplete?: () => void;
}

export function VoiceRecorder({
  targetText,
  onRecordingComplete,
}: VoiceRecorderProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description:
          "Unable to access microphone. Please grant permission and try again.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const resetRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setAudioBlob(null);
    setDuration(0);
    setFeedback(null);
    setScore(null);
    setIsPlaying(false);
  };

  const playRecording = () => {
    if (audioRef.current && audioURL) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    try {
      setAnalyzing(true);

      // Save recording
      const recording = await saveRecording(targetText, audioBlob, duration);
      if (!recording) {
        throw new Error("Failed to save recording");
      }

      // Analyze with AI
      const success = await analyzeWithAI(recording.id, targetText);
      if (!success) {
        throw new Error("Failed to analyze recording");
      }

      // Fetch the updated recording with feedback
      const { getRecording } = await import("@/lib/services/pronunciation");
      const updatedRecording = await getRecording(recording.id);

      if (updatedRecording && updatedRecording.ai_feedback) {
        setFeedback(updatedRecording.ai_feedback as AIFeedback);
        setScore(updatedRecording.ai_score);
        onRecordingComplete?.();
      }
    } catch (error) {
      console.error("Error analyzing recording:", error);
      toast({
        title: "Analysis Failed",
        description:
          "There was an error analyzing your pronunciation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-xl font-bold">Practice Sentence</h3>
          <p className="text-primary text-2xl font-medium">{targetText}</p>
        </div>

        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-6">
          {/* Waveform Visualization (Simplified) */}
          <div className="bg-muted/30 relative flex h-32 w-full max-w-md items-center justify-center overflow-hidden rounded-lg">
            {isRecording ? (
              <div className="flex h-full items-center gap-1">
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-primary/80 w-1 rounded-full"
                    animate={{
                      height: isPaused
                        ? "20%"
                        : ["20%", `${Math.random() * 60 + 30}%`, "20%"],
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.2,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            ) : audioURL ? (
              <div className="text-primary flex items-center gap-2">
                <Play className="h-8 w-8" />
                <span className="text-sm">Recording ready</span>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <Mic className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm">Press record to start</p>
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="font-mono text-3xl font-bold">
            {formatTime(duration)}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            {!isRecording && !audioURL && (
              <Button
                size="lg"
                className="h-16 w-16 rounded-full p-0"
                onClick={startRecording}
              >
                <Mic className="h-6 w-6" />
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 w-16 rounded-full p-0"
                  onClick={pauseRecording}
                >
                  {isPaused ? (
                    <Play className="h-6 w-6" />
                  ) : (
                    <Pause className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full p-0"
                  onClick={stopRecording}
                >
                  <Square className="h-6 w-6" />
                </Button>
              </>
            )}

            {audioURL && !isRecording && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 w-16 rounded-full p-0"
                  onClick={playRecording}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 w-16 rounded-full p-0"
                  onClick={resetRecording}
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
                <Button
                  size="lg"
                  className="h-16 w-16 rounded-full p-0"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Sparkles className="h-6 w-6" />
                  )}
                </Button>
              </>
            )}
          </div>

          {audioURL && (
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
        </div>
      </Card>

      {/* AI Feedback */}
      <AnimatePresence>
        {feedback && score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-primary/50 from-primary/10 bg-linear-to-br to-transparent">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary/20 rounded-full p-4">
                  <Sparkles className="text-primary h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">AI Feedback</h3>
                  <p className="text-muted-foreground">
                    Here&apos;s your pronunciation analysis
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="mb-6 text-center">
                <div className="border-primary bg-primary/10 mb-2 inline-flex h-24 w-24 items-center justify-center rounded-full border-4">
                  <span className="text-primary text-3xl font-bold">
                    {score}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Pronunciation Score
                </p>
              </div>

              {/* Overall Assessment */}
              <div className="mb-6">
                <h4 className="mb-2 font-semibold">Overall Assessment</h4>
                <p className="text-muted-foreground">{feedback.overall}</p>
              </div>

              {/* Strengths */}
              <div className="mb-6">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-green-500">
                  ✓ Strengths
                </h4>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-green-500">•</span>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="mb-6">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-yellow-500">
                  ⚠ Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {feedback.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-yellow-500">•</span>
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pronunciation Tips */}
              <div>
                <h4 className="text-primary mb-3 flex items-center gap-2 font-semibold">
                  💡 Pronunciation Tips
                </h4>
                <ul className="space-y-2">
                  {feedback.pronunciation_tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
