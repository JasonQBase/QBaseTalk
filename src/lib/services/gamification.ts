import { createClient } from "@/lib/supabase/client";

export const XP_VALUES = {
  VOCAB_ADD: 10,
  VOCAB_REVIEW: 5,
  ROLEPLAY_COMPLETE: 50,
  DAILY_BONUS: 100,
};

export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600,
]; // Level 1 starts at 0, Level 2 at 100...

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code === "PGRST116") {
    // Profile doesn't exist, return default/null or handle creation upstream
    return null;
  }

  if (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }

  return data as UserProfile;
}

export async function awardXP(
  userId: string,
  amount: number,
  actionType: string
) {
  try {
    const supabase = createClient();
    // 1. Get current profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile) return; // Should handle creation if missing

    // 2. Calculate new XP and Level
    const newXP = profile.xp + amount;
    let newLevel = profile.level;

    // Check level up
    // Simple check: iterate through thresholds or findLastIndex
    // Assuming LEVEL_THRESHOLDS is sorted
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newXP >= LEVEL_THRESHOLDS[i]) {
        // Arrays are 0-indexed, but levels are 1-indexed?
        // Let's say index 0 = Level 1 (0 XP)
        newLevel = i + 1;
        break;
      }
    }

    // 3. Update Profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ xp: newXP, level: newLevel })
      .eq("id", userId);

    if (updateError) throw updateError;

    // 4. Log History
    await supabase.from("xp_history").insert({
      user_id: userId,
      amount,
      action_type: actionType,
    });

    return { success: true, newXP, newLevel };
  } catch (error) {
    console.error("Error awarding XP:", error);
    return { success: false };
  }
}

export async function updateStreak(userId: string) {
  // Logic to check last_activity_date and update streak
  // Ideally user timezones matter, but we'll use UTC date for MVP
  try {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_activity_date, current_streak, longest_streak")
      .eq("id", userId)
      .single();

    if (!profile) return;

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastActive = profile.last_activity_date;

    let newStreak = profile.current_streak;
    let newLongest = profile.longest_streak;

    if (lastActive === today) {
      // Already active today, do nothing
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastActive === yesterdayStr) {
      // Consecutive day
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }

    if (newStreak > newLongest) {
      newLongest = newStreak;
    }

    await supabase
      .from("profiles")
      .update({
        last_activity_date: today,
        current_streak: newStreak,
        longest_streak: newLongest,
      })
      .eq("id", userId);
  } catch (error) {
    console.error("Error updating streak:", error);
  }
}
