"use client";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import {
  Mic,
  Play,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Sparkles,
  MapPin,
  Briefcase,
  Users as UsersIcon,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground selection:bg-primary/30 min-h-screen overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 md:pt-48 md:pb-32">
        {/* Background Gradients */}
        <div className="bg-primary/10 absolute top-0 left-1/4 -z-10 h-[800px] w-[800px] rounded-full blur-[150px]" />
        <div className="bg-cyan/10 absolute right-1/4 bottom-0 -z-10 h-[600px] w-[600px] rounded-full blur-[120px]" />

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_500px] lg:gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <Badge variant="primary" className="mb-6 w-fit px-4 py-2 text-sm">
              🎯 AI-POWERED ENGLISH LEARNING
            </Badge>

            <h1 className="mb-6 text-5xl leading-tight font-bold tracking-tight md:text-6xl lg:text-7xl">
              Master English
              <br />
              Conversation
              <br />
              <span className="gradient-text">without Fear</span>
            </h1>

            <p className="text-muted-foreground mb-8 max-w-xl text-lg md:text-xl">
              Your 24/7 AI partner. Practice real-world scenarios, get instant
              pronunciation feedback, and build confidence in private before you
              speak to the world.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="primary"
                  className="group shadow-glow-hover"
                >
                  <Sparkles className="h-5 w-5" />
                  Start Speaking Now
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="secondary">
                <Play className="h-5 w-5" />
                See How It Works
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                <div className="border-background from-primary to-cyan h-10 w-10 rounded-full border-2 bg-linear-to-br" />
                <div className="border-background from-cyan to-accent h-10 w-10 rounded-full border-2 bg-linear-to-br" />
                <div className="border-background from-accent to-primary h-10 w-10 rounded-full border-2 bg-linear-to-br" />
              </div>
              <p className="text-muted-foreground text-sm">
                Trusted by <strong className="text-foreground">10,000+</strong>{" "}
                learners
              </p>
            </div>
          </motion.div>

          {/* Right - AI Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            <div className="glass-card relative overflow-hidden p-8">
              <Image
                src="/images/ai-avatar.png"
                alt="AI English Tutor"
                width={500}
                height={500}
                className="relative z-10 rounded-2xl"
                priority
              />

              {/* Feedback Bubble */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="bg-primary absolute bottom-12 left-8 z-20 rounded-2xl px-6 py-4 text-white shadow-xl"
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-1 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">FEEDBACK</p>
                    <p className="mt-1 text-xs opacity-90">
                      &quot;Great pronunciation on th- sound!&quot;
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Floating elements */}
              <div className="animate-pulse-slow bg-accent/20 absolute top-8 right-8 rounded-full p-3">
                <Mic className="text-accent h-6 w-6" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why EchoTalk Section */}
      <section className="border-border/40 relative border-y px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Why EchoTalk?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Experience the future of language learning with cutting-edge AI
              designed to make you fluent faster
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Real-time Feedback */}
            <FeatureCard
              icon={
                <div className="flex gap-1">
                  <div className="bg-primary h-12 w-1 animate-pulse rounded-full" />
                  <div
                    className="bg-primary h-12 w-1 rounded-full"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="bg-primary h-12 w-1 animate-pulse rounded-full"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="bg-cyan h-12 w-1 rounded-full"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <div className="bg-cyan h-12 w-1 animate-pulse rounded-full" />
                </div>
              }
              title="Real-time Feedback"
              description="Engage with realistic AI personas, get instant pronunciation and grammar corrections with real-world context."
              delay={0.2}
            />

            {/* Immersive Scenarios */}
            <FeatureCard
              icon={
                <div className="grid grid-cols-2 gap-2">
                  <ScenarioIcon icon={<MapPin />} label="Airport" />
                  <ScenarioIcon icon={<Briefcase />} label="Business" />
                  <ScenarioIcon icon={<UsersIcon />} label="Social" />
                  <ScenarioIcon icon={<Heart />} label="Dating" />
                </div>
              }
              title="Immersive Scenarios"
              description="Practice in real-life situations in a safe, judgment-free environment."
              delay={0.4}
            />

            {/* Progress Analytics */}
            <FeatureCard
              icon={
                <div className="relative h-16 w-full">
                  <div className="flex h-full items-end justify-around gap-2">
                    <div
                      className="bg-primary/40 w-8 rounded-t-lg"
                      style={{ height: "40%" }}
                    />
                    <div
                      className="bg-primary/60 w-8 rounded-t-lg"
                      style={{ height: "60%" }}
                    />
                    <div
                      className="bg-primary/80 w-8 rounded-t-lg"
                      style={{ height: "50%" }}
                    />
                    <div
                      className="bg-primary shadow-glow relative w-8 rounded-t-lg"
                      style={{ height: "90%" }}
                    >
                      <TrendingUp className="text-cyan absolute -top-6 -right-2 h-5 w-5" />
                    </div>
                  </div>
                </div>
              }
              title="Progress Analytics"
              description="Track your growth with clear, data-driven insights."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-32">
        <div className="via-primary/5 absolute inset-0 -z-10 bg-linear-to-b from-transparent to-transparent" />

        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card shadow-glow p-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Ready to find your <span className="gradient-text">voice</span>?
            </h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
              Join thousands of learners making English with EchoTalk today. No
              judgment, just progress.
            </p>

            <Link href="/auth/register">
              <Button
                size="lg"
                variant="primary"
                className="shadow-glow-hover mb-4"
              >
                Get Started Free
              </Button>
            </Link>

            <p className="text-muted-foreground text-sm">
              No credit card required • <strong>Free forever</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border/40 border-t px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">EchoTalk</span>
            </div>

            <div className="text-muted-foreground flex gap-8 text-sm">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="border-border/40 text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
            <p>© 2025 EchoTalk. Made with ❤️ for English learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ScenarioIcon({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="bg-primary/10 flex flex-col items-center gap-1 rounded-lg p-2">
      <div className="text-primary">{icon}</div>
      <span className="text-foreground text-[10px] font-medium">{label}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <Card
        variant="interactive"
        className="hover:shadow-glow h-full transition-all duration-300"
      >
        <div className="mb-6 flex h-16 items-center justify-center">{icon}</div>
        <h3 className="mb-3 text-center text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground text-center leading-relaxed">
          {description}
        </p>
      </Card>
    </motion.div>
  );
}
