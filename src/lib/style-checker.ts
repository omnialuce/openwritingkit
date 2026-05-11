'use client';

// Style analysis using compromise NLP. No network calls.

import nlp from 'compromise';
import { stripHtml } from './text-analytics';

export interface StyleIssue {
  type: 'adverb' | 'passive' | 'weak-verb' | 'complex-sentence' | 'cliche';
  text: string;
  suggestion: string;
}

export interface StyleAnalysisResult {
  adverbs: string[];
  passiveVoiceCount: number;
  weakVerbCount: number;
  complexSentenceCount: number;  // sentences > 30 words
  overallScore: number;          // 0-100 (higher = cleaner prose)
  grade: 'clean' | 'moderate' | 'wordy';
  wordCount: number;
}

export interface PovTenseResult {
  dominantPov: 'first' | 'second' | 'third' | 'unknown';
  dominantTense: 'past' | 'present' | 'unknown';
  firstPersonCount: number;
  secondPersonCount: number;
  thirdPersonCount: number;
  pastVerbCount: number;
  presentVerbCount: number;
  inconsistencies: string[];
}

const WEAK_VERBS = new Set([
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'get', 'got', 'gotten',
  'make', 'made', 'go', 'went', 'come', 'came',
  'do', 'did', 'put', 'set', 'give', 'gave',
]);

export function analyzeStyle(html: string): StyleAnalysisResult {
  const text = stripHtml(html);
  if (!text.trim()) {
    return { adverbs: [], passiveVoiceCount: 0, weakVerbCount: 0, complexSentenceCount: 0, overallScore: 100, grade: 'clean', wordCount: 0 };
  }

  const doc = nlp(text);

  // Adverbs (-ly words)
  const adverbs: string[] = [];
  const seen = new Set<string>();
  doc.adverbs().forEach((a: { text: () => string }) => {
    const w = a.text().toLowerCase().trim();
    if (w.endsWith('ly') && w.length > 3 && !seen.has(w)) {
      adverbs.push(w);
      seen.add(w);
    }
  });

  // Passive voice: "was/were/is/are + past participle"
  let passiveVoiceCount = 0;
  const sentences = doc.sentences().json() as Array<{ text: string }>;
  for (const s of sentences) {
    if (/\b(was|were|is|are|been|being)\s+\w+ed\b/i.test(s.text)) passiveVoiceCount++;
  }

  // Weak verbs
  let weakVerbCount = 0;
  doc.verbs().forEach((v: { text: () => string }) => {
    if (WEAK_VERBS.has(v.text().toLowerCase().trim())) weakVerbCount++;
  });

  // Complex sentences (> 30 words)
  const complexSentenceCount = sentences.filter(s =>
    s.text.trim().split(/\s+/).length > 30
  ).length;

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Score: start at 100, deduct for issues relative to word count
  const adverbRate = wordCount > 0 ? (adverbs.length / wordCount) * 100 : 0;
  const passiveRate = sentences.length > 0 ? (passiveVoiceCount / sentences.length) * 100 : 0;
  const complexRate = sentences.length > 0 ? (complexSentenceCount / sentences.length) * 100 : 0;

  let score = 100;
  score -= Math.min(25, adverbRate * 5);
  score -= Math.min(25, passiveRate * 1.5);
  score -= Math.min(25, complexRate * 2);
  score = Math.max(0, Math.round(score));

  const grade: StyleAnalysisResult['grade'] =
    score >= 75 ? 'clean' : score >= 50 ? 'moderate' : 'wordy';

  return { adverbs, passiveVoiceCount, weakVerbCount, complexSentenceCount, overallScore: score, grade, wordCount };
}

export function analyzePovTense(html: string): PovTenseResult {
  const text = stripHtml(html);
  if (!text.trim()) {
    return {
      dominantPov: 'unknown', dominantTense: 'unknown',
      firstPersonCount: 0, secondPersonCount: 0, thirdPersonCount: 0,
      pastVerbCount: 0, presentVerbCount: 0, inconsistencies: [],
    };
  }

  // Simple token-based counting (faster and more reliable than NLP tagging for pronouns)
  const words = text.toLowerCase().match(/\b\w+\b/g) ?? [];

  const first  = new Set(['i', 'me', 'my', 'mine', 'myself', 'we', 'us', 'our', 'ours', 'ourselves']);
  const second = new Set(['you', 'your', 'yours', 'yourself', 'yourselves']);
  const third  = new Set(['he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'they', 'them', 'their', 'theirs', 'themselves', 'it', 'its', 'itself']);

  let firstPersonCount = 0, secondPersonCount = 0, thirdPersonCount = 0;
  for (const w of words) {
    if (first.has(w))  firstPersonCount++;
    if (second.has(w)) secondPersonCount++;
    if (third.has(w))  thirdPersonCount++;
  }

  const counts = [firstPersonCount, secondPersonCount, thirdPersonCount];
  const maxCount = Math.max(...counts);
  let dominantPov: PovTenseResult['dominantPov'] = 'unknown';
  if (maxCount > 0) {
    if (maxCount === firstPersonCount)  dominantPov = 'first';
    else if (maxCount === secondPersonCount) dominantPov = 'second';
    else dominantPov = 'third';
  }

  // Tense detection via compromise
  const doc = nlp(text);
  const pastVerbCount   = (doc.verbs().toPastTense() as { length: number }).length;
  const presentVerbCount = (doc.verbs().toPresentTense() as { length: number }).length;
  const dominantTense: PovTenseResult['dominantTense'] =
    pastVerbCount === 0 && presentVerbCount === 0 ? 'unknown' :
    pastVerbCount >= presentVerbCount ? 'past' : 'present';

  // Detect tense inconsistencies per paragraph
  const inconsistencies: string[] = [];
  if (dominantTense !== 'unknown') {
    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 20);
    for (const para of paragraphs.slice(0, 20)) {
      const pDoc = nlp(para);
      const pPast    = (pDoc.verbs().toPastTense() as { length: number }).length;
      const pPresent = (pDoc.verbs().toPresentTense() as { length: number }).length;
      const pTense = pPast >= pPresent ? 'past' : 'present';
      if (pTense !== dominantTense && pPast + pPresent > 2) {
        const preview = para.trim().slice(0, 60) + (para.length > 60 ? '…' : '');
        inconsistencies.push(preview);
      }
    }
  }

  return {
    dominantPov, dominantTense,
    firstPersonCount, secondPersonCount, thirdPersonCount,
    pastVerbCount, presentVerbCount,
    inconsistencies: inconsistencies.slice(0, 5),
  };
}
