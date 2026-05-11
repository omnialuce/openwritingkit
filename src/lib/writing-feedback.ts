'use server';

// Grammar feedback: LanguageTool public API (open-source, self-hostable)
// Readability:      Flesch-Kincaid computed locally — no text leaves the device
// Configure NEXT_PUBLIC_LANGUAGETOOL_URL in .env.local to point at a private instance.

const LANGUAGETOOL_API =
  process.env.NEXT_PUBLIC_LANGUAGETOOL_URL ?? 'https://api.languagetoolplus.com/v2/check';

const LANG_MAP: Record<string, string> = {
  en: 'en-US',
  'en-US': 'en-US',
  'en-gb': 'en-GB',
  'en-GB': 'en-GB',
  pt: 'pt-BR',
  'pt-BR': 'pt-BR',
};

// Human-readable category labels — intentionally plain, not technical
const CATEGORY_LABELS: Record<string, string> = {
  GRAMMAR: 'Grammar',
  TYPOS: 'Spelling',
  CASING: 'Capitalisation',
  PUNCTUATION: 'Punctuation',
  STYLE: 'Style',
  CONFUSED_WORDS: 'Word choice',
  COLLOCATIONS: 'Word pairing',
  REDUNDANCY: 'Redundancy',
};

interface LTMatch {
  message: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
  rule: { id: string; category: { id: string } };
}

interface LTResponse {
  matches: LTMatch[];
}

export interface GrammarSuggestion {
  originalText: string;
  suggestedCorrection: string;
  explanation?: string;
  issueType: string;
}

export interface WritingFeedbackResult {
  overallAssessment: string;
  grammarSpellingSuggestions: GrammarSuggestion[];
  readability: {
    scoreDescription: string;
    assessment: string;
  };
}

// ---------- readability ----------

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const vowelGroups = stripped.match(/[aeiouy]{1,2}/g);
  return vowelGroups ? Math.max(1, vowelGroups.length) : 1;
}

function computeReadabilityLocal(text: string): { ease: number; grade: number } {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = Math.max(1, words.length);
  const syllableCount = words.reduce((n, w) => n + countSyllables(w), 0);
  const ease = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
  const grade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
  return { ease: Math.max(0, Math.min(100, Math.round(ease))), grade: Math.max(0, Math.round(grade * 10) / 10) };
}

function readabilityLabel(ease: number, grade: number): { scoreDescription: string; assessment: string } {
  // Grade level described in plain terms, not Flesch jargon
  const gradeLabel = grade <= 6 ? 'very accessible' : grade <= 9 ? 'accessible' : grade <= 12 ? 'intermediate' : 'advanced';
  const scoreDescription =
    ease >= 90 ? 'Very easy to read' :
    ease >= 80 ? 'Easy to read' :
    ease >= 70 ? 'Fairly easy to read' :
    ease >= 60 ? 'Standard / plain English' :
    ease >= 50 ? 'Somewhat complex' :
    ease >= 30 ? 'Complex — dense prose' :
                 'Very complex';

  let assessment: string;
  if (ease >= 70) {
    assessment = `This reads naturally and is accessible to a wide audience (${gradeLabel}, grade ${grade}).`;
  } else if (ease >= 50) {
    assessment = `This is moderately readable (${gradeLabel}, grade ${grade}). Breaking up long sentences could improve flow.`;
  } else {
    assessment = `This is quite dense (${gradeLabel}, grade ${grade}). Shorter sentences and simpler words will help readers stay engaged.`;
  }

  return { scoreDescription, assessment };
}

// ---------- LanguageTool ----------

async function fetchGrammarSuggestions(text: string, lang: string): Promise<GrammarSuggestion[]> {
  const body = new URLSearchParams({ text, language: lang, enabledOnly: 'false' });
  const res = await fetch(LANGUAGETOOL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: body.toString(),
  });
  if (!res.ok) return [];

  const data: LTResponse = await res.json();
  const suggestions: GrammarSuggestion[] = [];
  for (const match of data.matches.slice(0, 25)) {
    const originalText = text.substring(match.offset, match.offset + match.length);
    const suggestedCorrection = match.replacements[0]?.value ?? '';
    if (!originalText || !suggestedCorrection || originalText === suggestedCorrection) continue;
    suggestions.push({
      originalText,
      suggestedCorrection,
      explanation: match.message,
      issueType: CATEGORY_LABELS[match.rule.category.id] ?? 'Grammar',
    });
  }
  return suggestions;
}

// ---------- public entry point ----------

export async function getWritingFeedback(input: {
  text: string;
  language?: string;
}): Promise<WritingFeedbackResult> {
  const plainText = input.text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lang = LANG_MAP[input.language ?? 'en'] ?? 'en-US';

  const { ease, grade } = computeReadabilityLocal(plainText);
  const readabilityResult = readabilityLabel(ease, grade);

  let grammarSpellingSuggestions: GrammarSuggestion[] = [];
  try {
    grammarSpellingSuggestions = await fetchGrammarSuggestions(plainText, lang);
  } catch {
    // LanguageTool unreachable — readability still shown, grammar section omitted
  }

  const issueCount = grammarSpellingSuggestions.length;
  const overallAssessment =
    issueCount === 0
      ? `No grammar or spelling issues found. ${readabilityResult.scoreDescription}.`
      : `${issueCount} potential issue${issueCount === 1 ? '' : 's'} found. ${readabilityResult.scoreDescription}.`;

  return { overallAssessment, grammarSpellingSuggestions, readability: readabilityResult };
}
