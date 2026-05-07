import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ExerciseAnalysis {
  exerciseName: string;
  count: string; // "12 reps" or "30 seconds"
  isCorrect: boolean;
  score: number; // 0-100
  feedback: string;
  tips: string[];
  correctFormExplanation?: string;
}

export async function analyzeExerciseVideo(file: File): Promise<ExerciseAnalysis> {
  const base64Data = await fileToBase64(file);
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `You are an elite fitness coach and kinesiologist. Analyze the provided exercise video with high precision.
            
            TASKS:
            1. Identify the exact exercise being performed.
            2. Count the total repetitions OR the duration if it's an isometric/timed exercise.
            3. Evaluate the technique. Be critical but constructive.
            4. Assign a form score from 0-100 based on standard athletic paradigms.
            5. Provide 3-5 specific, actionable tips to improve performance or prevent injury.
            6. If the form is incorrect (isCorrect: false), you MUST provide a detailed 'correctFormExplanation' describing the proper musculoskeletal alignment.

            Return the analysis strictly in JSON format matching the schema.`
          },
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          exerciseName: { type: Type.STRING },
          count: { type: Type.STRING },
          isCorrect: { type: Type.BOOLEAN },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          tips: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctFormExplanation: { type: Type.STRING }
        },
        required: ["exerciseName", "count", "isCorrect", "score", "feedback", "tips"]
      }
    }
  });

  
  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as ExerciseAnalysis;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) resolve(base64String);
      else reject(new Error("Failed to convert file to base64"));
    };
    reader.onerror = error => reject(error);
  });
}
