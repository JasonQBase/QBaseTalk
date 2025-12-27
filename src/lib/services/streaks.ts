import { createClient } from "@/lib/supabase/client";

export interface StreakCalendarDay {
  date: string; // YYYY-MM-DD
  hasActivity: boolean;
  isFreezeUsed: boolean;
  isToday: boolean;
  activityCount: number;
  xpEarned: number;
}

export interface StreakMilestone {
  id: string;
  milestone_days: number;
  achieved_at: string;
  badge_awarded: string;
  xp_awarded: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
  nextMilestone: number;
  daysToNextMilestone: number;
  achievedMilestones: StreakMilestone[];
}

export interface FreezeHistory {
  id: string;
  freeze_date: string;
  used_at: string;
}

const MILESTONES = [7, 14, 30, 60, 100, 365];

/**
 * Get comprehensive streak statistics for the current user
 */
export async function getStreakStats(): Promise<StreakStats | null> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user profile
    const { data: profile } = await supabase
      .from("users_extended")
      .select("current_streak, longest_streak, streak_freeze_count")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    // Get achieved milestones
    const { data: milestones } = await supabase
      .from("streak_milestones")
      .select("*")
      .eq("user_id", user.id)
      .order("milestone_days", { ascending: true });

    const currentStreak = profile.current_streak || 0;
    const nextMilestone = MILESTONES.find((m) => m > currentStreak) || 365;
    const daysToNextMilestone = nextMilestone - currentStreak;

    return {
      currentStreak,
      longestStreak: profile.longest_streak || 0,
      freezesAvailable: profile.streak_freeze_count || 0,
      nextMilestone,
      daysToNextMilestone,
      achievedMilestones: milestones || [],
    };
  } catch (error) {
    console.error("Error getting streak stats:", error);
    return null;
  }
}

/**
 * Get calendar data for the last N days
 */
export async function getStreakCalendarData(
  days: number = 42
): Promise<StreakCalendarDay[]> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get activity data
    const { data: activities } = await supabase
      .from("daily_activities")
      .select("activity_date, activity_count, xp_earned")
      .eq("user_id", user.id)
      .gte("activity_date", startDate.toISOString().split("T")[0])
      .order("activity_date", { ascending: true });

    // Get freeze history
    const { data: freezes } = await supabase
      .from("streak_freeze_history")
      .select("freeze_date")
      .eq("user_id", user.id)
      .gte("freeze_date", startDate.toISOString().split("T")[0]);

    // Create a map for quick lookup
    const activityMap = new Map(
      (activities || []).map((a) => [a.activity_date, a])
    );
    const freezeSet = new Set((freezes || []).map((f) => f.freeze_date));

    // Generate calendar data
    const calendarData: StreakCalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const activity = activityMap.get(dateStr);
      const isFreezeUsed = freezeSet.has(dateStr);
      const isToday = i === 0;

      calendarData.push({
        date: dateStr,
        hasActivity: !!activity,
        isFreezeUsed,
        isToday,
        activityCount: activity?.activity_count || 0,
        xpEarned: activity?.xp_earned || 0,
      });
    }

    return calendarData;
  } catch (error) {
    console.error("Error getting calendar data:", error);
    return [];
  }
}

/**
 * Check if user can use a streak freeze
 */
export async function canUseStreakFreeze(): Promise<boolean> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("users_extended")
      .select("streak_freeze_count")
      .eq("id", user.id)
      .single();

    return (profile?.streak_freeze_count || 0) > 0;
  } catch (error) {
    console.error("Error checking freeze availability:", error);
    return false;
  }
}

/**
 * Use a streak freeze for a specific date
 */
export async function useStreakFreeze(freezeDate: string): Promise<{
  success: boolean;
  message: string;
  freezesRemaining?: number;
}> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    const { data, error } = await supabase.rpc("use_streak_freeze", {
      p_user_id: user.id,
      p_freeze_date: freezeDate,
    });

    if (error) {
      console.error("Error using streak freeze:", error);
      return { success: false, message: "Failed to use streak freeze" };
    }

    return data as {
      success: boolean;
      message: string;
      freezesRemaining?: number;
    };
  } catch (error) {
    console.error("Error using streak freeze:", error);
    return { success: false, message: "An error occurred" };
  }
}

/**
 * Check and award milestone badges for current streak
 */
export async function checkAndAwardMilestones(
  currentStreak: number
): Promise<void> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc("check_streak_milestone", {
      p_user_id: user.id,
      p_current_streak: currentStreak,
    });
  } catch (error) {
    console.error("Error checking milestones:", error);
  }
}

/**
 * Get freeze usage history
 */
export async function getFreezeHistory(): Promise<FreezeHistory[]> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("streak_freeze_history")
      .select("*")
      .eq("user_id", user.id)
      .order("used_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching freeze history:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching freeze history:", error);
    return [];
  }
}

/**
 * Get monthly streak freeze limit
 */
export function getMonthlyStreakFreezeLimit(): number {
  return 2;
}
