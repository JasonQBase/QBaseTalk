"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  User,
  Mail,
  Lock,
  Crown,
  Bell,
  Clock,
  Settings as SettingsIcon,
} from "lucide-react";

const VOICE_MODELS = [
  { id: "emma", name: "Emma (UK)", style: "Friendly", accent: "UK" },
  { id: "james", name: "James (US)", style: "Professional", accent: "US" },
];

const PRACTICE_DURATIONS = [
  { value: 5, label: "5 min" },
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
];

export default function SettingsPage() {
  const [selectedVoice, setSelectedVoice] = useState("emma");
  const [speakingSpeed, setSpeakingSpeed] = useState(50);
  const [realtimeCorrection, setRealtimeCorrection] = useState(true);
  const [practiceDuration, setPracticeDuration] = useState(15);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [newScenarios, setNewScenarios] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
            <span>Home</span>
            <span>›</span>
            <span>Settings</span>
          </div>
          <h1 className="text-4xl font-bold">Account Settings</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile Section */}
            <Card className="border-border/40 bg-card p-6">
              <div className="mb-6 flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="from-primary to-cyan h-20 w-20 rounded-full bg-linear-to-br" />
                    <Badge className="border-card bg-primary absolute -right-1 -bottom-1 border-2 px-2 py-0.5 text-xs">
                      LVL 12
                    </Badge>
                  </div>
                  <div>
                    <h2 className="mb-1 text-xl font-bold">Alex Johnson</h2>
                    <p className="text-primary text-sm">Fluent Speaker</p>
                    <p className="text-muted-foreground text-xs">
                      Member since 2023
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary"
                >
                  EDIT PROFILE
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                    <input
                      type="text"
                      defaultValue="Alex Johnson"
                      className="border-border/40 bg-input/20 focus:border-primary/30 focus:bg-input/30 w-full rounded-lg border py-3 pr-4 pl-10 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                    <input
                      type="email"
                      defaultValue="alex.johnson@email.com"
                      className="border-border/40 bg-input/20 focus:border-primary/30 focus:bg-input/30 w-full rounded-lg border py-3 pr-4 pl-10 outline-none"
                    />
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Lock className="h-4 w-4" />
                  Password Management
                </Button>
              </div>
            </Card>

            {/* Pro Member Section */}
            <Card className="border-primary/30 from-primary/20 via-primary/10 bg-linear-to-br to-transparent p-6">
              <div className="mb-4 flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-400" />
                <h2 className="text-lg font-semibold">Pro Member</h2>
                <Badge className="bg-green-500/10 text-green-400">
                  <div className="mr-1 h-2 w-2 rounded-full bg-green-400" />
                  Active
                </Badge>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next billing</span>
                  <span className="font-medium">Nov 24, 2023</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">$12.99/mo</span>
                </div>
              </div>

              <Button className="shadow-glow w-full">
                Manage Subscription
              </Button>
            </Card>

            {/* Learning Goals */}
            <Card className="border-border/40 bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Learning Goals</h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Set your daily targets
              </p>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Daily Practice Duration
                  </label>
                  <SettingsIcon className="text-muted-foreground h-4 w-4" />
                </div>
                <div className="flex gap-2">
                  {PRACTICE_DURATIONS.map((duration) => (
                    <button
                      key={duration.value}
                      onClick={() => setPracticeDuration(duration.value)}
                      className={`flex-1 rounded-lg border py-3 text-sm font-medium transition-all ${
                        practiceDuration === duration.value
                          ? "border-primary bg-primary text-white"
                          : "border-border/40 bg-accent/5 hover:border-primary/30"
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  Recommended for steady progress
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Partner Personality */}
            <Card className="border-border/40 bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  AI Partner Personality
                </h2>
                <Crown className="text-primary h-5 w-5" />
              </div>
              <p className="text-muted-foreground mb-6 text-sm">
                Customize who you practice with
              </p>

              {/* Avatar Preview */}
              <div className="mb-6 flex justify-center">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <AvatarDisplay size={200} />
                  </div>
                  <h3 className="text-lg font-semibold">Emma</h3>
                  <p className="text-primary text-sm">Friendly & Encouraging</p>
                </div>
              </div>

              {/* Voice Model Selection */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium">
                  Voice Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {VOICE_MODELS.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        selectedVoice === voice.id
                          ? "border-primary bg-primary/10"
                          : "border-border/40 bg-accent/5 hover:border-primary/30"
                      }`}
                    >
                      <div className="mb-1 font-medium">{voice.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {voice.style}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaking Speed Slider */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium">
                  Speaking Speed
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={speakingSpeed}
                    onChange={(e) => setSpeakingSpeed(Number(e.target.value))}
                    className="bg-accent/20 h-2 w-full cursor-pointer appearance-none rounded-lg"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${speakingSpeed}%, hsl(var(--muted)) ${speakingSpeed}%, hsl(var(--muted)) 100%)`,
                    }}
                  />
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>Slow</span>
                    <span className="text-primary font-medium">
                      {speakingSpeed > 66
                        ? "Fast"
                        : speakingSpeed > 33
                          ? "Normal"
                          : "Slow"}
                    </span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>

              {/* Real-time Correction Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Real-time Correction</div>
                  <div className="text-muted-foreground text-xs">
                    Interrupt to fix mistakes
                  </div>
                </div>
                <button
                  onClick={() => setRealtimeCorrection(!realtimeCorrection)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    realtimeCorrection ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
                    animate={{ left: realtimeCorrection ? "22px" : "2px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </Card>

            {/* Appearance */}
            <Card className="border-border/40 bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Appearance</h2>
                  <p className="text-muted-foreground text-sm">
                    Switch between light and dark mode
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="border-border/40 bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Notifications</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="text-muted-foreground h-5 w-5" />
                    <div>
                      <div className="font-medium">Daily Reminders</div>
                      <div className="text-muted-foreground text-xs">
                        Get notified to practice
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDailyReminders(!dailyReminders)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      dailyReminders ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
                      animate={{ left: dailyReminders ? "22px" : "2px" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="text-muted-foreground h-5 w-5" />
                    <div>
                      <div className="font-medium">New Scenarios</div>
                      <div className="text-muted-foreground text-xs">
                        When new content is added
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setNewScenarios(!newScenarios)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      newScenarios ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
                      animate={{ left: newScenarios ? "22px" : "2px" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="text-muted-foreground h-5 w-5" />
                    <div>
                      <div className="font-medium">
                        Weekly Performance Reports
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Your progress summary
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setWeeklyReports(!weeklyReports)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      weeklyReports ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white"
                      animate={{ left: weeklyReports ? "22px" : "2px" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>
              </div>
            </Card>

            {/* Logout */}
            <Card className="border-border/40 bg-card p-6">
              <Button
                variant="outline"
                className="w-full text-red-400 hover:bg-red-500/10"
              >
                Logout
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
