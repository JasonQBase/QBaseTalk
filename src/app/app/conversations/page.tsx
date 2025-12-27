"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { VoiceVisualizer } from "@/components/ui/VoiceVisualizer";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import {
  Mic,
  Phone,
  ChevronRight,
  Send,
  Loader2,
  Target,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  generateAIResponse,
  detectErrors,
  generateSuggestions,
  checkMissionObjectives,
} from "@/lib/gemini/conversation";
import { SCENARIOS, Scenario } from "@/lib/data/scenarios";

interface Message {
  id: number;
  speaker: "You" | "Echo";
  message: string;
  timestamp: string;
  hasError?: boolean;
  correction?: string;
  explanation?: string;
}

export default function ConversationsPage() {
  const [isConnected, setIsConnected] = useState(true);

  const [isListening, _setIsListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  // Load Default Scenario (e.g., Coffee Order) for testing Phase 2
  // Load Default Scenario (e.g., Coffee Order) for testing Phase 2
  // We need to clone it to track progress local state
  const [activeScenario, setActiveScenario] = useState<Scenario>(
    JSON.parse(JSON.stringify(SCENARIOS[0]))
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      speaker: "Echo",
      message: activeScenario.initialMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    "I'd like a large latte, please.",
    "Do you have oat milk?",
    "How much is a cappuccino?",
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || processing) return;

    setProcessing(true);
    setInputValue("");

    // 1. Add User Message
    const userMsgId = Date.now();
    const newUserMsg: Message = {
      id: userMsgId,
      speaker: "You",
      message: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newUserMsg]);

    try {
      // 2. Parallel: Detect Errors & Prepare AI Context
      const validationPromise = detectErrors(text);

      const history = messages.map((m) => ({
        speaker: m.speaker === "Echo" ? "model" : "user",
        message: m.message,
      }));

      // 3. Generate AI Response using Scenario
      const aiResponseText = await generateAIResponse(
        text,
        history,
        activeScenario
      );

      // 4. Update User Message if errors found
      const validation = await validationPromise;
      if (validation.hasError) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsgId
              ? {
                  ...m,
                  hasError: true,
                  correction: validation.correction,
                  explanation: validation.explanation,
                }
              : m
          )
        );
      }

      // 5. Add AI Message
      const newAiMsg: Message = {
        id: Date.now() + 1,
        speaker: "Echo",
        message: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newAiMsg]);

      // 6. Generate New Suggestions
      const newSuggestionsPromise = generateSuggestions(
        [
          ...history,
          { speaker: "user", message: text },
          { speaker: "model", message: aiResponseText },
        ],
        aiResponseText
      );

      // 7. Check Objectives
      const objectivesPromise = checkMissionObjectives(
        [
          ...history,
          { speaker: "user", message: text },
          { speaker: "model", message: aiResponseText },
        ],
        activeScenario.objectives
      );

      const [newSuggestions, completedObjectiveIds] = await Promise.all([
        newSuggestionsPromise,
        objectivesPromise,
      ]);

      setSuggestions(newSuggestions);

      // Update completed objectives
      if (completedObjectiveIds && completedObjectiveIds.length > 0) {
        setActiveScenario((prev) => ({
          ...prev,
          objectives: prev.objectives.map((obj) =>
            completedObjectiveIds.includes(obj.id)
              ? { ...obj, isCompleted: true }
              : obj
          ),
        }));
      }
    } catch (error) {
      console.error("Conversation error:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* Main Conversation Area */}
      <div className="relative flex flex-1 flex-col">
        {/* Header */}
        <div className="border-border/40 glass-card bg-background/50 z-10 flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{activeScenario.title}</h1>
              <p className="text-muted-foreground text-sm">
                {activeScenario.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              className={`gap-2 ${
                isConnected
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              <div className="h-2 w-2 rounded-full bg-green-400" />
              Connected
            </Badge>
            <Button
              variant="outline"
              className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => setIsConnected(!isConnected)}
            >
              <Phone className="h-4 w-4" />
              {isConnected ? "End Session" : "Connect"}
            </Button>
          </div>
        </div>

        {/* AI Avatar Display Area */}
        <div className="from-background via-primary/5 to-background relative flex flex-1 items-center justify-center bg-linear-to-b">
          <div className="z-0 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <AvatarDisplay size={400} animate={processing || isListening} />
            </motion.div>

            {/* Voice Control / Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mx-auto max-w-md"
            >
              <div className="mb-4 flex h-20 items-center justify-center">
                {processing ? (
                  <div className="text-primary flex animate-pulse items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Emma is thinking...</span>
                  </div>
                ) : (
                  <VoiceVisualizer
                    isActive={isListening}
                    barCount={24}
                    className="h-full"
                  />
                )}
              </div>

              {/* Temporary Text Input for Testing AI without Mic */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="mx-auto mt-4 flex max-w-sm gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type to talk (until voice is ready)..."
                  className="bg-input/50 border-input"
                  disabled={processing}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={processing || !inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side Panel */}
      <div className="border-border/40 bg-card z-20 flex h-full w-[400px] flex-col border-l shadow-xl">
        {/* Mission Objectives */}
        <div className="border-border/40 bg-accent/5 border-b p-6">
          <div className="mb-4 flex items-center gap-2">
            <Target className="text-primary h-5 w-5" />
            <h2 className="text-lg font-bold">Mission Objectives</h2>
          </div>
          <div className="space-y-3">
            <div className="space-y-3">
              {activeScenario.objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="bg-background border-border/40 flex items-start gap-3 rounded-lg border p-3"
                >
                  {obj.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="text-muted-foreground h-5 w-5 shrink-0" />
                  )}
                  <span
                    className={`text-sm ${obj.isCompleted ? "text-muted-foreground line-through" : ""}`}
                  >
                    {obj.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Transcript */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="bg-primary h-3 w-3 rounded-full" />
            <h2 className="text-lg font-semibold">Live Transcript</h2>
          </div>

          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-8 w-8 shrink-0 rounded-full ${item.speaker === "Echo" ? "from-primary to-cyan bg-linear-to-br" : "bg-accent/10"}`}
                    />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {item.speaker}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {item.timestamp}
                        </span>
                      </div>
                      <div
                        className={`rounded-lg p-3 text-sm ${item.speaker === "You" ? "bg-accent/5" : "bg-primary/10"}`}
                      >
                        {item.hasError ? (
                          <div className="space-y-1">
                            <div className="line-through opacity-50">
                              {item.message}
                            </div>
                            <div className="text-primary flex items-center gap-2 font-medium">
                              <span>{item.correction}</span>
                            </div>
                            {item.explanation && (
                              <div className="text-muted-foreground mt-1 text-xs italic">
                                💡 {item.explanation}
                              </div>
                            )}
                          </div>
                        ) : (
                          item.message
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Smart Suggestions */}
        <div className="border-border/40 bg-card border-t p-6">
          <div className="mb-4 flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="font-medium text-green-400">
              SMART SUGGESTIONS
            </span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSendMessage(suggestion)}
                className="group border-border/40 bg-card hover:border-primary/30 hover:bg-primary/10 flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all disabled:opacity-50"
                disabled={processing}
              >
                <span>{suggestion}</span>
                <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Session Metrics */}
        <div className="border-border/40 bg-muted/20 border-t p-6">
          <h3 className="mb-4 text-sm font-semibold">Session Metrics</h3>
          <div className="flex justify-around">
            <div className="text-center">
              <CircularProgress
                percentage={78}
                size={80}
                color="#4169FF"
                label="VOCAB"
              />
            </div>
            <div className="text-center">
              <CircularProgress
                percentage={85}
                size={80}
                color="#0BC5EA"
                label="PRONUN"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
