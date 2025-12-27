"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Map, CheckCircle2, Play } from "lucide-react";
import {
  getLearningPath,
  type LearningPathItem,
} from "@/lib/services/learning-path";
import Link from "next/link";

export function LearningPathWidget() {
  const [nextTask, setNextTask] = useState<LearningPathItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPath() {
      try {
        const items = await getLearningPath();
        // Find first available or incomplete item
        const active =
          items.find((i) => i.status === "available") ||
          items[items.length - 1];
        setNextTask(active || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadPath();
  }, []);

  if (loading)
    return (
      <Card className="bg-muted/20 flex h-full items-center justify-center p-6">
        <div className="flex animate-pulse flex-col items-center gap-2">
          <div className="bg-primary/20 h-8 w-8 rounded-full" />
          <div className="bg-primary/10 h-4 w-24 rounded" />
        </div>
      </Card>
    );

  return (
    <Card className="group relative h-full overflow-hidden p-6">
      <div className="bg-primary/5 group-hover:bg-primary/10 absolute top-0 right-0 -mt-12 -mr-12 rounded-full p-24 blur-3xl transition-all" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Map className="h-5 w-5" />
            </div>
            <span className="font-bold">Learning Path</span>
          </div>
          <Link
            href="/app/learning-path"
            className="text-muted-foreground hover:text-primary text-xs"
          >
            View Full Path
          </Link>
        </div>

        {nextTask ? (
          <div className="flex flex-1 flex-col justify-center">
            <div className="text-muted-foreground mb-1 text-sm tracking-wider uppercase">
              Up Next
            </div>
            <h3 className="mb-2 line-clamp-2 text-xl font-bold">
              {nextTask.title}
            </h3>
            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
              {nextTask.description}
            </p>

            <Link href={nextTask.action_url || "/app/learning-path"}>
              <Button className="shadow-primary/20 w-full gap-2 shadow-lg">
                <Play className="h-4 w-4" />
                Continue Path
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <CheckCircle2 className="mb-2 h-10 w-10 text-green-500" />
            <p className="font-medium">All tasks completed!</p>
            <Link href="/app/learning-path" className="mt-4">
              <Button variant="outline" size="sm">
                Generate New
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
