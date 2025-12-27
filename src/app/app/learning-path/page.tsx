"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  Circle,
  Lock,
  ArrowRight,
  Wand2,
  BookOpen,
  Mic,
  Trophy,
} from "lucide-react";
import {
  getLearningPath,
  generateLearningPath,
  completePathItem,
  type LearningPathItem,
} from "@/lib/services/learning-path";
import Link from "next/link";

// Map type to icon
const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "lesson":
      return <BookOpen className="h-4 w-4" />;
    case "practice":
      return <Mic className="h-4 w-4" />;
    case "quiz":
      return <Trophy className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
};

export default function LearningPathPage() {
  const [items, setItems] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadPath();
  }, []);

  async function loadPath() {
    try {
      setLoading(true);
      const data = await getLearningPath();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    try {
      setGenerating(true);
      const data = await generateLearningPath();
      setItems(data);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">My Learning Path</h1>
            <p className="text-muted-foreground">
              Your personalized AI-curated curriculum based on your goals.
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            <Wand2 className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Planning..." : "Regenerate Path"}
          </Button>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="bg-border absolute top-0 bottom-0 left-8 z-0 w-0.5" />

          <div className="relative z-10 space-y-12">
            {items.length === 0 && !loading ? (
              <Card className="bg-muted/20 border-dashed p-8 text-center">
                <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                  <Wand2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold">No path created yet</h3>
                <p className="text-muted-foreground mb-6">
                  Let AI analyze your profile and create a custom study plan for
                  you.
                </p>
                <Button onClick={handleGenerate} size="lg">
                  Create My Path
                </Button>
              </Card>
            ) : (
              items.map((item, index) => {
                const isActive = item.status === "available";
                const isCompleted = item.status === "completed";
                const isLocked = item.status === "locked";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex gap-8"
                  >
                    {/* Status Indicator */}
                    <div className="relative shrink-0">
                      <div
                        className={`bg-background flex h-16 w-16 items-center justify-center rounded-full border-4 ${
                          isCompleted
                            ? "border-green-500 text-green-500"
                            : isActive
                              ? "border-primary text-primary shadow-primary/30 scale-110 shadow-lg transition-transform"
                              : "border-muted text-muted-foreground"
                        } `}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-8 w-8" />
                        ) : isActive ? (
                          <h3 className="text-2xl font-bold">{index + 1}</h3>
                        ) : (
                          <Lock className="h-6 w-6" />
                        )}
                      </div>
                    </div>

                    {/* Content Card */}
                    <Card
                      className={`relative flex-1 overflow-hidden p-6 transition-all ${
                        isActive
                          ? "border-primary/50 bg-primary/5 hover:border-primary/70 ring-primary/20 ring-1"
                          : isLocked
                            ? "bg-muted/20 opacity-70"
                            : "bg-card/80"
                      } `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <Badge
                              variant={isActive ? "default" : "secondary"}
                              className="gap-1"
                            >
                              <TypeIcon type={item.type} />
                              <span className="capitalize">{item.type}</span>
                            </Badge>
                            {isCompleted && (
                              <span className="text-xs font-medium text-green-500">
                                Completed
                              </span>
                            )}
                          </div>
                          <h3
                            className={`mb-2 text-xl font-bold ${isLocked ? "text-muted-foreground" : ""}`}
                          >
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {isActive && (
                        <div className="mt-2 flex items-center gap-4">
                          <Link href={item.action_url || "#"}>
                            <Button className="gap-2">
                              Start Lesson <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          {/* Dev capability to skip/complete for demo */}
                          {/* In production would be auto-completed by verifying the action */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={async () => {
                              await completePathItem(item.id);
                              loadPath();
                            }}
                          >
                            (Debug: Complete)
                          </Button>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
