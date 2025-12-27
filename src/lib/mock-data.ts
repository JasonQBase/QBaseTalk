export const MOCK_USER = {
  id: "u1",
  name: "Jason",
  avatar: "https://i.pravatar.cc/150?u=jason",
  level: "Intermediate",
  streak: 12,
  xp: 1450,
  goals: ["Travel", "Business"],
};

export const MOCK_COURSES = [
  {
    id: "c1",
    title: "Business English Mastery",
    description:
      "Master the language of international business. Emails, meetings, and negotiations.",
    level: "Advanced",
    thumbnail:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    progress: 45,
    lessonsCount: 12,
    rating: 4.8,
  },
  {
    id: "c2",
    title: "Travel Survival Kit",
    description: "Essential phrases and vocabulary for your next trip abroad.",
    level: "Beginner",
    thumbnail:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
    progress: 10,
    lessonsCount: 8,
    rating: 4.9,
  },
  {
    id: "c3",
    title: "Tech Talk: Silicon Valley",
    description:
      "Learn the latest tech terminology and slang used in the industry.",
    level: "Intermediate",
    thumbnail:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    progress: 0,
    lessonsCount: 15,
    rating: 4.7,
  },
];

export const MOCK_LESSONS = [
  {
    id: "l1",
    courseId: "c1",
    title: "The Art of Negotiation",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
    duration: "10:25",
    transcript: [
      { time: "00:00", text: "Welcome to this lesson on negotiation." },
      { time: "00:05", text: "Today we will learn how to close a deal." },
      { time: "00:10", text: "First, let's talk about preparation." },
    ],
    vocabulary: [
      {
        word: "Negotiation",
        definition: "Discussion aimed at reaching an agreement.",
      },
      {
        word: "Compromise",
        definition: "An agreement reached by each side making concessions.",
      },
    ],
  },
];

export const MOCK_PRACTICE_SCENARIOS = [
  {
    id: "p1",
    title: "Ordering Coffee",
    description: "Practice ordering your favorite drink at a busy cafe.",
    difficulty: "Easy",
    persona: {
      name: "Sarah",
      role: "Barista",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    initialPrompt: "Hi there! What can I get for you today?",
  },
  {
    id: "p2",
    title: "Job Interview",
    description:
      "Answer common interview questions for a software engineer role.",
    difficulty: "Hard",
    persona: {
      name: "Mr. Smith",
      role: "Hiring Manager",
      avatar: "https://i.pravatar.cc/150?u=smith",
    },
    initialPrompt: "Tell me a little bit about yourself and your experience.",
  },
];
