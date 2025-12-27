import { createClient } from "@/lib/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

// Matches frontend usage but maps to DB schema
export interface Story {
  id: string; // Use string to be compatible with useParams, convert when needed
  title: string;
  content: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  word_count?: number;
  questions: ComprehensionQuestion[] | null;
  created_at: string;

  // Progress
  completed?: boolean;
  best_score?: number;
  last_read_at?: string;

  // Extra
  image_url?: string;
  audio_url?: string;

  // UI legacy fields
  topic?: string | null;
}

export interface StoryVocabulary {
  id: string; // string or number
  story_id: string;
  word: string;
  definition: string;
  context?: string;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correct_answer: number;
}

export interface GeneratedStory {
  title: string;
  content: string;
  word_count: number;
  vocabulary: Array<{
    word: string;
    definition: string;
    context: string;
  }>;
  questions: ComprehensionQuestion[];
}

/**
 * Generate a new story using Gemini AI
 */
export async function generateStory(
  difficulty: "Beginner" | "Intermediate" | "Advanced",
  topic?: string
): Promise<Story | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create prompt based on difficulty
    const wordCountMap = {
      Beginner: "150-200",
      Intermediate: "250-350",
      Advanced: "400-500",
    };

    const vocabularyLevelMap = {
      Beginner: "simple, everyday vocabulary (A1-A2 CEFR level)",
      Intermediate:
        "moderate vocabulary with some idiomatic expressions (B1-B2 CEFR level)",
      Advanced:
        "sophisticated vocabulary and complex sentence structures (C1-C2 CEFR level)",
    };

    const topicPrompt = topic ? `about ${topic}` : "on any interesting topic";

    const prompt = `Generate an engaging English story ${topicPrompt} for ${difficulty} level learners.

Requirements:
- Word count: ${wordCountMap[difficulty]} words
- Use ${vocabularyLevelMap[difficulty]}
- Make it interesting and educational
- Include dialogue if appropriate
- Use present or past tense (be consistent)

Please format your response EXACTLY as follows (do not add any extra text):

TITLE: [Story title]

STORY:
[The complete story text]

VOCABULARY: (List 5-8 important words)
word1 | definition | example sentence from story
word2 | definition | example sentence from story
...

QUESTIONS: (Create 3-4 comprehension questions)
Q: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
CORRECT: [A, B, C, or D]
---
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse the AI response
    const parsed = parseStoryResponse(response);

    if (!parsed) {
      console.error("Failed to parse AI response");
      return null;
    }

    // Save story to database
    const { data: story, error } = await supabase
      .from("stories")
      .insert({
        title: parsed.title,
        content: parsed.content,
        difficulty,
        category: topic || "General", // Use category for topic for now
        questions: parsed.questions,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving story:", error);
      return null;
    }

    // Save vocabulary
    if (parsed.vocabulary.length > 0) {
      const vocabData = parsed.vocabulary.map((v) => ({
        story_id: story.id,
        word: v.word,
        definition: v.definition,
        context: v.context,
      }));

      await supabase.from("story_vocabulary").insert(vocabData);
    }

    // Return mapped story object
    return {
      id: String(story.id),
      title: story.title,
      content: story.content,
      difficulty: story.difficulty,
      category: story.category,
      topic: story.category,
      questions: story.questions as unknown as ComprehensionQuestion[],
      created_at: story.created_at,
      completed: false,
    };
  } catch (error) {
    console.error("Error generating story:", error);
    return null;
  }
}

/**
 * Parse the AI response into structured data
 */
function parseStoryResponse(response: string): GeneratedStory | null {
  try {
    const titleMatch = response.match(/TITLE:\s*(.+)/);
    const storyMatch = response.match(/STORY:\s*([\s\S]+?)(?=VOCABULARY:|$)/);
    const vocabMatch = response.match(
      /VOCABULARY:[\s\S]*?([\s\S]+?)(?=QUESTIONS:|$)/
    );
    const questionsMatch = response.match(/QUESTIONS:[\s\S]*?([\s\S]+?)$/);

    if (!titleMatch || !storyMatch) {
      return null;
    }

    const title = titleMatch[1].trim();
    const content = storyMatch[1].trim();
    const word_count = content.split(/\s+/).length;

    // Parse vocabulary
    const vocabulary: Array<{
      word: string;
      definition: string;
      context: string;
    }> = [];
    if (vocabMatch && vocabMatch[1]) {
      const vocabLines = vocabMatch[1].trim().split("\n");
      for (const line of vocabLines) {
        const parts = line.split("|").map((s) => s.trim());
        if (parts.length === 3) {
          vocabulary.push({
            word: parts[0],
            definition: parts[1],
            context: parts[2],
          });
        }
      }
    }

    // Parse questions
    const questions: ComprehensionQuestion[] = [];
    if (questionsMatch && questionsMatch[1]) {
      const questionBlocks = questionsMatch[1]
        .split("---")
        .filter((b) => b.trim());

      for (const block of questionBlocks) {
        const qMatch = block.match(/Q:\s*(.+)/);
        const optionMatches = block.match(/[A-D]\)\s*(.+)/g);
        const correctMatch = block.match(/CORRECT:\s*([A-D])/);

        if (
          qMatch &&
          optionMatches &&
          correctMatch &&
          optionMatches.length >= 3
        ) {
          const options = optionMatches.map((opt) =>
            opt.replace(/[A-D]\)\s*/, "").trim()
          );
          const correctLetter = correctMatch[1];
          const correctIndex = correctLetter.charCodeAt(0) - "A".charCodeAt(0);

          questions.push({
            question: qMatch[1].trim(),
            options,
            correct_answer: correctIndex,
          });
        }
      }
    }

    return { title, content, word_count, vocabulary, questions };
  } catch (error) {
    console.error("Error parsing story response:", error);
    return null;
  }
}

/**
 * Get all stories available
 */
export async function getStories(): Promise<Story[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data as any[]).map((s) => ({
      id: String(s.id),
      title: s.title,
      content: s.content,
      difficulty: s.difficulty,
      category: s.category,
      topic: s.category,
      questions: s.questions,
      created_at: s.created_at,
      image_url: s.image_url,
      audio_url: s.audio_url,
      completed: false,
      word_count: s.content.length / 5, // Approx if not stored
    }));
  }

  // Fetch stories with user progress
  const { data, error } = await supabase
    .from("stories")
    .select(
      `
      *,
      user_story_progress(
         completed,
         best_score,
         last_read_at
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stories:", error);
    return [];
  }

  return (data as any[]).map((item) => ({
    id: String(item.id),
    title: item.title,
    content: item.content,
    difficulty: item.difficulty,
    category: item.category,
    topic: item.category,
    questions: item.questions,
    created_at: item.created_at,
    image_url: item.image_url,
    audio_url: item.audio_url,

    completed: item.user_story_progress?.[0]?.completed || false,
    best_score: item.user_story_progress?.[0]?.best_score || 0,
    last_read_at: item.user_story_progress?.[0]?.last_read_at,
    word_count: item.content.split(/\s+/).length, // Approx
  }));
}

