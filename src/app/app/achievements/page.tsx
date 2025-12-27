"use client";

import { BadgeSystem } from "@/components/features/BadgeSystem";

export default function AchievementsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Weekly Update */}
            <section>
              <div className="mb-6">
                <div className="text-primary mb-2 flex items-center gap-2 text-sm">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span className="font-semibold tracking-wide">
                    WEEKLY UPDATE
                  </span>
                </div>
                <h1 className="mb-3 text-4xl leading-tight font-bold">
                  You&apos;re at the top{" "}
                  <span className="gradient-text">5%</span> of learners this
                  week, Alex!
                </h1>
                <p className="text-muted-foreground text-lg">
                  Keep up the momentum to reach the Emerald League.
                </p>
              </div>
            </section>

            {/* Badges Showcase */}
            <section className="glass-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
                    <svg
                      className="text-primary h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Badges Showcase</h2>
                </div>
              </div>

              <BadgeSystem category="all" showProgress={true} />
            </section>

            {/* Next Milestones */}
            <section className="glass-card relative p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <svg
                    className="h-6 w-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Next Milestones</h2>
              </div>

              {/* Encouragement Tooltip */}
              <div className="bg-popover text-popover-foreground absolute top-6 right-6 rounded-xl px-4 py-2 text-sm font-medium shadow-lg">
                Keep going! You&apos;re almost there! 💪
              </div>

              <div className="mt-12 flex items-center justify-between">
                {/* Milestone 1 */}
                <MilestoneItem label="First Chat" status="completed" />

                {/* Connector */}
                <div className="bg-primary h-1 flex-1" />

                {/* Milestone 2 */}
                <MilestoneItem label="7-Day Streak" status="completed" />

                {/* Connector */}
                <div className="bg-primary h-1 flex-1" />

                {/* Milestone 3 - Current */}
                <div className="relative flex flex-col items-center gap-2">
                  <div className="bg-primary absolute -top-8 rounded-full px-3 py-1 text-xs font-bold text-white">
                    Next
                  </div>
                  <div className="bg-primary shadow-glow flex h-12 w-12 items-center justify-center rounded-full">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold">100 Convos</p>
                </div>

                {/* Connector */}
                <div className="bg-muted h-1 flex-1" />

                {/* Milestone 4 - Locked */}
                <MilestoneItem label="50-Day Streak" status="locked" />

                {/* Avatar */}
                <div className="border-primary ml-4 h-16 w-16 overflow-hidden rounded-full border-4">
                  <div className="from-primary to-cyan h-full w-full bg-linear-to-br" />
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Current Level */}
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm font-medium">
                  Current Level
                </p>
                <span className="bg-primary rounded-full px-3 py-1 text-xs font-bold text-white">
                  Level 12
                </span>
              </div>
              <h3 className="mb-4 text-xl font-bold">Fluent Speaker</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">1250/1500 XP</span>
                </div>
                <div className="bg-muted h-3 overflow-hidden rounded-full">
                  <div
                    className="from-primary to-cyan shadow-glow h-full bg-linear-to-r"
                    style={{ width: "83%" }}
                  />
                </div>
              </div>
            </div>

            {/* Weekly Leaders */}
            <div className="glass-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 13h2v8H3v-8zm6-6h2v14H9V7zm6 4h2v10h-2V11z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-bold">Weekly Leaders</h3>
                  <p className="text-muted-foreground text-xs">
                    Ends in 2 days 14 hours
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <LeaderboardItem
                  rank={1}
                  name="Sarah J."
                  level="Fluent Speaker"
                  xp="12,400"
                  hasFire
                />
                <LeaderboardItem
                  rank={2}
                  name="You"
                  level="Fluent Speaker"
                  xp="11,950"
                  hasFire
                  isCurrentUser
                />
                <LeaderboardItem
                  rank={3}
                  name="David L."
                  level="Advanced"
                  xp="11,200"
                />
                <LeaderboardItem
                  rank={4}
                  name="Maria G."
                  level="Advanced"
                  xp="10,850"
                />
                <LeaderboardItem
                  rank={5}
                  name="Kenji T."
                  level="Intermediate"
                  xp="9,400"
                />
                <LeaderboardItem
                  rank={6}
                  name="Sophie R."
                  level="Intermediate"
                  xp="8,200"
                />
              </div>

              <button className="bg-accent/5 hover:bg-accent/10 mt-4 w-full rounded-lg py-2.5 text-sm font-medium transition-colors">
                View Full Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MilestoneItem({
  label,
  status,
}: {
  label: string;
  status: "completed" | "locked";
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          status === "completed" ? "bg-primary" : "bg-muted"
        }`}
      >
        {status === "completed" ? (
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="text-muted-foreground h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 1C8.676 1 6 3.676 6 7v2H5c-1.105 0-2 .895-2 2v10c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V11c0-1.105-.895-2-2-2h-1V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z" />
          </svg>
        )}
      </div>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}

function LeaderboardItem({
  rank,
  name,
  level,
  xp,
  hasFire = false,
  isCurrentUser = false,
}: {
  rank: number;
  name: string;
  level: string;
  xp: string;
  hasFire?: boolean;
  isCurrentUser?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
        isCurrentUser ? "bg-primary/10" : "hover:bg-accent/5"
      }`}
    >
      <span
        className={`w-6 text-center font-bold ${
          rank === 1
            ? "text-yellow-400"
            : rank === 2
              ? "text-primary"
              : "text-muted-foreground"
        }`}
      >
        {rank}
      </span>
      <div className="from-primary to-cyan h-10 w-10 rounded-full bg-linear-to-br" />
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold">{name}</p>
          {hasFire && <span>🔥</span>}
          {rank === 1 && <span className="text-xs">12</span>}
          {rank === 2 && <span className="text-xs">7</span>}
        </div>
        <p className="text-muted-foreground text-xs">{level}</p>
      </div>
      <span
        className={`text-sm font-bold ${isCurrentUser ? "text-primary" : ""}`}
      >
        {xp}
      </span>
    </div>
  );
}
