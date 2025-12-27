import { Scenario, Objective } from "../data/scenarios";
import { conversationalModel } from "./client";

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{ speaker: string; message: string }>,
  scenario: Scenario
) {
  try {
    const prompt = `You are ${scenario.aiName}, a ${scenario.aiRole} in a ${scenario.title} scenario.
    
    Your Personality: ${scenario.aiPersonality}
    Scenario Description: ${scenario.description}

    The student has the following objectives to complete (do not explicitly list them, but guide the conversation naturally so they have a chance to fulfill them):
    ${scenario.objectives.map((obj) => `- ${obj.description}`).join("\n")}

    Context:
    - You are helpful but act essentially as the role defined above.
    - Correct major grammar mistakes ONLY if they impede understanding, otherwise focus on the roleplay.
    - Keep your responses concise (1-3 sentences) to maintain a natural pace.
    - Ask relevant follow-up questions to encourage the student to speak more.

    Previous conversation history:
    ${conversationHistory.map((h) => `${h.speaker}: ${h.message}`).join("\n")}

    Student just said: "${userMessage}"

    Respond as ${scenario.aiName}:`;

    const result = await conversationalModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm having a little trouble connecting right now. Can you say that again?";
  }
}

export async function detectErrors(userMessage: string) {
  try {
    const prompt = `Analyze the following English sentence spoken by a student for grammatical, vocabulary, or naturalness errors.

    Sentence: "${userMessage}"

    If there are no errors, return valid JSON:
    { "hasError": false, "correction": null }

    If there are errors, return valid JSON:
    {
      "hasError": true,
      "correction": "The corrected sentence",
      "explanation": "Brief explanation of the error"
    }

    Return ONLY the JSON.`;

    const result = await conversationalModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown code blocks
    const cleanJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error detecting errors:", error);
    return { hasError: false, correction: null };
  }
}

export async function generateSuggestions(
  conversationContext: Array<{ speaker: string; message: string }>,
  lastAIMessage: string
) {
  try {
    const prompt = `Based on the conversation so far, suggest 3 quick, natural responses the student could say next.

    Last AI message: "${lastAIMessage}"
    
    Requirements:
    - Returns strictly a JSON array of strings.
    - Example: ["Yes, I agree.", "Could you explain more?", "I'm not sure."]
    - No markdown formatting.

    Suggest 3 responses:`;

    const result = await conversationalModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return ["Yes, please.", "I understand.", "Can you repeat that?"];
  }
}

export async function checkMissionObjectives(
  conversationHistory: Array<{ speaker: string; message: string }>,
  objectives: Objective[]
) {
  try {
    const prompt = `Analyze the conversation history and determine which of the following objectives have been COMPLETED by the student (user).
    
    Objectives:
    ${objectives.map((obj) => `- [${obj.id}] ${obj.description}`).join("\n")}

    Conversation History:
    ${conversationHistory.map((h) => `${h.speaker}: ${h.message}`).join("\n")}

    Instructions:
    - An objective is completed if the student has clearly performed the action or elicited the information.
    - Return a JSON array of objective IDs that are completed.
    - Example: ["1", "3"]
    - If none, return [].
    - ONLY return JSON.`;

    const result = await conversationalModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown code blocks
    const cleanJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanJson) as string[];
  } catch (error) {
    console.error("Error checking objectives:", error);
    return [];
  }
}
