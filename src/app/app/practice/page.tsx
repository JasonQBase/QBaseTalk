"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { VoiceVisualizer } from "@/components/ui/VoiceVisualizer";
import {
  Mic,
  Briefcase,
  Plane,
  UtensilsCrossed,
  ShoppingBag,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

const PRACTICE_SCENARIOS = [
  {
    id: 1,
    title: "Job Interview",
    description: "Practice answering common interview questions",
    icon: Briefcase,
    difficulty: "Advanced",
    duration: "15 min",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    id: 2,
    title: "Travel Booking",
    description: "Learn to book flights and hotels confidently",
    icon: Plane,
    difficulty: "Intermediate",
    duration: "10 min",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    id: 3,
    title: "Restaurant Order",
    description: "Order food and make reservations",
    icon: UtensilsCrossed,
    difficulty: "Beginner",
    duration: "8 min",
    color: "from-green-500/20 to-green-500/5",
  },
  {
    id: 4,
    title: "Shopping",
    description: "Navigate stores and ask about products",
    icon: ShoppingBag,
    difficulty: "Beginner",
    duration: "10 min",
    color: "from-yellow-500/20 to-yellow-500/5",
  },
  {
    id: 5,
    title: "Academic Discussion",
    description: "Discuss academic topics and give presentations",
    icon: GraduationCap,
    difficulty: "Advanced",
    duration: "20 min",
    color: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    id: 6,
    title: "Making Appointments",
    description: "Schedule meetings and appointments",
    icon: Calendar,
    difficulty: "Intermediate",
    duration: "12 min",
    color: "from-pink-500/20 to-pink-500/5",
  },
  {
    id: 7,
    title: "Phone Conversations",
    description: "Handle professional and casual calls",
    icon: Phone,
    difficulty: "Intermediate",
    duration: "15 min",
    color: "from-orange-500/20 to-orange-500/5",
  },
  {
    id: 8,
    title: "Asking for Directions",
    description: "Navigate cities and ask for help",
    icon: MapPin,
    difficulty: "Beginner",
    duration: "8 min",
    color: "from-red-500/20 to-red-500/5",
  },
];

const difficultyColors = {
  Beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Advanced: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function PracticePage() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-4xl font-bold">Practice Sessions</h1>
          <p className="text-muted-foreground text-lg">
            Choose a scenario and start practicing your English conversation
            skills
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
            <div className="mb-2 text-3xl font-bold">24</div>
            <div className="text-muted-foreground text-sm">
              Sessions Completed
            </div>
          </Card>
          <Card className="border-border/40 from-cyan/10 bg-linear-to-br to-transparent p-6">
            <div className="mb-2 text-3xl font-bold">6.5h</div>
            <div className="text-muted-foreground text-sm">
              Total Practice Time
            </div>
          </Card>
          <Card className="border-border/40 bg-linear-to-br from-purple-500/10 to-transparent p-6">
            <div className="mb-2 text-3xl font-bold">12</div>
            <div className="text-muted-foreground text-sm">Day Streak</div>
          </Card>
        </motion.div>

        {/* Quick Practice Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-primary/30 from-primary/20 via-primary/10 overflow-hidden bg-linear-to-br to-transparent p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold">Ready to Practice?</h2>
                <p className="text-muted-foreground">
                  Start a quick 5-minute conversation with your AI partner
                </p>
              </div>
              <Button
                size="lg"
                className="shadow-glow gap-2"
                onClick={() => setIsRecording(!isRecording)}
              >
                <Mic className="h-5 w-5" />
                {isRecording ? "Stop Practice" : "Start Quick Practice"}
              </Button>
            </div>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6"
              >
                <div className="border-primary/20 bg-primary/5 rounded-xl border p-6">
                  <div className="mb-4 text-center">
                    <div className="text-primary mb-2 text-sm font-medium">
                      LISTENING...
                    </div>
                    <VoiceVisualizer
                      isActive={isRecording}
                      barCount={20}
                      className="h-16"
                    />
                  </div>
                  <p className="text-muted-foreground text-center text-sm">
                    Speak naturally. Your AI partner is listening and will
                    respond.
                  </p>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Core Skills Section */}
        <div className="mb-6">
          <h2 className="mb-4 text-2xl font-bold">Core Skills</h2>
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-2">
          {/* Pronunciation Card */}
          <Link href="/app/practice/pronunciation">
            <Card className="group border-border/40 bg-card hover:border-primary/30 hover:shadow-glow relative h-full cursor-pointer overflow-hidden transition-all">
              <div className="bg-primary/5 group-hover:bg-primary/10 absolute top-0 right-0 -mt-16 -mr-16 rounded-full p-32 blur-3xl transition-all" />

              <div className="relative z-10 flex items-start gap-6 p-8">
                <div className="rounded-2xl bg-linear-to-br from-purple-500/20 to-purple-500/5 p-4 transition-transform duration-500 group-hover:scale-110">
                  <Mic className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="group-hover:text-primary mb-2 text-xl font-bold transition-colors">
                    Pronunciation Training
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Master your accent with real-time AI feedback. Practice
                    curated sentences categorized by difficulty.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-purple-400">
                    <span>Start Training</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Vocabulary Card (Future Placeholder or Link) */}
          <Link href="/app/vocabulary">
            <Card className="group border-border/40 bg-card hover:border-primary/30 hover:shadow-glow relative h-full cursor-pointer overflow-hidden transition-all">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 rounded-full bg-cyan-500/5 p-32 blur-3xl transition-all group-hover:bg-cyan-500/10" />

              <div className="relative z-10 flex items-start gap-6 p-8">
                <div className="rounded-2xl bg-linear-to-br from-cyan-500/20 to-cyan-500/5 p-4 transition-transform duration-500 group-hover:scale-110">
                  <BookOpen className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="group-hover:text-primary mb-2 text-xl font-bold transition-colors">
                    Vocabulary Builder
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Expand your word bank with spaced repetition and
                    context-based learning.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                    <span>Review Words</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Scenarios Header */}
        <div className="mb-6">
          <h2 className="mb-4 text-2xl font-bold">Roleplay Scenarios</h2>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {PRACTICE_SCENARIOS.map((scenario, index) => {
            const Icon = scenario.icon;
            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className="group border-border/40 bg-card hover:border-primary/30 hover:shadow-glow h-full cursor-pointer transition-all">
                  <div
                    className={`h-32 rounded-t-2xl bg-linear-to-br ${scenario.color} p-6`}
                  >
                    <Icon className="text-primary h-12 w-12" />
                  </div>
                  <div className="p-6">
                    <h3 className="group-hover:text-primary mb-2 text-lg font-semibold">
                      {scenario.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {scenario.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`border ${
                          difficultyColors[
                            scenario.difficulty as keyof typeof difficultyColors
                          ]
                        }`}
                      >
                        {scenario.difficulty}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {scenario.duration}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
