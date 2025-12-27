import { createClient } from "@/lib/supabase/client";

// Database types
interface DbLessonProgress {
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at: string;
  time_spent: number;
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number;
}

export async function markLessonComplete(
  courseId: string,
  lessonId: string
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return;
  }

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
      time_spent: 0,
    },
    {
      onConflict: "user_id,course_id,lesson_id",
    }
  );

  if (error) {
    console.error("Failed to mark lesson complete:", error);
  }
}

export async function getLessonProgress(
  courseId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("lesson_id", lessonId)
    .single();

  if (error) {
    return null;
  }

  return {
    lessonId: data.lesson_id,
    courseId: data.course_id,
    completed: data.completed,
    completedAt: data.completed_at,
    timeSpent: data.time_spent,
  };
}

export async function getCourseProgress(
  courseId: string
): Promise<LessonProgress[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  if (error) {
    console.error("Failed to fetch course progress:", error);
    return [];
  }

  return data.map((item: DbLessonProgress) => ({
    lessonId: item.lesson_id,
    courseId: item.course_id,
    completed: item.completed,
    completedAt: item.completed_at,
    timeSpent: item.time_spent,
  }));
}

export async function saveQuizResult(
  quizId: string,
  score: number,
  passed: boolean,
  answers: Record<string, string | number | boolean>
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return;
  }

  const { error } = await supabase.from("quiz_results").insert({
    user_id: user.id,
    quiz_id: quizId,
    score,
    passed,
    answers,
  });

  if (error) {
    console.error("Failed to save quiz result:", error);
  }
}
