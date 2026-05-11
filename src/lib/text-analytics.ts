// src/lib/text-analytics.ts
// Isomorphic (no 'use client' / 'use server') — can be imported from both environments.

export interface ReadabilityMetrics {
  ease: number;
  grade: number;
  scoreDescription: string;
  assessment: string;
}

export interface VocabMetrics {
  uniqueWords: number;
  totalWords: number;
  ttr: number;
  hapaxCount: number;
  hapaxRatio: number;
}

export interface DialogueMetrics {
  dialogueRatio: number;
  dialogueWords: number;
  totalWords: number;
  detectedStyle: 'quotation' | 'em-dash' | 'mixed' | 'none';
}

export interface ChapterStats {
  avg: number;
  min: number;
  max: number;
  stdDev: number;
  counts: number[];
}

// Convert TipTap / rich-text HTML to plain text, preserving paragraph breaks.
export function stripHtml(html: string): string {
  return html
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 0;
  if (cleaned.length <= 3) return 1;
  const syl = cleaned
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
    .match(/[aeiouy]{1,2}/g);
  return Math.max(1, syl ? syl.length : 1);
}

export function computeReadability(text: string): ReadabilityMetrics {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

  if (words.length === 0 || sentences.length === 0) {
    return { ease: 0, grade: 0, scoreDescription: '', assessment: '' };
  }

  const asl = words.length / sentences.length;
  const asw = syllableCount / words.length;
  const ease = Math.max(0, Math.min(100, 206.835 - 1.015 * asl - 84.6 * asw));
  const grade = Math.max(0, 0.39 * asl + 11.8 * asw - 15.59);

  let scoreDescription: string;
  let assessment: string;
  if (ease >= 90)      { scoreDescription = 'Very Easy';        assessment = 'Very easy to read — suitable for all ages.'; }
  else if (ease >= 80) { scoreDescription = 'Easy';             assessment = 'Easy to read — suitable for most readers.'; }
  else if (ease >= 70) { scoreDescription = 'Fairly Easy';      assessment = 'Fairly easy to read.'; }
  else if (ease >= 60) { scoreDescription = 'Standard';         assessment = 'Plain English — suitable for ages 13 and up.'; }
  else if (ease >= 50) { scoreDescription = 'Fairly Difficult'; assessment = 'Fairly difficult to read — consider simplifying some sentences.'; }
  else if (ease >= 30) { scoreDescription = 'Difficult';        assessment = 'Difficult to read — best suited for well-read audiences.'; }
  else                 { scoreDescription = 'Very Complex';     assessment = 'Very complex — most accessible to highly educated readers.'; }

  return {
    ease: Math.round(ease * 10) / 10,
    grade: Math.round(grade * 10) / 10,
    scoreDescription,
    assessment,
  };
}

export function computeVocabularyRichness(text: string): VocabMetrics {
  // Match words including accented/Unicode characters common in Portuguese
  const words = text.toLowerCase().match(/\b[a-záàâãéèêíïóôõöúüçñ'-]+\b/gi) ?? [];
  if (words.length === 0) {
    return { uniqueWords: 0, totalWords: 0, ttr: 0, hapaxCount: 0, hapaxRatio: 0 };
  }
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  const uniqueWords = freq.size;
  const totalWords = words.length;
  const hapaxCount = [...freq.values()].filter(c => c === 1).length;

  return {
    uniqueWords,
    totalWords,
    ttr: Math.round((uniqueWords / totalWords) * 1000) / 1000,
    hapaxCount,
    hapaxRatio: uniqueWords > 0 ? Math.round((hapaxCount / uniqueWords) * 1000) / 1000 : 0,
  };
}

export function computeDialogueMetrics(text: string): DialogueMetrics {
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);

  let dialogueWords = 0;
  let totalWords = 0;
  let quotedCount = 0;
  let emDashCount = 0;

  for (const para of paragraphs) {
    const wc = para.split(/\s+/).filter(Boolean).length;
    totalWords += wc;

    // English/standard quoted dialogue: starts with " ' " ' "
    if (/^["'"'"']/.test(para)) {
      dialogueWords += wc;
      quotedCount++;
    // PT-BR / European em-dash / en-dash dialogue: line starts with — or –
    } else if (/^[—–]/.test(para)) {
      dialogueWords += wc;
      emDashCount++;
    }
  }

  let detectedStyle: DialogueMetrics['detectedStyle'] = 'none';
  if (quotedCount > 0 && emDashCount > 0) detectedStyle = 'mixed';
  else if (quotedCount > 0) detectedStyle = 'quotation';
  else if (emDashCount > 0) detectedStyle = 'em-dash';

  return {
    dialogueRatio: totalWords > 0 ? Math.round((dialogueWords / totalWords) * 1000) / 1000 : 0,
    dialogueWords,
    totalWords,
    detectedStyle,
  };
}

export function computeChapterStats(wordCounts: number[]): ChapterStats {
  if (wordCounts.length === 0) return { avg: 0, min: 0, max: 0, stdDev: 0, counts: [] };
  const avg = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
  const min = Math.min(...wordCounts);
  const max = Math.max(...wordCounts);
  const variance = wordCounts.reduce((sum, c) => sum + (c - avg) ** 2, 0) / wordCounts.length;
  return { avg: Math.round(avg), min, max, stdDev: Math.round(Math.sqrt(variance)), counts: wordCounts };
}
