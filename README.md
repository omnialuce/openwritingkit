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

**Local-first with cloud sync:** All story content, outlines, characters, world building, and research are stored in your browser's `localStorage` for instant reads, and shadow-synced to your Supabase Storage account in the background. On sign-in from a new device, all your data is automatically downloaded from the cloud.

**Backup & Restore:** Settings → Data Management lets you export a JSON backup file. Settings → Cloud Storage lets you manually push or pull from the cloud (useful for first-time migrations).

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
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Browser `localStorage` as cache, Supabase Storage for cloud sync |
| Drag & drop | @hello-pangea/dnd |
| Grammar feedback | LanguageTool API (optional self-hosted) |

---

## Local Installation

### Prerequisites

- **Node.js** 18 or higher — [nodejs.org](https://nodejs.org/)
- **Git** — [git-scm.com](https://git-scm.com/)
- A **Supabase project** (free tier is sufficient)

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
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | From Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | From Supabase → Project Settings → API |
| `INVITE_CODE` | Optional | If set, users must enter this code to register |
| `NEXT_PUBLIC_LANGUAGETOOL_URL` | Optional | Self-hosted LanguageTool endpoint; omit to use the public API |

### 4. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com/).
2. Under **Authentication → Providers**, enable **Email** and optionally **Google**. For Google, create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/) with `https://<your-project-ref>.supabase.co/auth/v1/callback` as the redirect URI, then paste the client ID and secret into the Supabase Google provider form.
3. Under **Storage**, create a private bucket called **`owk-data`**.
4. Under **Storage → Policies** on the `owk-data` bucket, add a policy for SELECT, INSERT, UPDATE, and DELETE with this expression so users can only access their own folder:
   ```sql
   (bucket_id = 'owk-data') AND ((storage.foldername(name))[1] = auth.uid()::text)
   ```
5. From **Project Settings → API**, copy the Project URL and `anon public` key into `.env.local`.

> **Note:** There is no public sign-up by default. Leave `INVITE_CODE` blank to allow open registration, or set it to restrict access to invited users. Invite codes are validated server-side and never exposed to the browser.

### 5. Run the development server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

---

## Contributing

Issues and pull requests are welcome. Please open an issue first for significant changes so we can discuss the approach.
