"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { StoryReader } from "@/components/features/StoryReader";
import {
  getStory,
  getStoryVocabulary,
  type Story,
  type StoryVocabulary,
} from "@/lib/services/story";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [vocabulary, setVocabulary] = useState<StoryVocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  async function loadStory() {
    try {
      setLoading(true);
      const [storyData, vocabData] = await Promise.all([
        getStory(storyId),
        getStoryVocabulary(storyId),
      ]);

      if (storyData) {
        setStory(storyData);
        setVocabulary(vocabData);
      }
    } catch (error) {
      console.error("Failed to load story:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleComplete = () => {
    router.push("/app/stories");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="py-12 text-center">
        <h2 className="mb-2 text-2xl font-bold">Story not found</h2>
        <p className="text-muted-foreground mb-6">
          The story you&apos;re looking for doesn&apos;t exist
        </p>
        <Button onClick={() => router.push("/app/stories")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/app/stories")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Stories
      </Button>

      <StoryReader
        story={story}
        vocabulary={vocabulary}
        questions={story.questions || []}
        onComplete={handleComplete}
      />
    </div>
  );
}
