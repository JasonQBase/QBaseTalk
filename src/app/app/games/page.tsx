"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { Shuffle, Zap, Puzzle, Trophy, Star, Target } from "lucide-react";

const GAMES = [
  {
    id: "word-match",
    title: "Word Match",
    description: "Match words with their meanings",
    icon: Shuffle,
    color: "from-purple-500/20 to-purple-500/5",
    difficulty: "Beginner",
  },
  {
    id: "speed-spell",
    title: "Speed Spell",
    description: "Type words as fast as you can",
    icon: Zap,
    color: "from-cyan-500/20 to-cyan-500/5",
    difficulty: "Intermediate",
  },
  {
    id: "sentence-builder",
    title: "Sentence Builder",
    description: "Arrange words to form correct sentences",
    icon: Puzzle,
    color: "from-green-500/20 to-green-500/5",
    difficulty: "Intermediate",
  },
];

export default function GamesPage() {
  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-4xl font-bold">Mini-Games</h1>
          <p className="text-muted-foreground text-lg">
            Learn English through fun and interactive games
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-6 md:grid-cols-3"
        >
          <Card className="border-border/40 from-primary/10 bg-linear-to-br to-transparent p-6">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="text-primary h-5 w-5" />
              <span className="text-muted-foreground text-sm font-medium">
                High Score
              </span>
            </div>
            <div className="text-3xl font-bold">850</div>
          </Card>
          <Card className="border-border/40 bg-linear-to-br from-cyan-500/10 to-transparent p-6">
            <div className="mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 text-cyan-400" />
              <span className="text-muted-foreground text-sm font-medium">
                Games Played
              </span>
            </div>
            <div className="text-3xl font-bold">24</div>
          </Card>
          <Card className="border-border/40 bg-linear-to-br from-purple-500/10 to-transparent p-6">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-400" />
              <span className="text-muted-foreground text-sm font-medium">
                Accuracy
              </span>
            </div>
            <div className="text-3xl font-bold">87%</div>
          </Card>
        </motion.div>

        {/* Games Grid */}
        <div className="mb-6">
          <h2 className="mb-4 text-2xl font-bold">Available Games</h2>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {GAMES.map((game, index) => {
            const Icon = game.icon;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link href={`/app/games/${game.id}`}>
                  <Card className="group border-border/40 bg-card hover:border-primary/30 hover:shadow-glow h-full cursor-pointer transition-all">
                    <div
                      className={`h-32 rounded-t-2xl bg-linear-to-br ${game.color} p-6`}
                    >
                      <Icon className="text-primary h-12 w-12" />
                    </div>
                    <div className="p-6">
                      <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                        {game.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm">
                        {game.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          {game.difficulty}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-border/40 bg-muted/20 p-6">
            <h3 className="mb-4 text-lg font-semibold">Why Play Games?</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="mb-2 font-medium">🎯 Improve Retention</h4>
                <p className="text-muted-foreground text-sm">
                  Games help you remember vocabulary and grammar through active
                  practice
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">⚡ Build Speed</h4>
                <p className="text-muted-foreground text-sm">
                  Timed challenges improve your thinking and response time in
                  English
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium">🏆 Stay Motivated</h4>
                <p className="text-muted-foreground text-sm">
                  Earn points and compete with yourself to stay engaged
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
