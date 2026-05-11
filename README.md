# OpenWritingKit

An open-source, privacy-first writing companion built for fiction writers. All story data lives in your browser — no cloud sync, no data harvesting, no generative AI for your prose.

## Features

### Core Writing Tools
- **Editor (`/editor`)** — Distraction-free writing with auto-save, version history (last 20 snapshots), focus mode, typewriter mode, word/character count, Find & Replace, and export to TXT, HTML, Markdown, DOCX, and PDF.
- **Documents (`/documents`)** — Organise files, scenes, and chapters in a folder tree. Import `.docx` files, drag-and-drop reorder, and export individual documents.
- **Outline Builder (`/outline`)** — Drag-and-drop outliner with per-item colour coding, POV, location, in-story date/time, status (Draft / In Progress / Complete), word count target, synopsis, and document linking. Compact/expanded toggle, collapse/expand per item, duplicate, progress bar, and CSV + TXT export.

### Story Organisation
- **Stories (`/stories`)** — Manage multiple projects. All data is sandboxed per story and per user.
- **Characters (`/characters`)** — Character profiles with image, role, description, and backstory. Detailed in-depth character sheets. SVG relationship map with colour-coded edges (family, friend, enemy, romantic, mentor, rival, colleague).
- **World Building (`/world-building`)** — Locale sheets for settings, cities, regions, and any location type you need.
- **Plot Tools (`/plot-tools`)** — Plot structure templates (Hero's Journey, Three-Act, Save the Cat, and more) with per-beat notes.
- **Research (`/research`)** — Notes, links, and inspiration organised with tags and to-do tracking.

### Analysis & Feedback
- **Writing Tools (`/ai-tools`)** — Local, offline analysis tools with no AI dependency:
  - **Pacing Analyser** — Sentence-length distribution, dialogue ratio (supports PT-BR em-dash convention), section-by-section pacing heatmap.
  - **Hemingway Checker** — Flags adverbs, passive voice, weak verbs, and complex sentences; gives an overall grade.
  - **POV & Tense Report** — Detects dominant point of view and tense, shows pronoun breakdown, and flags paragraphs that break from the dominant tense.
  - **Cliché Detector** — Scans the full manuscript against ~80 English and Portuguese clichés.
  - **Name Generator** — Seeded names across five categories: fantasy, medieval, Norse, Portuguese, and sci-fi.
  - **Prompt Generator** — Scene and story prompts to beat writer's block.
  - **Writing Feedback** — Grammar and style suggestions via [LanguageTool](https://languagetool.org/) (see below). Readability score with plain-language assessment.
- **Analytics (`/analytics`)** — Daily and hourly writing activity charts, chapter word-count breakdown, streak tracking, and a deep-scan story analysis (vocabulary richness, dialogue ratio, readability).

### Other
- **Dashboard (`/`)** — Overview, word-goal progress, recent activity, and quick links.
- **Settings (`/settings`)** — Theme (light/dark/system), language (English, British English, Portuguese), word goal, data backup & restore, account management.

---

## Privacy & Data Storage

**Local-first:** All story content, outlines, characters, world building, and research are stored in your browser's `localStorage`, namespaced by user ID. Nothing is sent to any server unless you explicitly use the Writing Feedback feature.

**Backup & Restore:** Because data lives in the browser, use **Settings → Data Management** to export a full backup file and import it on another device or after clearing browser storage.

**Writing Feedback (LanguageTool):** By default, the feedback feature calls the public LanguageTool API. For a fully private setup, [self-host LanguageTool](https://dev.languagetool.org/http-server) and point the app at your instance via `NEXT_PUBLIC_LANGUAGETOOL_URL`. No text is stored by the app itself.

**No generative AI for writing:** OpenWritingKit does not use any generative AI model (no Gemini, no GPT, no Claude) to write, suggest, or rewrite your prose. All analysis tools run locally in the browser using the [compromise](https://github.com/spencermountain/compromise) NLP library.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| UI | React 18, Tailwind CSS, shadcn/ui |
| Rich text editor | TipTap v2 |
| NLP (local) | compromise v14 |
| Charts | recharts v2 |
| Auth | Firebase (email/password + Google OAuth via NextAuth) |
| Storage | Browser `localStorage` via async wrapper |
| Drag & drop | @hello-pangea/dnd |
| Grammar feedback | LanguageTool API (optional self-hosted) |

---

## Local Installation

### Prerequisites

- **Node.js** 18 or higher — [nodejs.org](https://nodejs.org/)
- **Git** — [git-scm.com](https://git-scm.com/)
- A **Firebase project** (free tier is sufficient)

### 1. Clone the repository

```bash
git clone https://github.com/omnialuce/openwritingkit.git
cd openwritingkit
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase web app config |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth sign-in |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth sign-in |
| `NEXTAUTH_SECRET` | Yes | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` for local dev |
| `INVITE_CODE` | Optional | If set, users must enter this code to register |
| `NEXT_PUBLIC_LANGUAGETOOL_URL` | Optional | Self-hosted LanguageTool endpoint; omit to use the public API |

### 4. Set up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Under **Authentication → Sign-in method**, enable **Email/Password** and optionally **Google**.
3. Under **Project Settings → Your apps**, create a **Web app** and copy the config values into `.env.local`.
4. *(Optional)* If you want server-side Firestore operations, generate a service account key under **Project Settings → Service accounts** and paste the JSON as a single line into `FIREBASE_SERVICE_ACCOUNT_KEY`.

> **Note:** There is no public sign-up by default. Either leave `INVITE_CODE` blank to allow open registration, or set it to restrict access to invited users. You can also add users manually in the Firebase Authentication console.

### 5. Run the development server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

---

## Contributing

Issues and pull requests are welcome. Please open an issue first for significant changes so we can discuss the approach.
