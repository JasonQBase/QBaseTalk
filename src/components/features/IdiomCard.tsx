"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, Check, Info, RotateCcw } from "lucide-react";
import { type IdiomWithProgress, markLearned } from "@/lib/services/idioms";

interface IdiomCardProps {
  idiom: IdiomWithProgress;
  onLearnedToggle?: () => void;
}

export function IdiomCard({ idiom, onLearnedToggle }: IdiomCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [isLearned, setIsLearned] = useState(idiom.learned);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleToggleLearned = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLearned = !isLearned;
    setIsLearned(newLearned);
    await markLearned(idiom.id, newLearned);
    onLearnedToggle?.();
  };

  return (
    <div className="perspective-1000">
      <motion.div
        className="relative h-96 w-full cursor-pointer"
        onClick={handleFlip}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <Card
          className={`absolute inset-0 border-2 backface-hidden ${
            isLearned
              ? "border-green-500/50 bg-green-500/5"
              : "border-primary/30"
          }`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="mb-4 flex items-start justify-between">
                <Badge
                  className={`${
                    idiom.difficulty === "Beginner"
                      ? "border-green-500/20 bg-green-500/10 text-green-400"
                      : idiom.difficulty === "Intermediate"
                        ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                        : "border-purple-500/20 bg-purple-500/10 text-purple-400"
                  }`}
                >
                  {idiom.difficulty}
                </Badge>
                <Button
                  variant={isLearned ? "primary" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={handleToggleLearned}
                >
                  <Check className="h-4 w-4" />
                  {isLearned ? "Learned" : "Mark Learned"}
                </Button>
              </div>

              <div className="mb-4 flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-2xl font-bold">{idiom.phrase}</h3>
                  <span className="text-muted-foreground bg-muted/50 rounded px-2 py-1 text-sm">
                    {idiom.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-primary inline-flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4" />
                <span>Click to reveal meaning</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Back Side */}
        <Card
          className="border-primary/50 from-primary/10 absolute inset-0 border-2 bg-linear-to-br to-transparent backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex h-full flex-col justify-between overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Meaning */}
              <div>
                <h4 className="text-primary mb-2 flex items-center gap-2 font-semibold">
                  <Info className="h-4 w-4" />
                  Meaning
                </h4>
                <p className="text-lg">{idiom.meaning}</p>
              </div>

              {/* Examples */}
              <div>
                <h4 className="text-primary mb-2 font-semibold">Examples</h4>
                <ul className="space-y-2">
                  {idiom.examples.map((example, i) => (
                    <li
                      key={i}
                      className="border-primary/30 border-l-2 pl-4 text-sm italic"
                    >
                      &quot;{example}&quot;
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cultural Note */}
              {idiom.cultural_note && (
                <div>
                  <h4 className="mb-2 font-semibold text-yellow-500">
                    Cultural Context
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {idiom.cultural_note}
                  </p>
                </div>
              )}

              {/* Origin */}
              {idiom.origin && (
                <div>
                  <h4 className="mb-2 font-semibold text-green-500">Origin</h4>
                  <p className="text-muted-foreground text-sm">
                    {idiom.origin}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 text-center">
              <div className="text-primary inline-flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4" />
                <span>Click to flip back</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
