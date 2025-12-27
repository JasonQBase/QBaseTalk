export interface Course {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  category: string;
  duration: string;
  lessonsCount: number;
  image: string;
  instructor: {
    name: string;
    avatar: string;
  };
  rating: number;
  studentsEnrolled: number;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  lessons: LessonMeta[];
}

export interface LessonMeta {
  id: string;
  title: string;
  duration: string;
  type: "video" | "text" | "quiz";
}

export const courses: Course[] = [
  {
    id: "1",
    title: "English for Beginners",
    description:
      "Start your English learning journey with fundamental grammar and vocabulary.",
    level: "beginner",
    category: "General English",
    duration: "4 weeks",
    lessonsCount: 20,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    instructor: {
      name: "Sarah Johnson",
      avatar: "",
    },
    rating: 4.8,
    studentsEnrolled: 12453,
    modules: [
      {
        id: "m1",
        title: "Introduction & Basics",
        lessons: [
          {
            id: "l1",
            title: "The Alphabet & Pronunciation",
            duration: "10 min",
            type: "video",
          },
          {
            id: "l2",
            title: "Basic Greetings",
            duration: "8 min",
            type: "text",
          },
          {
            id: "l3",
            title: "Quiz: Introduction",
            duration: "5 min",
            type: "quiz",
          },
        ],
      },
      {
        id: "m2",
        title: "Simple Sentences",
        lessons: [
          {
            id: "l4",
            title: "Subject-Verb-Object",
            duration: "12 min",
            type: "video",
          },
          {
            id: "l5",
            title: "Common Verbs",
            duration: "10 min",
            type: "text",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Business English Mastery",
    description:
      "Master professional English for workplace communication and presentations.",
    level: "intermediate",
    category: "Business",
    duration: "6 weeks",
    lessonsCount: 30,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    instructor: {
      name: "Michael Chen",
      avatar: "",
    },
    rating: 4.9,
    studentsEnrolled: 8932,
    modules: [
      {
        id: "m1",
        title: "Professional Communication",
        lessons: [
          {
            id: "l1",
            title: "Email Writing Basics",
            duration: "15 min",
            type: "video",
          },
          {
            id: "l2",
            title: "Meeting Vocabulary",
            duration: "12 min",
            type: "text",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "IELTS Preparation",
    description:
      "Comprehensive IELTS preparation for all four sections: Reading, Writing, Listening, Speaking.",
    level: "advanced",
    category: "Test Preparation",
    duration: "8 weeks",
    lessonsCount: 40,
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    instructor: {
      name: "Emma Thompson",
      avatar: "",
    },
    rating: 4.95,
    studentsEnrolled: 15642,
    modules: [
      {
        id: "m1",
        title: "IELTS Reading Strategies",
        lessons: [
          {
            id: "l1",
            title: "Skimming and Scanning",
            duration: "20 min",
            type: "video",
          },
        ],
      },
    ],
  },
  {
    id: "4",
    title: "Conversational English",
    description:
      "Improve your speaking skills for everyday conversations and travel.",
    level: "intermediate",
    category: "Speaking",
    duration: "5 weeks",
    lessonsCount: 25,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    instructor: {
      name: "David Lee",
      avatar: "",
    },
    rating: 4.7,
    studentsEnrolled: 9821,
    modules: [
      {
        id: "m1",
        title: "Daily Conversations",
        lessons: [
          {
            id: "l1",
            title: "Ordering Food",
            duration: "10 min",
            type: "video",
          },
          {
            id: "l2",
            title: "Asking for Directions",
            duration: "8 min",
            type: "text",
          },
        ],
      },
    ],
  },
];
