"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, Volume2, Check, X } from "lucide-react";
import {
  type Story,
  type StoryVocabulary,
  submitComprehension,
} from "@/lib/services/story";

interface StoryReaderProps {
  story: Story;
  vocabulary: StoryVocabulary[];
  questions: Array<{
    question: string;
    options: string[];
    correct_answer: number;
  }>;
  onComplete: () => void;
}

export function StoryReader({
  story,
  vocabulary,
  questions,
  onComplete,
}: StoryReaderProps) {
  const [selectedWord, setSelectedWord] = useState<StoryVocabulary | null>(
    null
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Highlight vocabulary words in the story
  const highlightedContent = vocabulary.reduce((content, vocab) => {
    const regex = new RegExp(`\\b(${vocab.word})\\b`, "gi");
    return content.replace(
      regex,
      `<span class="vocabulary-word cursor-pointer text-primary font-semibold hover:underline" data-word="${vocab.word}">$1</span>`
    );
  }, story.content);

  const handleWordClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("vocabulary-word")) {
      const word = target.dataset.word;
      const vocabItem = vocabulary.find(
        (v) => v.word.toLowerCase() === word?.toLowerCase()
      );
      if (vocabItem) {
        setSelectedWord(vocabItem);
      }
    }
  };

  const handleFinishReading = () => {
    if (questions.length > 0) {
      setShowQuiz(true);
    } else {
      submitComprehension(story.id, 100);
      onComplete();
    }
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [questionIndex]: answerIndex });
  };

  const handleSubmitQuiz = async () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correct_answer) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setQuizCompleted(true);

    await submitComprehension(story.id, finalScore);
  };

  const handleFinishQuiz = () => {
    onComplete();
  };

  if (showQuiz) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-3">
              <BookOpen className="text-primary h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Comprehension Quiz</h2>
              <p className="text-muted-foreground">
                Answer these questions about the story
              </p>
            </div>
          </div>

          {!quizCompleted ? (
            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <h3 className="font-semibold">
                    {qIndex + 1}. {question.question}
                  </h3>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => handleQuizAnswer(qIndex, oIndex)}
                        className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                          quizAnswers[qIndex] === oIndex
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="mr-2 font-medium">
                          {String.fromCharCode(65 + oIndex)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length !== questions.length}
              >
                Submit Answers
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-8 text-center"
            >
              <div className="flex justify-center">
                <div className="rounded-full border-4 border-yellow-500/30 bg-linear-to-br from-yellow-400/20 to-orange-500/20 p-8">
                  <span className="text-6xl">
                    {score >= 70 ? "🎉" : score >= 50 ? "👍" : "📚"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-3xl font-bold">
                  {score >= 70
                    ? "Excellent!"
                    : score >= 50
                      ? "Good Job!"
                      : "Keep Practicing!"}
                </h3>
                <p className="text-muted-foreground text-xl">
                  You scored {score}%
                </p>
              </div>

              <div className="space-y-2">
                {questions.map((q, i) => {
                  const isCorrect = quizAnswers[i] === q.correct_answer;
                  return (
                    <div
                      key={i}
                      className={`rounded-lg border-2 p-4 ${
                        isCorrect
                          ? "border-green-500/30 bg-green-500/10"
                          : "border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                        ) : (
                          <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                        )}
                        <div className="flex-1">
                          <p className="mb-1 font-medium">{q.question}</p>
                          {!isCorrect && (
                            <p className="text-muted-foreground text-sm">
                              Correct answer: {q.options[q.correct_answer]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-3">
                <Button size="lg" onClick={handleFinishQuiz}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Story Header */}
      <Card>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{story.title}</h1>
            <div className="flex items-center gap-3">
              <Badge
                className={`${
                  story.difficulty === "Beginner"
                    ? "border-green-500/20 bg-green-500/10 text-green-400"
                    : story.difficulty === "Intermediate"
                      ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                      : "border-purple-500/20 bg-purple-500/10 text-purple-400"
                }`}
              >
                {story.difficulty}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {story.word_count} words
              </span>
              {story.topic && (
                <span className="text-muted-foreground text-sm">
                  • {story.topic}
                </span>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Listen
          </Button>
        </div>

        {/* Story Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
          onClick={handleWordClick}
        />

        {/* Vocabulary Tooltip */}
        <AnimatePresence>
          {selectedWord && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md"
            >
              <Card className="border-primary/50 bg-card/95 backdrop-blur-sm">
                <div className="mb-2 flex items-start justify-between">
                  <h4 className="text-primary text-lg font-bold">
                    {selectedWord.word}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedWord(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mb-3 text-sm">{selectedWord.definition}</p>
                <p className="text-muted-foreground text-sm italic">
                  &quot;{selectedWord.context}&quot;
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-end border-t pt-6">
          <Button size="lg" onClick={handleFinishReading} className="gap-2">
            <Check className="h-5 w-5" />
            Finish Reading
          </Button>
        </div>
      </Card>

      {/* Vocabulary List */}
      {vocabulary.length > 0 && (
        <Card>
          <h3 className="mb-4 text-lg font-bold">Key Vocabulary</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {vocabulary.map((vocab) => (
              <div
                key={vocab.id}
                className="border-border hover:border-primary/50 cursor-pointer rounded-lg border p-4 transition-colors"
                onClick={() => setSelectedWord(vocab)}
              >
                <h4 className="text-primary mb-1 font-semibold">
                  {vocab.word}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {vocab.definition}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
