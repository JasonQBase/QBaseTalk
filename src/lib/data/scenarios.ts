export interface Objective {
  id: string;
  description: string;
  isCompleted: boolean;
}

export interface Scenario {
  id: string; // e.g. 'flight-booking'
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";

  // AI Persona
  aiRole: string; // "Travel Agent"
  aiName: string; // "Sarah"
  aiPersonality: string; // "Professional, helpful, speaks fast"

  // User Mission
  initialMessage: string;
  objectives: Objective[]; // 1. Greetings, 2. Ask for price, 3. Book flight
}

export const SCENARIOS: Scenario[] = [
  {
    id: "coffee_order",
    title: "Ordering Coffee",
    description: "Order a customized drink at a busy cafe.",
    difficulty: "Beginner",
    aiRole: "Barista",
    aiName: "Alex",
    aiPersonality: "Friendly, casual, asks follow-up questions",
    initialMessage: "Hi there! What can I get for you today?",
    objectives: [
      { id: "1", description: "Greet the barista", isCompleted: false },
      {
        id: "2",
        description: "Order a specific drink (e.g., Latte)",
        isCompleted: false,
      },
      {
        id: "3",
        description: "Ask for a modification (e.g., oat milk, less sugar)",
        isCompleted: false,
      },
      { id: "4", description: "Ask about the price", isCompleted: false },
    ],
  },
  {
    id: "job_interview",
    title: "Job Interview",
    description:
      "Practice answering common interview questions professionally.",
    difficulty: "Advanced",
    aiRole: "HR Manager",
    aiName: "Sarah",
    aiPersonality: "Professional, evaluative, asks probing questions",
    initialMessage:
      "Good morning! Please tell me about yourself and why you're interested in this position.",
    objectives: [
      {
        id: "1",
        description: "Introduce yourself professionally",
        isCompleted: false,
      },
      {
        id: "2",
        description: "Explain your relevant experience",
        isCompleted: false,
      },
      { id: "3", description: "Discuss your strengths", isCompleted: false },
      {
        id: "4",
        description: "Ask questions about the role",
        isCompleted: false,
      },
    ],
  },
  {
    id: "doctor_appointment",
    title: "Doctor's Appointment",
    description: "Describe symptoms and discuss health concerns with a doctor.",
    difficulty: "Intermediate",
    aiRole: "Doctor",
    aiName: "Dr. Martinez",
    aiPersonality: "Caring, patient, asks detailed health questions",
    initialMessage: "Hello! Please have a seat. What brings you in today?",
    objectives: [
      {
        id: "1",
        description: "Describe your main symptom",
        isCompleted: false,
      },
      {
        id: "2",
        description: "Answer questions about when it started",
        isCompleted: false,
      },
      {
        id: "3",
        description: "Understand the diagnosis or advice",
        isCompleted: false,
      },
      {
        id: "4",
        description: "Ask about treatment options",
        isCompleted: false,
      },
    ],
  },
  {
    id: "hotel_checkin",
    title: "Hotel Check-In",
    description: "Check into a hotel and discuss room preferences.",
    difficulty: "Beginner",
    aiRole: "Hotel Receptionist",
    aiName: "Emily",
    aiPersonality: "Welcoming, helpful, detail-oriented",
    initialMessage:
      "Welcome to Grand Plaza Hotel! Do you have a reservation with us?",
    objectives: [
      { id: "1", description: "Confirm your reservation", isCompleted: false },
      { id: "2", description: "Provide identification", isCompleted: false },
      { id: "3", description: "Ask about breakfast times", isCompleted: false },
      {
        id: "4",
        description: "Request a room preference (view, floor)",
        isCompleted: false,
      },
    ],
  },
  {
    id: "airport_navigation",
    title: "Airport Navigation",
    description: "Get help finding your gate and handling airport situations.",
    difficulty: "Intermediate",
    aiRole: "Airport Staff",
    aiName: "James",
    aiPersonality: "Efficient, helpful, knowledgeable about procedures",
    initialMessage: "Hello! Can I help you find something?",
    objectives: [
      { id: "1", description: "Ask for gate information", isCompleted: false },
      {
        id: "2",
        description: "Inquire about boarding time",
        isCompleted: false,
      },
      { id: "3", description: "Ask about baggage claim", isCompleted: false },
      {
        id: "4",
        description: "Request directions to amenities",
        isCompleted: false,
      },
    ],
  },
  {
    id: "restaurant_order",
    title: "Restaurant Dining",
    description: "Order a meal, ask about ingredients, and request the bill.",
    difficulty: "Beginner",
    aiRole: "Waiter",
    aiName: "Michael",
    aiPersonality: "Polite, attentive, knowledgeable about menu",
    initialMessage:
      "Good evening! I'm Michael and I'll be your server tonight. Can I start you off with something to drink?",
    objectives: [
      { id: "1", description: "Order drinks", isCompleted: false },
      {
        id: "2",
        description: "Ask about menu items or recommendations",
        isCompleted: false,
      },
      { id: "3", description: "Place your meal order", isCompleted: false },
      { id: "4", description: "Request the bill", isCompleted: false },
    ],
  },
  {
    id: "clothes_shopping",
    title: "Shopping for Clothes",
    description:
      "Ask about sizes, try on items, and make purchasing decisions.",
    difficulty: "Beginner",
    aiRole: "Sales Associate",
    aiName: "Lisa",
    aiPersonality: "Friendly, fashion-conscious, eager to help",
    initialMessage:
      "Hi! Welcome to Fashion Street. Are you looking for anything specific today?",
    objectives: [
      {
        id: "1",
        description: "Explain what you're looking for",
        isCompleted: false,
      },
      { id: "2", description: "Ask about sizes and fit", isCompleted: false },
      {
        id: "3",
        description: "Request to try something on",
        isCompleted: false,
      },
      {
        id: "4",
        description: "Inquire about returns policy",
        isCompleted: false,
      },
    ],
  },
  {
    id: "making_friends",
    title: "Making New Friends",
    description: "Start a conversation and build rapport with someone new.",
    difficulty: "Intermediate",
    aiRole: "New Acquaintance",
    aiName: "Chris",
    aiPersonality: "Friendly, curious, shares interests",
    initialMessage:
      "Hey! I haven't seen you around here before. Are you new to the area?",
    objectives: [
      { id: "1", description: "Introduce yourself", isCompleted: false },
      {
        id: "2",
        description: "Share something about yourself",
        isCompleted: false,
      },
      { id: "3", description: "Ask about their interests", isCompleted: false },
      { id: "4", description: "Suggest meeting again", isCompleted: false },
    ],
  },
  {
    id: "customer_service_call",
    title: "Customer Service Call",
    description: "Report an issue and seek resolution over the phone.",
    difficulty: "Advanced",
    aiRole: "Customer Service Rep",
    aiName: "Patricia",
    aiPersonality: "Patient, solution-oriented, follows procedures",
    initialMessage:
      "Thank you for calling TechSupport. My name is Patricia. How can I assist you today?",
    objectives: [
      {
        id: "1",
        description: "Explain the problem clearly",
        isCompleted: false,
      },
      {
        id: "2",
        description: "Provide account or order details",
        isCompleted: false,
      },
      {
        id: "3",
        description: "Follow troubleshooting steps",
        isCompleted: false,
      },
      { id: "4", description: "Confirm the resolution", isCompleted: false },
    ],
  },
  {
    id: "asking_directions",
    title: "Asking for Directions",
    description: "Navigate a city by asking locals for directions.",
    difficulty: "Beginner",
    aiRole: "Local Resident",
    aiName: "Tom",
    aiPersonality: "Helpful, knows the area well, gives clear directions",
    initialMessage:
      "Hey there! You look a bit lost. Can I help you find something?",
    objectives: [
      {
        id: "1",
        description: "Politely ask for directions",
        isCompleted: false,
      },
      { id: "2", description: "Clarify the directions", isCompleted: false },
      { id: "3", description: "Ask about landmarks", isCompleted: false },
      { id: "4", description: "Thank them for help", isCompleted: false },
    ],
  },
  {
    id: "business_meeting",
    title: "Business Meeting",
    description: "Participate in a professional business discussion.",
    difficulty: "Advanced",
    aiRole: "Business Partner",
    aiName: "Jennifer",
    aiPersonality: "Professional, direct, focused on results",
    initialMessage:
      "Good morning! Thank you for meeting with me. Shall we discuss the project timeline?",
    objectives: [
      {
        id: "1",
        description: "Present your ideas clearly",
        isCompleted: false,
      },
      { id: "2", description: "Ask clarifying questions", isCompleted: false },
      { id: "3", description: "Negotiate or compromise", isCompleted: false },
      { id: "4", description: "Summarize action items", isCompleted: false },
    ],
  },
];