/**
 * Get a single story by ID
 */
export async function getStory(storyId: string): Promise<Story | null> {
  const supabase = createClient();

  const query = supabase
    .from("stories")
    .select(
      `
      *,
      user_story_progress(
         completed,
         best_score,
         last_read_at
      )
    `
    )
    .eq("id", storyId); // Postgres will usually auto-cast string number to bigint

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching story:", error);
    return null;
  }

  return {
    id: String(data.id),
    title: data.title,
    content: data.content,
    difficulty: data.difficulty,
    category: data.category,
    topic: data.category,
    questions: data.questions,
    created_at: data.created_at,
    image_url: data.image_url,
    audio_url: data.audio_url,

    completed: data.user_story_progress?.[0]?.completed || false,
    best_score: data.user_story_progress?.[0]?.best_score || 0,
    last_read_at: data.user_story_progress?.[0]?.last_read_at,
  };
}

/**
 * Get vocabulary for a story
 */
export async function getStoryVocabulary(
  storyId: string
): Promise<StoryVocabulary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("story_vocabulary")
    .select("*")
    .eq("story_id", storyId);

  if (error) {
    console.error("Error fetching vocabulary:", error);
    return [];
  }

  return (data as any[]).map((item) => ({
    ...item,
    id: String(item.id),
    story_id: String(item.story_id),
  }));
}

/**
 * Submit comprehension quiz answers
 */
export async function submitComprehension(
  storyId: string,
  score: number
): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Upsert progress
  const { error } = await supabase.from("user_story_progress").upsert(
    {
      user_id: user.id,
      story_id: storyId, // Auto-cast
      completed: true,
      best_score: score,
      last_read_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id, story_id",
    }
  );

  if (error) {
    console.error("Error updating story progress:", error);
    return false;
  }

  // Award XP
  const xpEarned = score >= 70 ? 150 : 75;

  // 1. Log History
  await supabase.from("xp_history").insert({
    user_id: user.id,
    amount: xpEarned,
    source: "story",
    details: `Completed story ${storyId} with score ${score}%`,
  });

  // 2. Update Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", user.id)
    .single();

  if (profile) {
    await supabase
      .from("profiles")
      .update({
        xp: (profile.xp || 0) + xpEarned,
        last_activity_date: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  return true;
}
