
# OpenWritingKit by Firebase Studio

This is a NextJS starter app, "OpenWritingKit", created in Firebase Studio. It's designed to be an intelligent writing companion.

To get started, explore the different sections:
- **Dashboard (`/`)**: Overview and quick actions.
- **Editor (`/editor`)**: Your main writing space with auto-save and focus mode.
- **Documents (`/documents`)**: Organize your files and folders.
- **Outline Builder (`/outline`)**: Structure your narratives.
- **AI Tools (`/ai-tools`)**: Leverage AI for writing prompts, pacing analysis, and more (opt-in required).
- **Analytics (`/analytics`)**: Track your writing habits and progress.
- **Settings (`/settings`)**: Manage preferences, including AI feature opt-in.

## Data Privacy

**Local Storage**: Your primary document content, writing history, word goals, and writing streak information are stored locally in your web browser's `localStorage`. This data is not automatically sent to any server by OpenWritingKit.

**AI Features**: OpenWritingKit offers optional AI-powered features. 
- These features are **opt-in by default**. You must explicitly enable them in the Settings page.
- When you use an AI feature (e.g., "Get Writing Feedback," "Analyze Pacing"), the specific text you provide for that function is sent to a third-party AI model (e.g., Google's Gemini via Genkit) for processing to generate the requested output.
- OpenWritingKit does not store this submitted text on its own servers or use it for training its own AI models beyond the immediate processing required for the feature.
- You can disable AI features at any time via the Settings page. Please review the full disclaimer in the Settings page before enabling AI features.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- Genkit (for AI features)
- Lucide Icons
