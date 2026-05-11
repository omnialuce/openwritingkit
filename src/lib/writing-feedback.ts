'use server';

// Writing feedback powered by:
//   - LanguageTool public API (open-source, self-hostable) for grammar & spelling
//   - Flesch-Kincaid algorithm computed locally for readability

const LANGUAGETOOL_API = 'https://api.languagetoolplus.com/v2/check';

const LANG_MAP: Record<string, string> = {
  en: 'en-US',
  'en-US': 'en-US',
  'en-gb': 'en-GB',
  'en-GB': 'en-GB',
  pt: 'pt-BR',
  'pt-BR': 'pt-BR',
};

const CATEGORY_LABELS: Record<string, string> = {
  GRAMMAR: 'grammar',
  TYPOS: 'spelling',
  CASING: 'capitalisation',
  PUNCTUATION: 'punctuation',
  STYLE: 'style',
  CONFUSED_WORDS: 'word choice',
  COLLOCATIONS: 'collocation',
  REDUNDANCY: 'redundancy',
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

// ---------- readability (no external deps) ----------

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const vowelGroups = stripped.match(/[aeiouy]{1,2}/g);
  return vowelGroups ? Math.max(1, vowelGroups.length) : 1;
}

function computeReadability(text: string): { ease: number; grade: number } {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = Math.max(1, words.length);
  const syllableCount = words.reduce((n, w) => n + countSyllables(w), 0);

  const ease = Math.round(
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)
  );
  const grade = Math.round(
    (0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59) * 10
  ) / 10;

  return { ease: Math.max(0, Math.min(100, ease)), grade: Math.max(0, grade) };
}

function readabilityLabel(ease: number, grade: number): { scoreDescription: string; assessment: string } {
  let scoreDescription: string;
  if (ease >= 90) scoreDescription = `Very Easy — Grade ${grade} level`;
  else if (ease >= 80) scoreDescription = `Easy — Grade ${grade} level`;
  else if (ease >= 70) scoreDescription = `Fairly Easy — Grade ${grade} level`;
  else if (ease >= 60) scoreDescription = `Standard — Grade ${grade} level`;
  else if (ease >= 50) scoreDescription = `Fairly Difficult — Grade ${grade} level`;
  else if (ease >= 30) scoreDescription = `Difficult — College level`;
  else scoreDescription = `Very Difficult — College graduate level`;

  let assessment: string;
  if (ease >= 70) {
    assessment = `Your text reads naturally and is accessible to a wide audience (Flesch score ${ease}/100).`;
  } else if (ease >= 50) {
    assessment = `Your text is moderately readable (Flesch score ${ease}/100). Splitting long sentences could improve flow.`;
  } else {
    assessment = `Your text is quite dense (Flesch score ${ease}/100). Breaking up long sentences and choosing shorter words will help readers stay engaged.`;
  }

  return { scoreDescription, assessment };
}

// ---------- LanguageTool ----------

async function fetchGrammarSuggestions(
  text: string,
  lang: string
): Promise<GrammarSuggestion[]> {
  const body = new URLSearchParams({
    text,
    language: lang,
    enabledOnly: 'false',
  });

  const res = await fetch(LANGUAGETOOL_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
    // LanguageTool free tier: texts up to ~20 KB, 20 req/min
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
      issueType: CATEGORY_LABELS[match.rule.category.id] ?? 'grammar',
    });
  }
  return suggestions;
}

// ---------- public entry point ----------

export async function getWritingFeedback(input: {
  text: string;
  language?: string;
}): Promise<WritingFeedbackResult> {
  // Strip HTML tags that may come from TipTap
  const plainText = input.text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lang = LANG_MAP[input.language ?? 'en'] ?? 'en-US';

  // Run readability locally (no network) and grammar via LanguageTool in parallel
  const { ease, grade } = computeReadability(plainText);
  const readabilityResult = readabilityLabel(ease, grade);

  let grammarSpellingSuggestions: GrammarSuggestion[] = [];
  try {
    grammarSpellingSuggestions = await fetchGrammarSuggestions(plainText, lang);
  } catch {
    // LanguageTool unreachable — readability still shown, grammar section empty
  }

  const issueCount = grammarSpellingSuggestions.length;
  const overallAssessment =
    issueCount === 0
      ? `No grammar or spelling issues detected. ${readabilityResult.scoreDescription}.`
      : `${issueCount} grammar or spelling issue${issueCount === 1 ? '' : 's'} found. ${readabilityResult.scoreDescription}.`;

  return {
    overallAssessment,
    grammarSpellingSuggestions,
    readability: readabilityResult,
  };
}
