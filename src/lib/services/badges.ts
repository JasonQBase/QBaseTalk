import { createClient } from "@/lib/supabase/client";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "streak" | "vocabulary" | "conversation" | "game" | "milestone";
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
  progress: Record<string, string | number | boolean>;
  badge?: BadgeDefinition;
}

export interface BadgeProgress {
  badge: BadgeDefinition;
  unlocked: boolean;
  progress: number;
  target: number;
  percentage: number;
}

/**
 * Get all available badge definitions
 */
export async function getAllBadges(): Promise<BadgeDefinition[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("badge_definitions")
      .select("*")
      .order("requirement_value", { ascending: true });

    if (error) {
      console.error("Error fetching badge definitions:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching badge definitions:", error);
    return [];
  }
}

/**
 * Get user's unlocked badges
 */
export async function getUserBadges(): Promise<UserBadge[]> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("user_badges")
      .select(
        `
        *,
        badge:badge_definitions(*)
      `
      )
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("Error fetching user badges:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }
}

/**
 * Check and award eligible badges to the user
 */
export async function checkAndAwardBadges(): Promise<boolean> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.rpc("check_and_award_badges", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error checking badges:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking badges:", error);
    return false;
  }
}

/**
 * Get badge progress for all badges
 */
export async function getBadgeProgress(): Promise<BadgeProgress[]> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Get all badges and user's unlocked badges
    const [allBadges, userBadges] = await Promise.all([
      getAllBadges(),
      getUserBadges(),
    ]);

    // Get user stats
    const { data: profile } = await supabase
      .from("users_extended")
      .select("current_streak, total_xp")
      .eq("id", user.id)
      .single();

    const { count: wordsLearned } = await supabase
      .from("vocabulary_words")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("learned", true);

    const { data: conversations } = await supabase
      .from("conversations")
      .select("session_id")
      .eq("user_id", user.id);

    const conversationsCompleted = new Set(
      conversations?.map((c) => c.session_id) || []
    ).size;

    const userStats = {
      streak_days: profile?.current_streak || 0,
      xp_earned: profile?.total_xp || 0,
      words_learned: wordsLearned || 0,
      conversations_completed: conversationsCompleted,
      games_played: 0, // TODO: Track games played
    };

    // Calculate progress for each badge
    const unlockedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id));

    return allBadges.map((badge) => {
      const unlocked = unlockedBadgeIds.has(badge.id);
      let currentValue = 0;

      switch (badge.requirement_type) {
        case "streak_days":
          currentValue = userStats.streak_days;
          break;
        case "words_learned":
          currentValue = userStats.words_learned;
          break;
        case "conversations_completed":
          currentValue = userStats.conversations_completed;
          break;
        case "games_played":
          currentValue = userStats.games_played;
          break;
        case "xp_earned":
          currentValue = userStats.xp_earned;
          break;
      }

      return {
        badge,
        unlocked,
        progress: Math.min(currentValue, badge.requirement_value),
        target: badge.requirement_value,
        percentage: unlocked
          ? 100
          : Math.min(100, (currentValue / badge.requirement_value) * 100),
      };
    });
  } catch (error) {
    console.error("Error getting badge progress:", error);
    return [];
  }
}

/**
 * Get badges by category
 */
export async function getBadgesByCategory(
  category: BadgeDefinition["category"]
): Promise<BadgeProgress[]> {
  const allProgress = await getBadgeProgress();
  return allProgress.filter((bp) => bp.badge.category === category);
}

/**
 * Get recently unlocked badges (last 7 days)
 */
export async function getRecentBadges(): Promise<UserBadge[]> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("user_badges")
      .select(
        `
        *,
        badge:badge_definitions(*)
      `
      )
      .eq("user_id", user.id)
      .gte("unlocked_at", sevenDaysAgo.toISOString())
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("Error fetching recent badges:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching recent badges:", error);
    return [];
  }
}
