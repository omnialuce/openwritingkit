// Client-side pacing analysis using compromise NLP.
// No network calls — the entire analysis runs in the browser.

import nlp from 'compromise';
import { stripHtml as sharedStripHtml } from './text-analytics';

export type PacingLevel = 'fast' | 'medium' | 'slow';

export interface SentenceLengthMetric {
  average: number;
  min: number;
  max: number;
  standardDeviation: number;
  level: PacingLevel;
  varietyLabel: string;
}

export interface ParagraphMetric {
  count: number;
  averageWords: number;
  longParagraphs: number; // paragraphs > 150 words
}

export interface DialogueMetric {
  percentage: number;
  label: string;
}

export interface SectionPacing {
  label: string; // e.g. "Part 1 of 5"
  level: PacingLevel;
  avgSentenceLength: number;
}

export interface PacingCallout {
  type: 'warning' | 'tip' | 'positive';
  message: string;
}

export interface PacingAnalysisResult {
  sentenceLength: SentenceLengthMetric;
  paragraphs: ParagraphMetric;
  dialogue: DialogueMetric;
  sections: SectionPacing[];
  callouts: PacingCallout[];
  overallLevel: PacingLevel;
  wordCount: number;
}

// ---------- helpers ----------

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

function pacingFromAvgLength(avg: number): PacingLevel {
  if (avg <= 12) return 'fast';
  if (avg <= 20) return 'medium';
  return 'slow';
}

const stripHtml = sharedStripHtml;

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function sentenceLengths(sentences: string[]): number[] {
  return sentences.map(s => wordCount(s)).filter(n => n > 0);
}

function isDialogue(sentence: string): boolean {
  const t = sentence.trim();
  // English/standard: quoted runs (straight, smart double, smart single)
  if (/^[““]/.test(t)) return true;  // “ and “
  if (/^[‘]/.test(t)) return true;          // ‘
  // PT-BR / European: em-dash or en-dash at start of line
  if (/^[—–]/.test(t)) return true;   // — and –
  return false;
}

// ---------- main ----------

export function analyzePacing(html: string): PacingAnalysisResult {
  const plain = stripHtml(html);
  const paragraphs = splitParagraphs(plain);
  const doc = nlp(plain);

  const allSentences: string[] = doc.sentences().out('array') as string[];
  const lengths = sentenceLengths(allSentences);

  const totalWords = wordCount(plain);
  const avgLen = lengths.length > 0
    ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
    : 0;
  const sd = stdDev(lengths);
  const minLen = lengths.length > 0 ? Math.min(...lengths) : 0;
  const maxLen = lengths.length > 0 ? Math.max(...lengths) : 0;
  const level = pacingFromAvgLength(avgLen);

  const varietyLabel =
    sd < 4 ? 'Low variety — monotonous rhythm'
    : sd < 9 ? 'Moderate variety — decent flow'
    : 'High variety — dynamic rhythm';

  const sentenceLength: SentenceLengthMetric = {
    average: avgLen,
    min: minLen,
    max: maxLen,
    standardDeviation: sd,
    level,
    varietyLabel,
  };

  // Paragraph metrics
  const paraWordCounts = paragraphs.map(wordCount);
  const avgParaWords = paraWordCounts.length > 0
    ? Math.round(paraWordCounts.reduce((a, b) => a + b, 0) / paraWordCounts.length)
    : 0;
  const longParagraphs = paraWordCounts.filter(n => n > 150).length;

  const paragraphMetric: ParagraphMetric = {
    count: paragraphs.length,
    averageWords: avgParaWords,
    longParagraphs,
  };

  // Dialogue ratio
  const dialogueCount = allSentences.filter(isDialogue).length;
  const dialoguePercent = allSentences.length > 0
    ? Math.round((dialogueCount / allSentences.length) * 100)
    : 0;
  const dialogueLabel =
    dialoguePercent < 10 ? 'Mostly narrative'
    : dialoguePercent < 35 ? 'Balanced narrative and dialogue'
    : dialoguePercent < 60 ? 'Dialogue-heavy'
    : 'Very dialogue-heavy';

  const dialogue: DialogueMetric = { percentage: dialoguePercent, label: dialogueLabel };

  // Section pacing (split into up to 5 equal chunks)
  const SECTION_COUNT = 5;
  const sections: SectionPacing[] = [];
  if (allSentences.length >= SECTION_COUNT) {
    const chunkSize = Math.ceil(allSentences.length / SECTION_COUNT);
    for (let i = 0; i < SECTION_COUNT; i++) {
      const chunk = allSentences.slice(i * chunkSize, (i + 1) * chunkSize);
      const chunkLengths = sentenceLengths(chunk);
      const chunkAvg = chunkLengths.length > 0
        ? Math.round(chunkLengths.reduce((a, b) => a + b, 0) / chunkLengths.length)
        : 0;
      sections.push({
        label: `Part ${i + 1}`,
        level: pacingFromAvgLength(chunkAvg),
        avgSentenceLength: chunkAvg,
      });
    }
  }

  // Callouts
  const callouts: PacingCallout[] = [];

  if (totalWords < 100) {
    callouts.push({ type: 'tip', message: 'Add more text for a thorough pacing analysis.' });
  }
  if (avgLen > 25) {
    callouts.push({ type: 'warning', message: `Average sentence length is ${avgLen} words — quite long. Breaking some sentences up will increase tension and readability.` });
  } else if (avgLen < 8 && totalWords > 100) {
    callouts.push({ type: 'tip', message: `Average sentence length is only ${avgLen} words. Very short sentences read fast but can feel choppy — mix in some longer ones for rhythm.` });
  }
  if (sd < 4 && totalWords > 200) {
    callouts.push({ type: 'warning', message: `Low sentence-length variety (std dev ${sd}). Varying sentence lengths creates a more natural reading rhythm.` });
  }
  if (longParagraphs > 0) {
    callouts.push({ type: 'warning', message: `${longParagraphs} paragraph${longParagraphs > 1 ? 's exceed' : ' exceeds'} 150 words. Long blocks of text can slow pacing — consider splitting them.` });
  }
  if (dialoguePercent > 70) {
    callouts.push({ type: 'tip', message: `${dialoguePercent}% of sentences are dialogue. Weaving in more action beats or description can anchor the scene.` });
  }
  if (sd >= 9) {
    callouts.push({ type: 'positive', message: `Good sentence variety (std dev ${sd}) — your writing has a natural, engaging rhythm.` });
  }
  if (avgLen >= 10 && avgLen <= 20 && sd >= 5) {
    callouts.push({ type: 'positive', message: 'Overall pacing looks balanced — sentences are varied and readable.' });
  }
  if (longParagraphs === 0 && paragraphs.length > 3) {
    callouts.push({ type: 'positive', message: 'Paragraph lengths look good — no overly dense blocks.' });
  }

  // Overall level: weight sentence length most heavily
  const overallLevel = pacingFromAvgLength(avgLen);

  return {
    sentenceLength,
    paragraphs: paragraphMetric,
    dialogue,
    sections,
    callouts,
    overallLevel,
    wordCount: totalWords,
  };
}
