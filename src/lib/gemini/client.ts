import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Export model instances
export const conversationalModel = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});
export const visionModel = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
});
