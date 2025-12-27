import { createClient } from "@/lib/supabase/client";
import { courses as MOCK_COURSES } from "@/lib/data/courses";

// Database types
interface DbCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  image_url: string;
  lessons_count: number;
}

interface DbEnrollment {
  course_id: string;
}

interface DbProgress {
  course_id: string;
  completed: boolean;
}

interface DbLesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  duration: number;
  type: string;
  content: unknown;
}

export type CourseWithProgress = {
  id: string;
  title: string;
  description: string;
  level: string;
  image: string;
  lessonsCount: number;
  rating: number;
  studentsEnrolled: number;
  category: string;
  progress: number;
  isEnrolled: boolean;
};

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  duration: number;
  type: string;
  content: unknown;
}

export async function getCoursesWithProgress(): Promise<CourseWithProgress[]> {
  const supabase = createClient();

  // Real Supabase mode
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all courses from DB
  const { data: dbCourses, error } = await supabase.from("courses").select("*");

  if (error || !dbCourses || dbCourses.length === 0) {
    // Fallback to mock courses if DB is empty or error
    // console.log('Using mock courses');
    return MOCK_COURSES.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      image: c.image,
      level: c.level,
      lessonsCount: c.lessonsCount,
      rating: c.rating,
      studentsEnrolled: c.studentsEnrolled,
      category: c.category,
      progress: 0,
      isEnrolled: false,
    }));
  }

  // Map DB courses to CourseWithProgress type
  const allCourses: CourseWithProgress[] = dbCourses.map((c: DbCourse) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    image: c.image_url,
    level: c.level,
    lessonsCount: c.lessons_count,
    rating: 4.8,
    studentsEnrolled: 1200,
    category: "General English",
    progress: 0,
    isEnrolled: false,
  }));

  if (!user) {
    return allCourses;
  }

  // Fetch enrollments and progress
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id);

  const { data: progressData } = await supabase
    .from("lesson_progress")
    .select("course_id, completed")
    .eq("user_id", user.id)
    .eq("completed", true);

  const enrolledCourseIds = new Set(
    enrollments?.map((e: DbEnrollment) => e.course_id) || []
  );

  // Calculate progress for each course
  return allCourses.map((course) => {
    const courseProgress =
      progressData?.filter((p: DbProgress) => p.course_id === course.id) || [];
    const completedLessons = courseProgress.length;
    const totalLessons = course.lessonsCount || 1;
    const progressPercentage = Math.round(
      (completedLessons / totalLessons) * 100
    );

    return {
      ...course,
      progress: enrolledCourseIds.has(course.id) ? progressPercentage : 0,
      isEnrolled: enrolledCourseIds.has(course.id),
    };
  });
}

export async function getEnrolledCourses(): Promise<CourseWithProgress[]> {
  const allCourses = await getCoursesWithProgress();
  return allCourses.filter((c) => c.isEnrolled);
}

export async function enrollInCourse(courseId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("enrollments")
    .insert({ user_id: user.id, course_id: courseId });
}

export async function isEnrolled(courseId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  return !!data;
}

export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (error || !data) {
    return null;
  }

  const lesson = data as DbLesson;
  return {
    id: lesson.id,
    courseId: lesson.course_id,
    title: lesson.title,
    description: lesson.description,
    orderIndex: lesson.order_index,
    duration: lesson.duration,
    type: lesson.type,
    content: lesson.content,
  };
}
