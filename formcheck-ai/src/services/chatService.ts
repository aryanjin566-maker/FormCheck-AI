import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function* streamChatPlan(history: ChatMessage[]) {
  const currentMessage = history[history.length - 1];
  const chatHistory = history.slice(0, -1).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const response = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents: [...chatHistory, { role: 'user', parts: [{ text: currentMessage.text }] }],
    config: {
      systemInstruction: `You are an elite virtual performance coach and nutritionist. 
      Your task is to generate comprehensive training plans (1 week, 6 months, or 12 months) and precision diet protocols.
      
      GUIDELINES:
      1. If the user asks for a plan, provide a highly detailed, professional structure.
      2. Include specific exercises, sets, reps, and objective goals.
      3. Provide a macro-nutrient breakdown and sample daily meal plans.
      4. Use structured formatting with headers and bold text for readability.
      5. Maintain a professional, elite athletic tone.
      6. If relevant, reference their recent exercises if they mention them (e.g. if they just did squats, adjust the leg day).`,
    },
  });
  

  for await (const chunk of response) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
