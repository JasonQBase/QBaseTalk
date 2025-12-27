import { createClient } from "@/lib/supabase/client";

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_xp: number;
  current_streak: number;
  rank: number;
  avatar_url?: string;
  level?: number;
}

export interface LeaderboardStats {
  userRank: number;
  totalUsers: number;
  percentile: number;
}

/**
 * Get leaderboard rankings
 */
export async function getLeaderboard(
  _timeframe: "weekly" | "monthly" | "all-time" = "all-time",
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    const supabase = createClient();

    // Select from 'profiles' table
    // Note: total_xp mapped from 'xp' column
    const query = supabase
      .from("profiles")
      .select("id, username, xp, current_streak, avatar_url, level")
      .order("xp", { ascending: false })
      .limit(limit);

    // TODO: Implement date filtering for weekly/monthly if we have history table populated
    // For now returning all-time based on current XP

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }

    // Add rank to each entry and map fields
    return (data || []).map((entry, index) => ({
      user_id: entry.id,
      username: entry.username || "Anonymous",
      total_xp: entry.xp || 0,
      current_streak: entry.current_streak || 0,
      rank: index + 1,
      avatar_url: entry.avatar_url,
      level: entry.level,
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}

/**
 * Get user's rank and stats
 */
export async function getUserRank(): Promise<LeaderboardStats | null> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    // Get user's XP
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .single();

    if (!userProfile) return null;

    const userXP = userProfile.xp || 0;

    // Count users with higher XP
    const { count: usersAbove } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gt("xp", userXP);

    // Count total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const rank = (usersAbove || 0) + 1;
    const total = totalUsers || 1;
    const percentile = Math.round((1 - (rank - 1) / total) * 100);

    return {
      userRank: rank,
      totalUsers: total,
      percentile,
    };
  } catch (error) {
    console.error("Error getting user rank:", error);
    return null;
  }
}

/**
 * Get friends' rankings (if friend system exists)
 */
export async function getFriendRankings(): Promise<LeaderboardEntry[]> {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    // Fetch friends
    const { data: friendships } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    const friendIds = friendships?.map((f) => f.friend_id) || [];
    friendIds.push(user.id); // Include self

    const { data } = await supabase
      .from("profiles")
      .select("id, username, xp, current_streak, avatar_url, level")
      .in("id", friendIds)
      .order("xp", { ascending: false });

    return (data || []).map((entry, index) => ({
      user_id: entry.id,
      username: entry.username || "Anonymous",
      total_xp: entry.xp || 0,
      current_streak: entry.current_streak || 0,
      rank: index + 1,
      avatar_url: entry.avatar_url,
      level: entry.level,
    }));
  } catch (error) {
    console.error("Error getting friend rankings:", error);
    return [];
  }
}

/**
 * Get top performers (top 3)
 */
export async function getTopPerformers(): Promise<LeaderboardEntry[]> {
  return getLeaderboard("all-time", 3);
}

/**
 * Search leaderboard by username
 */
export async function searchLeaderboard(
  query: string
): Promise<LeaderboardEntry[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, xp, current_streak, avatar_url, level")
      .ilike("username", `%${query}%`)
      .order("xp", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error searching leaderboard:", error);
      return [];
    }

    return (data || []).map((entry, index) => ({
      user_id: entry.id,
      username: entry.username || "Anonymous",
      total_xp: entry.xp || 0,
      current_streak: entry.current_streak || 0,
      rank: index + 1,
      avatar_url: entry.avatar_url,
      level: entry.level,
    }));
  } catch (error) {
    console.error("Error searching leaderboard:", error);
    return [];
  }
}
