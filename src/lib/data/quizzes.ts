export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  timeLimit?: number; // in seconds
}

export const quizzes: Quiz[] = [
  {
    id: "quiz-1",
    courseId: "1",
    lessonId: "l3",
    title: "Introduction Quiz",
    passingScore: 70,
    questions: [
      {
        id: "q1",
        question: "How many letters are in the English alphabet?",
        options: ["24", "25", "26", "27"],
        correctAnswer: 2,
        explanation: "The English alphabet has 26 letters from A to Z.",
        points: 10,
      },
      {
        id: "q2",
        question: "Which of these is a correct greeting?",
        options: [
          "Goodbye morning",
          "Good morning",
          "Morning good",
          "Well morning",
        ],
        correctAnswer: 1,
        explanation:
          "'Good morning' is the standard way to greet someone in the morning.",
        points: 10,
      },
      {
        id: "q3",
        question: "What does 'Hello' mean?",
        options: ["Goodbye", "A greeting", "Thank you", "Please"],
        correctAnswer: 1,
        explanation:
          "'Hello' is a common greeting used to acknowledge someone.",
        points: 10,
      },
      {
        id: "q4",
        question: "Which word is a pronoun?",
        options: ["Run", "Happy", "I", "Book"],
        correctAnswer: 2,
        explanation: "'I' is a pronoun used to refer to oneself.",
        points: 10,
      },
      {
        id: "q5",
        question: "How do you spell the number 'ten'?",
        options: ["T-I-N", "T-E-N", "T-A-N", "T-U-N"],
        correctAnswer: 1,
        explanation: "The number 10 is spelled T-E-N.",
        points: 10,
      },
    ],
  },
  {
    id: "quiz-2",
    courseId: "2",
    lessonId: "l2",
    title: "Professional Communication Quiz",
    passingScore: 80,
    questions: [
      {
        id: "q1",
        question:
          "What is the appropriate way to start a formal business email?",
        options: ["Hey there!", "Dear Sir/Madam,", "Yo!", "What's up?"],
        correctAnswer: 1,
        explanation:
          "'Dear Sir/Madam' is the standard formal greeting in business emails.",
        points: 20,
      },
      {
        id: "q2",
        question: "Which phrase is best for ending a meeting?",
        options: [
          "Let's wrap this up",
          "Thank you all for your time and contributions",
          "We're done here",
          "See ya later",
        ],
        correctAnswer: 1,
        explanation:
          "A formal, appreciative closing is most professional in business settings.",
        points: 20,
      },
      {
        id: "q3",
        question: "What does 'FYI' stand for?",
        options: [
          "For Your Interest",
          "For Your Information",
          "For You Immediately",
          "Find Your Information",
        ],
        correctAnswer: 1,
        explanation:
          "FYI is a common business abbreviation meaning 'For Your Information'.",
        points: 20,
      },
    ],
  },
  {
    id: "quiz-3",
    courseId: "3",
    lessonId: "l1",
    title: "IELTS Reading Strategies Quiz",
    passingScore: 75,
    questions: [
      {
        id: "q1",
        question: "What is 'skimming' in reading?",
        options: [
          "Reading every word carefully",
          "Quickly reading to get the main idea",
          "Highlighting important words",
          "Reading backwards",
        ],
        correctAnswer: 1,
        explanation:
          "Skimming is a technique to quickly grasp the main idea of a text.",
        points: 15,
      },
      {
        id: "q2",
        question: "What is 'scanning' used for?",
        options: [
          "Understanding the overall theme",
          "Finding specific information quickly",
          "Memorizing the text",
          "Translating words",
        ],
        correctAnswer: 1,
        explanation:
          "Scanning helps you locate specific details or keywords in a text quickly.",
        points: 15,
      },
      {
        id: "q3",
        question: "In IELTS Reading, how long do you have for the test?",
        options: ["30 minutes", "45 minutes", "60 minutes", "90 minutes"],
        correctAnswer: 2,
        explanation: "IELTS Reading test is 60 minutes long with 40 questions.",
        points: 15,
      },
      {
        id: "q4",
        question: "What should you do if you don't know an answer?",
        options: [
          "Leave it blank",
          "Make an educated guess",
          "Write 'I don't know'",
          "Skip to the next section",
        ],
        correctAnswer: 1,
        explanation:
          "In IELTS, there's no penalty for wrong answers, so always guess if unsure.",
        points: 15,
      },
    ],
  },
];

// Function to get quiz by lesson ID
export function getQuizByLessonId(lessonId: string): Quiz | undefined {
  return quizzes.find((quiz) => quiz.lessonId === lessonId);
}

// Function to get quiz by ID
export function getQuizById(quizId: string): Quiz | undefined {
  return quizzes.find((quiz) => quiz.id === quizId);
}
