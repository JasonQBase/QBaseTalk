import { createClient } from "@/lib/supabase/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

export interface PronunciationRecording {
  id: string;
  user_id: string;
  text: string;
  audio_url: string;
  duration_seconds: number | null;
  ai_score: number | null;
  ai_feedback: AIFeedback | null;
  created_at: string;
}

export interface AIFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  pronunciation_tips: string[];
}

export interface PracticeSentence {
  id: string;
  text: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  phonetic: string;
}

// Practice sentences for different levels
export const PRACTICE_SENTENCES: PracticeSentence[] = [
  {
    id: "1",
    text: "Hello, how are you today?",
    difficulty: "Beginner",
    category: "Greetings",
    phonetic: "/həˈloʊ, haʊ ɑːr juː təˈdeɪ/",
  },
  {
    id: "2",
    text: "I would like to order a coffee, please.",
    difficulty: "Beginner",
    category: "Ordering",
    phonetic: "/aɪ wʊd laɪk tuː ˈɔːrdər ə ˈkɔːfi, pliːz/",
  },
  {
    id: "3",
    text: "The weather is beautiful this morning.",
    difficulty: "Beginner",
    category: "Small Talk",
    phonetic: "/ðə ˈweðər ɪz ˈbjuːtɪfəl ðɪs ˈmɔːrnɪŋ/",
  },
  {
    id: "4",
    text: "Could you please help me with this assignment?",
    difficulty: "Intermediate",
    category: "Requests",
    phonetic: "/kʊd juː pliːz help miː wɪð ðɪs əˈsaɪnmənt/",
  },
  {
    id: "5",
    text: "I'm particularly interested in learning about artificial intelligence.",
    difficulty: "Intermediate",
    category: "Technology",
    phonetic:
      "/aɪm pərˈtɪkjələrli ˈɪntrəstɪd ɪn ˈlɜːrnɪŋ əˈbaʊt ˌɑːrtɪˈfɪʃəl ɪnˈtelɪdʒəns/",
  },
  {
    id: "6",
    text: "The unprecedented technological advancements have revolutionized modern communication.",
    difficulty: "Advanced",
    category: "Technology",
    phonetic:
      "/ði ʌnˈpresɪdentɪd ˌteknəˈlɑːdʒɪkəl ədˈvænsmənt həv ˌrevəˈluːʃənaɪzd ˈmɑːdərn kəˌmjuːnɪˈkeɪʃən/",
  },
  {
    id: "7",
    text: "Notwithstanding the challenges, we persevered and achieved our objectives.",
    difficulty: "Advanced",
    category: "Formal",
    phonetic:
      "/ˌnɑːtwɪθˈstændɪŋ ðə ˈtʃælɪndʒɪz, wiː ˌpɜːrsɪˈvɪrd ənd əˈtʃiːvd aʊr əbˈdʒektɪvz/",
  },
];

/**
 * Save a pronunciation recording to Supabase Storage and database
 */
export async function saveRecording(
  text: string,
  audioBlob: Blob,
  durationSeconds?: number
): Promise<PronunciationRecording | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    // Upload audio to Supabase Storage
    const fileName = `${user.id}/${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from("pronunciation-recordings")
      .upload(fileName, audioBlob);

    if (uploadError) {
      console.error("Error uploading audio:", uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("pronunciation-recordings")
      .getPublicUrl(fileName);

    // Save recording metadata to database
    const { data, error } = await supabase
      .from("pronunciation_recordings")
      .insert({
        user_id: user.id,
        text,
        audio_url: urlData.publicUrl,
        duration_seconds: durationSeconds || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving recording to DB:", error);
      return null;
    }

    return data as PronunciationRecording;
  } catch (error) {
    console.error("Unexpected error in saveRecording:", error);
    return null;
  }
}

/**
 * Analyze pronunciation using Gemini AI
 * Note: This is a simplified version. In production, you'd want to use
 * speech-to-text API first to get the transcription, then compare with expected text
 */
export async function analyzeWithAI(
  recordingId: string,
  expectedText: string
): Promise<boolean> {
  const supabase = createClient();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As an expert English pronunciation coach, provide constructive feedback for a student practicing this sentence:

Sentence: "${expectedText}"

Analyze the pronunciation challenges typically associated with this sentence for learners.
Provide the output in the following strict JSON format:
{
  "overall": "A 2-3 sentence overall assessment of the pronunciation quality and intelligibility.",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"],
  "pronunciation_tips": ["Specific tip 1", "Specific tip 2", "Specific tip 3"],
  "score": 85
}

The score should be an integer between 60 and 100. Be encouraging but precise.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const feedback = parseAIFeedback(response);

    if (!feedback) {
      console.error("Failed to parse AI feedback, raw response:", response);
      return false;
    }

    // Update recording with AI feedback
    const { error } = await supabase
      .from("pronunciation_recordings")
      .update({
        ai_score: feedback.score,
        ai_feedback: {
          overall: feedback.overall,
          strengths: feedback.strengths,
          improvements: feedback.improvements,
          pronunciation_tips: feedback.pronunciation_tips,
        },
      })
      .eq("id", recordingId);

    if (error) {
      console.error("Error updating recording with AI feedback:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in analyzeWithAI:", error);
    return false;
  }
}

function parseAIFeedback(response: string): {
  overall: string;
  strengths: string[];
  improvements: string[];
  pronunciation_tips: string[]; // Changed from tips to match interface
  score: number;
} | null {
  try {
    // Clean the response to ensure it's valid JSON
    const cleanResponse = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleanResponse);

    // Validate stricture
    if (
      typeof parsed.overall === "string" &&
      Array.isArray(parsed.strengths) &&
      Array.isArray(parsed.improvements) &&
      (Array.isArray(parsed.pronunciation_tips) ||
        Array.isArray(parsed.tips)) &&
      typeof parsed.score === "number"
    ) {
      return {
        overall: parsed.overall,
        strengths: parsed.strengths,
        improvements: parsed.improvements,
        pronunciation_tips: parsed.pronunciation_tips || parsed.tips,
        score: parsed.score,
      };
    }
    return null;
  } catch (error) {
    console.error("Error parsing AI feedback:", error);
    return null;
  }
}

/**
 * Get recording history for the current user
 */
export async function getRecordingHistory(
  limit: number = 10
): Promise<PronunciationRecording[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("pronunciation_recordings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recording history:", error);
    return [];
  }

  return data as PronunciationRecording[];
}

/**
 * Get a single recording by ID
 */
export async function getRecording(
  recordingId: string
): Promise<PronunciationRecording | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pronunciation_recordings")
    .select("*")
    .eq("id", recordingId)
    .single();

  if (error) {
    console.error("Error fetching recording:", error);
    return null;
  }

  return data as PronunciationRecording;
}

/**
 * Delete a recording
 */
export async function deleteRecording(recordingId: string): Promise<boolean> {
  const supabase = createClient();

  // Get recording to find audio URL
  const recording = await getRecording(recordingId);
  if (!recording) return false;

  // Delete from storage
  const fileName = recording.audio_url.split("/").pop();
  if (fileName) {
    await supabase.storage.from("pronunciation-recordings").remove([fileName]);
  }

  // Delete from database
  const { error } = await supabase
    .from("pronunciation_recordings")
    .delete()
    .eq("id", recordingId);

  if (error) {
    console.error("Error deleting recording:", error);
    return false;
  }

  return true;
}
