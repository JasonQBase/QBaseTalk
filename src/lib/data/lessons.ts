export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  type: "video" | "text" | "quiz";
  duration: string;
  content: VideoContent | TextContent | QuizContent;
}

export interface VideoContent {
  type: "video";
  videoUrl: string;
  transcript: string;
  vocabulary: VocabularyItem[];
}

export interface TextContent {
  type: "text";
  body: string;
  vocabulary: VocabularyItem[];
}

export interface QuizContent {
  type: "quiz";
  questions: QuizQuestion[];
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

export const lessons: Lesson[] = [
  {
    id: "l1",
    courseId: "1",
    moduleId: "m1",
    title: "The Alphabet & Pronunciation",
    type: "video",
    duration: "10 min",
    content: {
      type: "video",
      videoUrl: "https://example.com/video/alphabet.mp4",
      transcript:
        "Welcome to your first lesson! Today we'll learn the English alphabet and how to pronounce each letter correctly...",
      vocabulary: [
        {
          word: "alphabet",
          definition: "The set of letters used in a language",
          example: "The English alphabet has 26 letters.",
        },
        {
          word: "pronunciation",
          definition: "The way a word is spoken",
          example: "Good pronunciation is important for communication.",
        },
      ],
    },
  },
  {
    id: "l2",
    courseId: "1",
    moduleId: "m1",
    title: "Basic Greetings",
    type: "text",
    duration: "8 min",
    content: {
      type: "text",
      body: `# Basic Greetings in English

## Formal Greetings
- Good morning
- Good afternoon
- Good evening
- How do you do?

## Informal Greetings
- Hi!
- Hey!
- What's up?
- How's it going?

## Responses
When someone greets you, you can respond with:
- I'm fine, thank you. And you?
- I'm doing great!
- Not bad, thanks.

Practice these greetings every day to become more comfortable!`,
      vocabulary: [
        {
          word: "greeting",
          definition: "A polite word or phrase used when meeting someone",
          example: "Hello is a common greeting.",
        },
        {
          word: "formal",
          definition: "Official or serious in style",
          example: "Use formal language in business meetings.",
        },
      ],
    },
  },
  {
    id: "l3",
    courseId: "1",
    moduleId: "m1",
    title: "Quiz: Introduction",
    type: "quiz",
    duration: "5 min",
    content: {
      type: "quiz",
      questions: [
        {
          id: "q1",
          question: "How many letters are in the English alphabet?",
          options: ["24", "26", "28", "30"],
          correctAnswer: 1,
          explanation: "The English alphabet has 26 letters from A to Z.",
        },
        {
          id: "q2",
          question: 'What is an informal way to say "Hello"?',
          options: ["Good morning", "How do you do", "Hey", "Good afternoon"],
          correctAnswer: 2,
          explanation: '"Hey" is a casual, informal greeting.',
        },
        {
          id: "q3",
          question: "Which greeting is most formal?",
          options: ["What's up?", "Hi!", "How do you do?", "Hey!"],
          correctAnswer: 2,
          explanation: '"How do you do?" is the most formal greeting option.',
        },
      ],
    },
  },
];
