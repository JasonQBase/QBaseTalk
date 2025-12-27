import { createClient } from "@/lib/supabase/client";

export interface WordOfDay {
  id: string;
  word: string;
  pronunciation: string;
  part_of_speech: string;
  definition: string;
  example_1: string;
  example_2: string | null;
  example_3: string | null;
  synonym: string | null;
  antonym: string | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  date: string;
  image_url: string | null;
  created_at: string;
}

export interface UserWOTDProgress {
  id: string;
  user_id: string;
  wotd_id: string;
  viewed: boolean;
  practiced: boolean;
  mastered: boolean;
  quiz_score: number | null;
  viewed_at: string | null;
  practiced_at: string | null;
  created_at: string;
}

export interface WOTDWithProgress extends WordOfDay {
  progress?: UserWOTDProgress;
}

/**
 * Get today's word of the day
 */
export async function getTodayWord(): Promise<WOTDWithProgress | null> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get today's word
  const { data: word, error } = await supabase
    .from("word_of_day")
    .select("*")
    .eq("date", today)
    .single();

  if (error || !word) {
    console.error("Error fetching today's word:", error);
    return null;
  }

  // Get user progress if authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: progress } = await supabase
      .from("user_wotd_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("wotd_id", word.id)
      .single();

    return {
      ...word,
      progress: progress || undefined,
    } as WOTDWithProgress;
  }

  return word as WordOfDay;
}

/**
 * Get word history for the past N days
 */
export async function getWordHistory(
  days: number = 7
): Promise<WOTDWithProgress[]> {
  const supabase = createClient();

  const { data: words, error } = await supabase
    .from("word_of_day")
    .select("*")
    .lte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: false })
    .limit(days);

  if (error || !words) {
    console.error("Error fetching word history:", error);
    return [];
  }

  // Get user progress if authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const wordIds = words.map((w) => w.id);
    const { data: progressList } = await supabase
      .from("user_wotd_progress")
      .select("*")
      .eq("user_id", user.id)
      .in("wotd_id", wordIds);

    const progressMap = new Map(progressList?.map((p) => [p.wotd_id, p]) || []);

    return words.map((word) => ({
      ...word,
      progress: progressMap.get(word.id),
    })) as WOTDWithProgress[];
  }

  return words as WordOfDay[];
}

/**
 * Mark word as viewed
 */
export async function markWordViewed(wotdId: string): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if progress exists
  const { data: existing } = await supabase
    .from("user_wotd_progress")
    .select("id")
    .eq("user_id", user.id)
    .eq("wotd_id", wotdId)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("user_wotd_progress")
      .update({
        viewed: true,
        viewed_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return !error;
  } else {
    // Create new
    const { error } = await supabase.from("user_wotd_progress").insert({
      user_id: user.id,
      wotd_id: wotdId,
      viewed: true,
      viewed_at: new Date().toISOString(),
    });

    return !error;
  }
}

/**
 * Mark word as practiced
 */
export async function markWordPracticed(
  wotdId: string,
  quizScore?: number
): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // Check if progress exists
  const { data: existing } = await supabase
    .from("user_wotd_progress")
    .select("id")
    .eq("user_id", user.id)
    .eq("wotd_id", wotdId)
    .single();

  const updateData = {
    practiced: true,
    practiced_at: new Date().toISOString(),
    ...(quizScore !== undefined && { quiz_score: quizScore }),
    // Auto-mark as mastered if quiz score is high
    ...(quizScore && quizScore >= 80 && { mastered: true }),
  };

  if (existing) {
    const { error } = await supabase
      .from("user_wotd_progress")
      .update(updateData)
      .eq("id", existing.id);

    return !error;
  } else {
    const { error } = await supabase.from("user_wotd_progress").insert({
      user_id: user.id,
      wotd_id: wotdId,
      ...updateData,
    });

    return !error;
  }
}

/**
 * Get statistics about user's WOTD progress
 */
export async function getWOTDStats(): Promise<{
  totalViewed: number;
  totalPracticed: number;
  totalMastered: number;
  currentStreak: number;
}> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      totalViewed: 0,
      totalPracticed: 0,
      totalMastered: 0,
      currentStreak: 0,
    };

  // Get all progress
  const { data: progress } = await supabase
    .from("user_wotd_progress")
    .select("*")
    .eq("user_id", user.id)
    .order("viewed_at", { ascending: false });

  if (!progress) {
    return {
      totalViewed: 0,
      totalPracticed: 0,
      totalMastered: 0,
      currentStreak: 0,
    };
  }

  const totalViewed = progress.filter((p) => p.viewed).length;
  const totalPracticed = progress.filter((p) => p.practiced).length;
  const totalMastered = progress.filter((p) => p.mastered).length;

  // Calculate streak (consecutive days with viewed words)
  let currentStreak = 0;
  const today = new Date();
  const viewedDates = new Set(
    progress
      .filter((p) => p.viewed && p.viewed_at)
      .map((p) => p.viewed_at!.split("T")[0])
  );

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];

    if (viewedDates.has(dateStr)) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    totalViewed,
    totalPracticed,
    totalMastered,
    currentStreak,
  };
}
