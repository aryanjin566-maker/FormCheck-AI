# AI System Architecture

The AI capabilities of Performance OS are powered by the **Google Gemini API** via the `@google/genai` SDK. The integration is divided into two primary services: Video Analysis and Strategic Chat.

## 1. Video Analysis Service (`geminiService.ts`)

### Method: `analyzeExerciseVideo(file: File)`
This method handles the multimodal analysis of exercise videos.

**Current Flow:**
1.  **File Input:** Accepts a `File` object from the frontend (drag-and-drop or file selector).
2.  **Base64 Conversion:** The file is converted to a Base64 string to be sent to the API.
3.  **Model Selection:** Uses `gemini-3-flash-preview` for its speed and multimodal precision.
4.  **Prompt Engineering:** 
    -   Sends the video data along with a system prompt that defines the role of an "elite fitness coach and kinesiologist".
    -   Requests identification, counting, technique evaluation, and scoring.
5.  **Structured Output:** Utilizes `responseMimeType: "application/json"` and a defined `responseSchema` to ensure the AI returns a valid `ExerciseAnalysis` object.

**AI Logic:**
```typescript
// geminiService.ts snippet
const response = await ai.models.generateContent({
  model: "gemini-3-flash-preview",
  contents: [{
    parts: [
      { text: "Identify exercise, count reps, evaluate technique..." },
      { inlineData: { mimeType: file.type, data: base64Data } }
    ]
  }],
  config: { responseMimeType: "application/json", responseSchema: { ... } }
});
```

---

## 2. Strategic Command Service (`chatService.ts`)

### Method: `streamChatPlan(history: ChatMessage[])`
This method provides a streaming interface for long-form strategic planning.

**Current Flow:**
1.  **Context Mapping:** Converts the local `ChatMessage` history into the format expected by the Gemini API (`role` and `parts`).
2.  **Model Selection:** Uses `gemini-3.1-pro-preview` for complex reasoning and long-context strategy generation.
3.  **System Instructions:** Hardcoded instructions define the AI as an "elite virtual performance coach". It is instructed to use structured formatting (Headers, Bold) for readability.
4.  **Streaming:** Uses `generateContentStream` to provide a real-time typing effect in the UI, which is crucial for long transformation plans.

**AI Logic:**
```typescript
// chatService.ts snippet
export async function* streamChatPlan(history: ChatMessage[]) {
  const response = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents: [...chatHistory, { role: 'user', parts: [{ text: prompt }] }],
    config: { systemInstruction: "..." }
  });

  for await (const chunk of response) {
    if (chunk.text) yield chunk.text;
  }
}
```

---

## 3. Data Integration Flow

After the AI returns results, the application performs secondary logic in `App.tsx`:
-   **Parsing Volume:** The AI's `count` string (e.g., "12 reps") is parsed for digits.
-   **Aggregating Stats:** Total reps and unique exercise strings are tracked.
-   **Leaderboard Scoring:** A weighted calculation is applied:
    `Score = (Streak * 60) + (UniqueExercises * 10) + (TotalReps * 20)`
-   **Persistence:** The AI analysis and updated scores are saved to Firestore.
