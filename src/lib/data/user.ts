export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: "beginner" | "intermediate" | "advanced";
  goals: string[];
  streak: number;
  xp: number;
  joinedDate: string;
  studyTime: number; // in minutes
  coursesCompleted: number;
  progress: CourseProgress[];
  achievements: Achievement[];
  dailyGoal: number; // minutes per day
}

export interface CourseProgress {
  courseId: string;
  lastLessonId: string;
  percentage: number;
  completedLessons: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  locked: boolean;
}

export const mockUser: UserProfile = {
  id: "user-1",
  name: "Alex Nguyen",
  email: "alex.nguyen@example.com",
  avatar: "/images/avatars/user.jpg",
  level: "intermediate",
  goals: ["Business English", "Travel & Conversation", "Academic English"],
  streak: 7,
  xp: 2340,
  joinedDate: "2024-11-01",
  studyTime: 1850, // total study time in minutes
  coursesCompleted: 3,
  dailyGoal: 20,
  progress: [
    {
      courseId: "1",
      lastLessonId: "l2",
      percentage: 65,
      completedLessons: ["l1", "l2"],
    },
    {
      courseId: "2",
      lastLessonId: "l1",
      percentage: 30,
      completedLessons: ["l1"],
    },
  ],
  achievements: [
    {
      id: "a1",
      title: "First Steps",
      description: "Complete your first lesson",
      icon: "🎯",
      unlockedAt: "2024-11-02",
      locked: false,
    },
    {
      id: "a2",
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      unlockedAt: "2024-11-08",
      locked: false,
    },
    {
      id: "a3",
      title: "Fast Learner",
      description: "Complete a course in under 2 weeks",
      icon: "⚡",
      unlockedAt: "2024-11-15",
      locked: false,
    },
    {
      id: "a4",
      title: "Quiz Master",
      description: "Score 100% on 10 quizzes",
      icon: "🏆",
      locked: true,
    },
    {
      id: "a5",
      title: "Vocabulary Pro",
      description: "Learn 500 new words",
      icon: "📚",
      locked: true,
    },
    {
      id: "a6",
      title: "Speaking Star",
      description: "Complete 20 AI speaking sessions",
      icon: "🌟",
      locked: true,
    },
  ],
};

// Today's progress (for dashboard)
export const todayProgress = {
  minutesStudied: 15,
  goal: 20,
  xpEarned: 120,
  lessonsCompleted: 2,
};
