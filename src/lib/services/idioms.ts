import { createClient } from "@/lib/supabase/client";

export interface Idiom {
  id: string;
  phrase: string;
  meaning: string;
  origin: string | null;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  examples: string[];
  cultural_note: string | null;
  created_at: string;
}

export interface IdiomWithProgress extends Idiom {
  learned: boolean;
  last_reviewed: string | null;
}

/**
 * Get all idioms with optional filtering
 */
export async function getIdioms(
  category?: string,
  difficulty?: "Beginner" | "Intermediate" | "Advanced"
): Promise<IdiomWithProgress[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("idioms").select("*");

  if (category) {
    query = query.eq("category", category);
  }

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data: idioms, error } = await query.order("phrase");

  if (error) {
    console.error("Error fetching idioms:", error);
    return [];
  }

  // If user is logged in, fetch their progress
  if (user) {
    const { data: progress } = await supabase
      .from("user_idiom_progress")
      .select("*")
      .eq("user_id", user.id);

    const progressMap = new Map(progress?.map((p) => [p.idiom_id, p]) || []);

    return (idioms as Idiom[]).map((idiom) => ({
      ...idiom,
      learned: progressMap.get(idiom.id)?.learned || false,
      last_reviewed: progressMap.get(idiom.id)?.last_reviewed || null,
    }));
  }

  // If no user, return idioms without progress
  return (idioms as Idiom[]).map((idiom) => ({
    ...idiom,
    learned: false,
    last_reviewed: null,
  }));
}

/**
 * Get a single idiom by ID
 */
export async function getIdiom(
  idiomId: string
): Promise<IdiomWithProgress | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: idiom, error } = await supabase
    .from("idioms")
    .select("*")
    .eq("id", idiomId)
    .single();

  if (error || !idiom) {
    console.error("Error fetching idiom:", error);
    return null;
  }

  // Get user progress if logged in
  if (user) {
    const { data: progress } = await supabase
      .from("user_idiom_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("idiom_id", idiomId)
      .single();

    return {
      ...(idiom as Idiom),
      learned: progress?.learned || false,
      last_reviewed: progress?.last_reviewed || null,
    };
  }

  return {
    ...(idiom as Idiom),
    learned: false,
    last_reviewed: null,
  };
}

/**
 * Get a random idiom
 */
export async function getRandomIdiom(
  difficulty?: "Beginner" | "Intermediate" | "Advanced"
): Promise<Idiom | null> {
  const supabase = createClient();

  let query = supabase.from("idioms").select("*");

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data: idioms, error } = await query;

  if (error || !idioms || idioms.length === 0) {
    console.error("Error fetching random idiom:", error);
    return null;
  }

  const randomIndex = Math.floor(Math.random() * idioms.length);
  return idioms[randomIndex] as Idiom;
}

/**
 * Search idioms by phrase or meaning
 */
export async function searchIdioms(
  query: string
): Promise<IdiomWithProgress[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: idioms, error } = await supabase
    .from("idioms")
    .select("*")
    .or(`phrase.ilike.%${query}%,meaning.ilike.%${query}%`)
    .order("phrase");

  if (error) {
    console.error("Error searching idioms:", error);
    return [];
  }

  // Get user progress if logged in
  if (user) {
    const { data: progress } = await supabase
      .from("user_idiom_progress")
      .select("*")
      .eq("user_id", user.id);

    const progressMap = new Map(progress?.map((p) => [p.idiom_id, p]) || []);

    return (idioms as Idiom[]).map((idiom) => ({
      ...idiom,
      learned: progressMap.get(idiom.id)?.learned || false,
      last_reviewed: progressMap.get(idiom.id)?.last_reviewed || null,
    }));
  }

  return (idioms as Idiom[]).map((idiom) => ({
    ...idiom,
    learned: false,
    last_reviewed: null,
  }));
}

/**
 * Mark an idiom as learned
 */
export async function markLearned(
  idiomId: string,
  learned: boolean = true
): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase.from("user_idiom_progress").upsert({
    user_id: user.id,
    idiom_id: idiomId,
    learned,
    last_reviewed: new Date().toISOString(),
  });

  if (error) {
    console.error("Error marking idiom as learned:", error);
    return false;
  }

  return true;
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("idioms")
    .select("category")
    .order("category");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  const uniqueCategories = [...new Set(data.map((item) => item.category))];
  return uniqueCategories;
}

/**
 * Get user's learned idioms count
 */
export async function getLearnedCount(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { data, error } = await supabase
    .from("user_idiom_progress")
    .select("id")
    .eq("user_id", user.id)
    .eq("learned", true);

  if (error) {
    console.error("Error fetching learned count:", error);
    return 0;
  }

  return data?.length || 0;
}
