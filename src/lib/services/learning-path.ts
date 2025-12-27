import { createClient } from "@/lib/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export interface LearningPathItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "practice" | "quiz";
  status: "locked" | "available" | "completed";
  order_index: number;
  action_url: string;
}

export interface UserLearningGoal {
  primary_goal: string;
  current_level: string;
  weekly_target_minutes: number;
}

/**
 * Get current learning path for user
 */
export async function getLearningPath(): Promise<LearningPathItem[]> {
  // Check offline cache first (for speed and offline support)
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("learning_path_cache");
    if (cacheIsValid(cached)) {
      if (!navigator.onLine) {
        return JSON.parse(cached!).data;
      }
      // If online, we can return cached immediately but trigger revalidation (stale-while-revalidate)
      // For this MVP, let's just use cache if valid and return (simple cache-first)
    }
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("learning_path_items")
    .select("*")
    .eq("user_id", user.id)
    .order("order_index", { ascending: true });

  if (error) {
    if (typeof window !== "undefined" && !navigator.onLine) {
      // Deep offline fallback if request fails and we have any cache (even if old)
      const lastResort = localStorage.getItem("learning_path_cache");
      if (lastResort) return JSON.parse(lastResort).data;
    }
    console.error("Error fetching learning path:", error);
    return [];
  }

  // Update Cache
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "learning_path_cache",
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  }

  return data as LearningPathItem[];
}

function cacheIsValid(cached: string | null): boolean {
  if (!cached) return false;
  try {
    const { timestamp } = JSON.parse(cached);
    // 1 hour cache validity
    return Date.now() - timestamp < 1000 * 60 * 60;
  } catch {
    return false;
  }
}

/**
 * Generate a new learning path using Gemini AI
 */
export async function generateLearningPath(): Promise<LearningPathItem[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // 1. Fetch User Goals & Profile
  const { data: goals } = await supabase
    .from("user_learning_goals")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Default goals if not set
  const currentLevel = goals?.current_level || "Beginner";
  const primaryGoal = goals?.primary_goal || "General Fluency";

  // 2. Start Gemini Generation
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
      Create a personalized English learning path for a user with the following profile:
      - Level: ${currentLevel}
      - Goal: ${primaryGoal}
      
      Generate 5 sequential learning tasks. The first one should be "available", the rest "locked".
      Include a mix of 'lesson', 'practice', and 'quiz' types.
      
      You must assign a valid "action_url" from the following list that best matches the task:
      - /app/vocabulary (for learning new words)
      - /app/practice (for general practice)
      - /app/voice-practice (for pronunciation)
      - /app/stories (for reading comprehension)
      - /app/conversations (for roleplay)
      - /app/games/word-match (for vocabulary games)
      - /app/community (for social learning)
      - /app/idioms (for idioms/phrases)
      - /app/achievements (for quizzes/milestones)
      
      Return ONLY a JSON array with this structure:
      [
        {
          "title": "Task Title",
          "description": "Short description",
          "type": "lesson" | "practice" | "quiz",
          "status": "available" | "locked",
          "action_url": "one of the valid urls above"
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const items = JSON.parse(jsonStr) as {
      title: string;
      description: string;
      type: "lesson" | "practice" | "quiz";
      status: "available" | "locked";
      action_url: string;
    }[];

    // 3. Clear existing path (simple approach for MVP)
    await supabase.from("learning_path_items").delete().eq("user_id", user.id);

    // 4. Insert new items
    const rowsToInsert = items.map((item, index: number) => ({
      user_id: user.id,
      title: item.title,
      description: item.description,
      type: item.type,
      status: index === 0 ? "available" : "locked",
      order_index: index,
      action_url: item.action_url,
    }));

    const { data, error } = await supabase
      .from("learning_path_items")
      .insert(rowsToInsert)
      .select();

    if (error) throw error;
    return data as LearningPathItem[];
  } catch (error) {
    console.error("Error generating path, falling back to mock:", error);

    // Mock Fallback
    const mockItems: {
      title: string;
      description: string;
      type: "lesson" | "practice" | "quiz";
      status: "available" | "locked";
      action_url: string;
    }[] = [
      {
        title: "Vocabulary Expansion: Travel Essentials",
        description: "Learn key phrases for navigating airports and hotels.",
        type: "lesson",
        status: "available",
        action_url: "/app/vocabulary",
      },
      {
        title: "Pronunciation Practice: Th Sounds",
        description:
          "Master the tough 'th' sounds in words like 'this' and 'think'.",
        type: "practice",
        status: "locked",
        action_url: "/app/practice/pronunciation",
      },
      {
        title: "Grammar Quiz: Past Perfect",
        description:
          "Quick quiz to test your knowledge of the past perfect tense.",
        type: "quiz",
        status: "locked",
        action_url: "/app/achievements",
      }, // Redirect to achievements as placeholder
      {
        title: "Interactive Roleplay: Ordering Coffee",
        description: "Simulate a conversation at a cafe.",
        type: "practice",
        status: "locked",
        action_url: "/app/conversations",
      },
      {
        title: "Listening Comprehension: News",
        description: "Listen to a short news clip and answer questions.",
        type: "lesson",
        status: "locked",
        action_url: "/app/learn",
      },
    ];

    await supabase.from("learning_path_items").delete().eq("user_id", user.id);

    const rowsToInsert = mockItems.map((item, index: number) => ({
      user_id: user.id,
      title: item.title,
      description: item.description,
      type: item.type,
      status: index === 0 ? "available" : "locked",
      order_index: index,
      action_url: item.action_url,
    }));

    const { data } = await supabase
      .from("learning_path_items")
      .insert(rowsToInsert)
      .select();

    return data as LearningPathItem[];
  }
}

/**
 * Complete a path item and unlock the next one
 */
export async function completePathItem(itemId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // 1. Mark item as completed
  const { error: updateError } = await supabase
    .from("learning_path_items")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (updateError) return false;

  // 2. Find next item and unlock it
  // Get current item to find its order
  const { data: currentItem } = await supabase
    .from("learning_path_items")
    .select("order_index")
    .eq("id", itemId)
    .single();

  if (currentItem) {
    await supabase
      .from("learning_path_items")
      .update({ status: "available" })
      .eq("user_id", user.id)
      .eq("order_index", currentItem.order_index + 1);
  }

  return true;
}
