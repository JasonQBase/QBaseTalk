import { createClient } from "@/lib/supabase/client";

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  activity_count: number;
  activity_types: string[];
  total_minutes: number;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

/**
 * Track a learning activity for the current user
 */
export async function trackActivity(
  activityType: "vocab" | "conversation" | "practice" | "challenge" | "review",
  minutes: number = 0,
  xpEarned: number = 0
): Promise<boolean> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.rpc("track_activity", {
      p_user_id: user.id,
      p_activity_type: activityType,
      p_minutes: minutes,
      p_xp: xpEarned,
    });

    if (error) {
      console.error("Error tracking activity:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error tracking activity:", error);
    return false;
  }
}

/**
 * Get activity data for the last N days
 */
export async function getActivityHistory(
  days: number = 42
): Promise<DailyActivity[]> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("daily_activities")
      .select("*")
      .eq("user_id", user.id)
      .gte("activity_date", startDate.toISOString().split("T")[0])
      .order("activity_date", { ascending: true });

    if (error) {
      console.error("Error fetching activity history:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching activity history:", error);
    return [];
  }
}

/**
 * Calculate current and longest streak
 */
export async function calculateStreaks(): Promise<{
  currentStreak: number;
  longestStreak: number;
}> {
  try {
    const activities = await getActivityHistory(365); // Check last year

    if (activities.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert activities to a Set for O(1) lookup
    const activityDates = new Set(activities.map((a) => a.activity_date));

    // Calculate current streak (counting backwards from today)
    const checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (activityDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (activityDates.has(dateStr)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak };
  } catch (error) {
    console.error("Error calculating streaks:", error);
    return { currentStreak: 0, longestStreak: 0 };
  }
}

/**
 * Get activity summary for a specific date range
 */
export async function getActivitySummary(startDate: string, endDate: string) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("daily_activities")
      .select("*")
      .eq("user_id", user.id)
      .gte("activity_date", startDate)
      .lte("activity_date", endDate);

    if (error) {
      console.error("Error fetching activity summary:", error);
      return null;
    }

    const totalActivities =
      data?.reduce((sum, a) => sum + a.activity_count, 0) || 0;
    const totalMinutes =
      data?.reduce((sum, a) => sum + a.total_minutes, 0) || 0;
    const totalXP = data?.reduce((sum, a) => sum + a.xp_earned, 0) || 0;
    const daysActive = data?.length || 0;

    return {
      totalActivities,
      totalMinutes,
      totalXP,
      daysActive,
      activities: data || [],
    };
  } catch (error) {
    console.error("Error fetching activity summary:", error);
    return null;
  }
}
