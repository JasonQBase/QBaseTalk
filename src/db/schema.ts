import {
  pgTable,
  pgSchema,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  doublePrecision,
  bigint,
} from "drizzle-orm/pg-core";

// Auth Schema (Supabase)
const authSchema = pgSchema("auth");
const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

// 1. Profiles & Core Auth
export const users = pgTable("users_extended", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id),
  displayName: text("display_name"),
  username: text("username").unique(),
  avatarUrl: text("avatar_url"),

  // Gamification Core
  totalXp: integer("total_xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),

  // Streak Tracking
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActivityDate: date("last_activity_date"),
  streakFreezeCount: integer("streak_freeze_count").default(0).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 2. Vocabulary & SRS
export const vocabulary = pgTable("vocabulary", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  word: text("word").notNull(),
  meaning: text("meaning").notNull(),
  pronunciation: text("pronunciation"),
  example: text("example"),
  category: text("category").default("general"),
  difficulty: text("difficulty").default("Beginner"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userVocabulary = pgTable("user_vocabulary", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  vocabId: bigint("vocab_id", { mode: "number" })
    .references(() => vocabulary.id)
    .notNull(),
  isLearned: boolean("is_learned").default(false),

  // SRS
  nextReview: timestamp("next_review", { withTimezone: true }).defaultNow(),
  interval: integer("interval").default(0),
  easinessFactor: doublePrecision("easiness_factor").default(2.5),
  repetitionNumber: integer("repetition_number").default(0),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// 3. Stories
export const stories = pgTable("stories", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  difficulty: text("difficulty").notNull(),
  category: text("category"),
  questions: jsonb("questions"),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userStoryProgress = pgTable("user_story_progress", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  storyId: bigint("story_id", { mode: "number" })
    .references(() => stories.id)
    .notNull(),
  completed: boolean("completed").default(false),
  bestScore: integer("best_score").default(0),
  lastReadAt: timestamp("last_read_at", { withTimezone: true }),
});

export const storyVocabulary = pgTable("story_vocabulary", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  storyId: bigint("story_id", { mode: "number" })
    .references(() => stories.id)
    .notNull(),
  word: text("word").notNull(),
  definition: text("definition").notNull(),
  context: text("context"),
});

// 4. Daily Activities & Streaks
export const dailyActivities = pgTable("daily_activities", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  activityDate: date("activity_date").notNull(),
  activityCount: integer("activity_count").default(1),
  xpEarned: integer("xp_earned").default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const streakMilestones = pgTable("streak_milestones", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  milestoneDays: integer("milestone_days").notNull(),
  achievedAt: timestamp("achieved_at", { withTimezone: true }).defaultNow(),
  badgeAwarded: text("badge_awarded"),
  xpAwarded: integer("xp_awarded").default(0),
});

export const streakFreezeHistory = pgTable("streak_freeze_history", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  freezeDate: date("freeze_date").notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }).defaultNow(),
});

// 5. Badges
export const badgeDefinitions = pgTable("badge_definitions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  requirementType: text("requirement_type").notNull(),
  requirementValue: integer("requirement_value").notNull(),
  xpReward: integer("xp_reward").default(0),
  rarity: text("rarity").default("common"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  badgeId: text("badge_id")
    .references(() => badgeDefinitions.id)
    .notNull(),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow(),
  progress: jsonb("progress").default({}),
});

// 6. Learning Path
export const learningPathItems = pgTable("learning_path_items", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  status: text("status").default("locked"),
  orderIndex: integer("order_index").notNull(),
  actionUrl: text("action_url"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userLearningGoals = pgTable("user_learning_goals", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => authUsers.id),
  primaryGoal: text("primary_goal"),
  currentLevel: text("current_level"),
  weeklyTargetMinutes: integer("weekly_target_minutes").default(60),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// 7. Social / Challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  date: date("date").unique().notNull(),
  tasks: jsonb("tasks").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userChallenges = pgTable("user_challenges", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  challengeId: bigint("challenge_id", { mode: "number" })
    .references(() => dailyChallenges.id)
    .notNull(),
  isFullyCompleted: boolean("is_fully_completed").default(false),
  progress: jsonb("progress"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const friendships = pgTable("friendships", {
  id: bigint("id", { mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity(),
  userId: uuid("user_id")
    .references(() => authUsers.id)
    .notNull(),
  friendId: uuid("friend_id")
    .references(() => authUsers.id)
    .notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
