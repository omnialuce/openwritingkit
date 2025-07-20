
# OpenWritingKit

This is a Next.js app designed to be an intelligent,comprehensive, open-source writing companion. It's built for writers who want a powerful, private, and customizable tool to bring their stories to life.

## Features

- **Dashboard (`/`)**: Overview and quick actions to jump right into your work.
- **Stories (`/stories`)**: Manage multiple projects. All your data is sandboxed per story.
- **Editor (`/editor`)**: A clean, distraction-free writing space with auto-save, version history, focus and typewriter modes, and optional AI feedback.
- **Documents (`/documents`)**: Organize your files, scenes, and chapters in a familiar folder structure. Import `.docx` files and export your work.
- **Outline Builder (`/outline`)**: Visually structure your narrative with a drag-and-drop outliner.
- **Character Development (`/characters`)**: Create detailed character profiles and use an in-depth character sheet template to flesh them out.
- **Plot Tools (`/plot-tools`)**: Use a plot point tracker and a timeline creator to keep your narrative on track.
- **World Building (`/world-building`)**: Build your story's universe with detailed locale sheets for cities, regions, and more.
- **Research (`/research`)**: Keep your research notes, inspiration, and important links organized with tags.
- **AI Tools (`/ai-tools`)**: Leverage AI for writing prompts, pacing analysis, and more (opt-in required).
- **Analytics (`/analytics`)**: Track your writing habits and progress with word count goals and session stats.
- **Settings (`/settings`)**: Manage your account, theme, language, and data.

## Data Privacy & Storage

**Local Storage First**: Your document content, writing history, and all other story data are stored locally in your web browser's `localStorage`, namespaced by your user ID. This means your data is private to you and your device.

**Backup & Restore**: Because data is stored locally, it is **critical** to use the **Backup & Restore** feature in **Settings -> Data Management**. This allows you to export all your data to a single file and import it on another device or browser, preventing data loss.

**Optional AI Features**:
- AI features are **opt-in by default**. You must explicitly enable them in the Settings page.
- When an AI feature is used, the specific text you provide is sent to a third-party AI model (Google's Gemini) for processing.
- OpenWritingKit does not store this submitted text on its own servers. Please review the full disclaimer in the Settings page before enabling AI features.

## Tech Stack

- Next.js (App Router)
- React & TypeScript
- Tailwind CSS & ShadCN UI Components
- Firebase (for Authentication and Email Triggering)
- Genkit (for AI features)

---

## Local Installation and Setup

Follow these steps to run your own instance of OpenWritingKit locally.

### 1. Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js**: [Download and install Node.js](https://nodejs.org/) (version 18 or higher recommended).
- **Git**: [Download and install Git](https://git-scm.com/downloads).

### 2. Get the Code

You can either clone the repository using Git or download the source code as a ZIP file.

**Using Git (Recommended):**
Open your terminal or command prompt and run:
```bash
git clone https://github.com/luanaairs/OpenWritingKit.git
cd OpenWritingKit
```

**Download ZIP:**
- Go to the repository on GitHub.
- Click the "Code" button and select "Download ZIP".
- Unzip the file and open the `OpenWritingKit-master` folder in your terminal.

### 3. Install Dependencies

Once you are in the project's directory in your terminal, run the following command to install all the necessary packages:
```bash
npm install
```

### 4. Set Up Firebase

This application uses Firebase for user authentication and for sending feedback emails. You will need to create a free Firebase project to get the required credentials.

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Email/Password Authentication**:
    - In your Firebase project, go to the **Authentication** section.
    - Click the **"Sign-in method"** tab.
    - Enable the **Email/Password** provider.
3.  **Enable Firestore**:
    - In your Firebase project, go to the **Firestore Database** section.
    - Create a new database in **Production mode**. You can choose any region.
4.  **Install the "Trigger Email" Extension**:
    - In the Firebase Console, navigate to **Build > Extensions**.
    - Search for the **"Trigger Email"** extension and click **Install**.
    - You will be asked to configure it. For the **"SMTP connection URI"**, you will need credentials from an email service like SendGrid, Mailgun, or your own SMTP server. A common choice is to use a new Gmail "App Password".
    - Set the **"Mail documents collection"** to `mail`. This is the collection the app will write to.
5.  **Create a Web App**:
    - Go to your Project Settings (click the gear icon).
    - Under "Your apps", click the web icon (`</>`) to create a new web app.
    - Give it a nickname and register the app.
6.  **Get Firebase Credentials**:
    - After registering, Firebase will give you a `firebaseConfig` object. This contains your API keys. You will need these for the next step.
7.  **Create an Environment File**:
    - In the root of your project, create a new file named `.env`.
    - Copy the contents of your `firebaseConfig` object into this file, adding the `NEXT_PUBLIC_` prefix to each key. It should look like this:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
    ```
    - **Note**: This app does not have a public sign-up page. You must manually add users in the Firebase Authentication console.

### 5. Run the Application

Now you're ready to start the development server! Run the following command in your terminal:
```bash
npm run dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the application running. You can log in with the user accounts you created in the Firebase console.
