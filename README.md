# Gemini Browser Agent Extension

A powerful Chrome Extension that acts as your personal AI browser assistant. It can **read pages**, **click elements**, **type text**, and **scroll**, all powered by Google Gemini 2.0 Flash.

![Screenshot](https://via.placeholder.com/800x400?text=Gemini+Browser+Agent+UI)

## Features
-   **Premium Glassmorphism UI**: Beautiful dark mode design with animations.
-   **3 Modes**:
    -   **Chat**: Casual conversation with the AI.
    -   **Context**: Ask questions about the current page content.
    -   **Action**: Command the AI to interact with the page (Click, Type, Scroll).
-   **Google Authentication**: Secure Sign-in with Google (supports Dev Mode fallback).
-   **Browser Automation**: "Hands-free" browsing capabilities.

## Setup
### 1. Installation
1.  Open this folder in your code editor (VS Code).
2.  Create a file named `.env` in the root directory.
3.  Add your API Key: `VITE_API_KEY=AIzaSy...` (Get one from [Google AI Studio](https://aistudio.google.com/)).
4.  Run `npm install`
5.  Run `npm run build`

### 2. Add to Chrome
1.  Go to `chrome://extensions`
2.  Enable **Developer Mode** (top right toggle).
3.  Click **Load unpacked**.
4.  Select the `dist` folder inside this project.
5.  Open the extension from the side panel or extensions menu!

## Configuration (Optional)
To enable **Real Google Login**:
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create an OAuth Client ID for a Chrome Extension.
3.  Copy the `client_id`.
4.  Update `manifest.json`:
    ```json
    "oauth2": {
      "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
      ...
    }
    ```

## Development
-   `npm run dev`: Start dev server (for UI testing).
-   `npm run build`: Build for production.