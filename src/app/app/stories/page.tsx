"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { BookOpen, Plus, TrendingUp, Clock, Trophy } from "lucide-react";
import { generateStory, getStories, type Story } from "@/lib/services/story";
import Link from "next/link";

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "Beginner" | "Intermediate" | "Advanced"
  >("Beginner");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    try {
      setLoading(true);
      const data = await getStories();
      setStories(data);
    } catch (error) {
      console.error("Failed to load stories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateStory() {
    try {
      setGenerating(true);
      const newStory = await generateStory(
        selectedDifficulty,
        topic || undefined
      );
      if (newStory) {
        // Navigate to the story reader
        window.location.href = `/app/stories/${newStory.id}`;
      }
    } catch (error) {
      console.error("Failed to generate story:", error);
    } finally {
      setGenerating(false);
    }
  }

  const stats = {
    total: stories.length,
    completed: stories.filter((s) => s.completed).length,
    averageScore:
      stories.filter((s) => s.comprehension_score).length > 0
        ? Math.round(
            stories
              .filter((s) => s.comprehension_score)
              .reduce((sum, s) => sum + (s.comprehension_score || 0), 0) /
              stories.filter((s) => s.comprehension_score).length
          )
        : 0,
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
          <SkeletonCard className="h-24" />
        </div>
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">AI Story Mode</h1>
          <p className="text-muted-foreground">
            Read AI-generated stories to improve your reading comprehension
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card variant="default" className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-full p-3">
            <BookOpen className="text-primary h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-muted-foreground text-sm">Stories Generated</p>
          </div>
        </Card>

        <Card variant="default" className="flex items-center gap-4">
          <div className="rounded-full bg-green-500/10 p-3">
            <Trophy className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-muted-foreground text-sm">Completed</p>
          </div>
        </Card>

        <Card variant="default" className="flex items-center gap-4">
          <div className="rounded-full bg-yellow-500/10 p-3">
            <TrendingUp className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.averageScore}%</p>
            <p className="text-muted-foreground text-sm">Average Score</p>
          </div>
        </Card>
      </div>

      {/* Generate New Story */}
      <Card className="from-primary/20 via-primary/10 border-primary/30 bg-linear-to-br to-transparent">
        <h2 className="mb-4 text-2xl font-bold">Generate New Story</h2>
        <p className="text-muted-foreground mb-6">
          Create a personalized story with AI based on your learning level
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Difficulty Level
            </label>
            <div className="flex gap-3">
              {(["Beginner", "Intermediate", "Advanced"] as const).map(
                (level) => (
                  <Button
                    key={level}
                    variant={
                      selectedDifficulty === level ? "primary" : "outline"
                    }
                    onClick={() => setSelectedDifficulty(level)}
                  >
                    {level}
                  </Button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Topic (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., travel, technology, nature..."
              className="border-border bg-background focus:ring-primary w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
            />
          </div>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleGenerateStory}
            disabled={generating}
          >
            <Plus className="h-5 w-5" />
            {generating ? "Generating Story..." : "Generate Story"}
          </Button>
        </div>
      </Card>

      {/* Story List */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">Your Stories</h2>

        {stories.length === 0 ? (
          <Card className="py-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="bg-muted rounded-full p-6">
                <BookOpen className="text-muted-foreground h-12 w-12" />
              </div>
            </div>
            <h3 className="mb-2 text-xl font-semibold">No stories yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate your first AI story to start improving your reading
              skills
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/app/stories/${story.id}`}>
                  <Card variant="interactive" className="flex h-full flex-col">
                    <div className="mb-3 flex items-start justify-between">
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
                      {story.completed && (
                        <div className="flex items-center gap-1 text-sm text-green-500">
                          <Trophy className="h-4 w-4" />
                          {story.comprehension_score}%
                        </div>
                      )}
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-lg font-bold">
                      {story.title}
                    </h3>

                    <p className="text-muted-foreground mb-4 line-clamp-3 flex-1 text-sm">
                      {story.content.substring(0, 150)}...
                    </p>

                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {Math.ceil(story.word_count / 200)} min read
                      </span>
                      {story.topic && (
                        <span className="text-primary">#{story.topic}</span>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
