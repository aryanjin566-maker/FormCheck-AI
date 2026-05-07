# Routes and Database Architecture

## 1. Routing & State Navigation

Performance OS is a **Single Page Application (SPA)** managed by a central state machine in `App.tsx`. There are no traditional server-side routes; instead, navigation is handled by the `currentView` state.

### Frontend Views:
-   **Dashboard (`'dashboard'`):** The main landing area showing the streak, hero section, and quick actions.
-   **Diagnostics (`'analyze'`):** The video uploader and exercise analysis result view.
-   **Strategy (`'chat'`):** The full-screen AI coach chat interface.
-   **History (`'history'`):** (Navigated via Dashboard list) Shows a chronological feed of past scans.
-   **Elite (`'leaderboard'`):** Lists global users ranked by their Command Score.

---

## 2. Front-End / Back-End Flow

The application uses a **Serverless Architecture** with Firebase as the backend.

1.  **Authentication:** Users sign in via Google OAuth. Upon login, a `syncUserProfile` effect checks if a Firestore document exists for that UID.
2.  **API Requests:** AI requests are handled client-side by sending the Gemini API key (stored in `.env`) directly to Google's servers.
3.  **Data Persistence:** Once an AI analysis or Check-in is complete, the frontend sends a write request to Firestore.
4.  **Real-Time Sync:** Navigation between views triggers `fetchHistory` or `fetchLeaders` to pull the latest state from the database.

---

## 3. Database Structure (Firestore)

The database is built on a relational NoSQL structure.

### Collection: `/users/{userId}`
Stores the primary state for each athlete.
```json
{
  "displayName": "string",
  "photoURL": "string",
  "currentStreak": number,
  "leaderboardScore": number,
  "totalReps": number,
  "uniqueExercises": ["string"],
  "lastCheckInDate": "YYYY-MM-DD",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Sub-Collection: `/users/{userId}/analyses/`
Stores individual diagnostic reports.
```json
{
  "exerciseName": "string",
  "count": "string",
  "isCorrect": boolean,
  "score": number,
  "feedback": "string",
  "tips": ["string"],
  "createdAt": "timestamp"
}
```

### Sub-Collection: `/users/{userId}/checkins/`
Logs daily activity marks.
```json
{
  "date": "YYYY-MM-DD",
  "completed": true,
  "createdAt": "timestamp"
}
```

---

## 4. Security Rules

The application implements strict **Firestore Security Rules**:
-   **Private Data:** Analyses and Check-ins are restricted to the owner (`request.auth.uid == userId`).
-   **Public Data:** Basic user profiles (Name, Photo, Leaderboard Score) are readable by any authenticated user to populate the leaderboard.
-   **Write Protection:** Users can only write to their own `userId` paths. Validation helpers ensure that `leaderboardScore` and `streak` cannot be malicious or shadow-updated with invalid types.
