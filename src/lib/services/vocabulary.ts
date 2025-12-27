import { createClient } from "@/lib/supabase/client";
import { calculateSRS, INITIAL_SRS_STATE, SRSState } from "@/lib/srs";

// Database types
interface DbVocabularyItem {
  id: number;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  user_vocabulary?: Array<{
    id: number;
    is_learned: boolean;
    next_review: string;
    interval: number;
    repetition_number: number;
    easiness_factor: number;
  }>;
}

export interface VocabularyItem {
  id: number;
  word: string;
  pronunciation?: string;
  meaning: string;
  example?: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";

  // UI only fields (or future DB fields)
  favorite?: boolean;

  // User Progress fields (nullable if not yet learned)
  user_vocab_id?: number;
  is_learned?: boolean;
  next_review?: string;
  interval?: number;
  repetition?: number;
  ef?: number;
}

const supabase = createClient();

/**
 * Fetch all vocabulary for a user, including their progress.
 */
export async function getVocabulary() {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("vocabulary_cache");
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      // 1 hour cache validity
      if (!navigator.onLine || Date.now() - timestamp < 1000 * 60 * 60) {
        return data;
      }
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Join vocabulary with user_vocabulary
  // Note: This requires a left join. Supabase JS syntax handles relations if set up.
  // If not, we might need a raw query or separate fetch.
  // Custom query via rpc is often easier for joins if foreign keys are tricky with RLS.
  // For now, attempting standard select with embedded resource.

  const { data, error } = await supabase.from("vocabulary").select(`
      *,
      user_vocabulary(
        id,
        is_learned,
        next_review,
        interval,
        repetition_number,
        easiness_factor
      )
    `);

  if (error) {
    if (typeof window !== "undefined" && !navigator.onLine) {
      const cached = localStorage.getItem("vocabulary_cache");
      if (cached) return JSON.parse(cached).data;
    }
    console.error("Error fetching vocabulary:", error);
    throw error;
  }

  // Update Cache
  if (typeof window !== "undefined") {
    const transformed = data.map((item: DbVocabularyItem) => ({
      id: item.id,
      word: item.word,
      pronunciation: item.pronunciation,
      meaning: item.meaning,
      example: item.example,
      category: item.category,
      difficulty: item.difficulty,

      user_vocab_id: item.user_vocabulary?.[0]?.id,
      is_learned: item.user_vocabulary?.[0]?.is_learned || false,
      next_review: item.user_vocabulary?.[0]?.next_review,
      interval: item.user_vocabulary?.[0]?.interval || 0,
      repetition: item.user_vocabulary?.[0]?.repetition_number || 0,
      ef: item.user_vocabulary?.[0]?.easiness_factor || 2.5,
    }));

    localStorage.setItem(
      "vocabulary_cache",
      JSON.stringify({
        timestamp: Date.now(),
        data: transformed,
      })
    );
    return transformed;
  }
}

/**
 * Add a new word to the global dictionary (if new) and link to user.
 */
export async function addWord(wordData: Partial<VocabularyItem>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // 1. Insert into Global Vocabulary (or get existing ID)
  // For simplicity, we'll try to insert. If conflict (word text unique constraint?), we handle it.
  // In `schema.sql` I didn't add unique constraint on `word`, but should have.
  // Assuming simple insert for now.

  const { data: vocabData, error: vocabError } = await supabase
    .from("vocabulary")
    .insert({
      word: wordData.word,
      meaning: wordData.meaning,
      pronunciation: wordData.pronunciation,
      example: wordData.example,
      category: wordData.category || "general",
      difficulty: wordData.difficulty || "Beginner",
    })
    .select()
    .single();

  if (vocabError) throw vocabError;

  // 2. Link to User
  const { error: linkError } = await supabase.from("user_vocabulary").insert({
    user_id: user.id,
    vocab_id: vocabData.id,
    ...INITIAL_SRS_STATE,
  });

  if (linkError) throw linkError;

  return vocabData;
}

/**
 * Update progress after a review.
 */
export async function submitReview(vocabId: number, quality: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // 1. Get current state
  const { data: current, error: fetchError } = await supabase
    .from("user_vocabulary")
    .select("*")
    .eq("user_id", user.id)
    .eq("vocab_id", vocabId)
    .single();

  if (fetchError) throw fetchError;

  const currentState: SRSState = {
    interval: current.interval,
    repetition: current.repetition_number,
    ef: current.easiness_factor,
  };

  // 2. Calculate next state
  const nextState = calculateSRS(currentState, quality);

  // 3. Update DB
  const { error: updateError } = await supabase
    .from("user_vocabulary")
    .update({
      interval: nextState.interval,
      repetition_number: nextState.repetition,
      easiness_factor: nextState.ef,
      next_review: nextState.nextReviewDate.toISOString(),
      last_reviewed_at: new Date().toISOString(),
      is_learned: true, // Mark as learned after first review
    })
    .eq("id", current.id);

  if (updateError) throw updateError;

  return nextState;
}
