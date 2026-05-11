// src/app/(app)/analytics/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, AlertTriangle, ScanText, Loader2, BookOpen, MessageSquare, Gauge } from "lucide-react";
import { WordGoalCard } from "@/components/analytics/WordGoalCard";
import { DeadlineCard } from "@/components/analytics/DeadlineCard";
import { useEffect, useState, useCallback } from "react";
import { useStoryContext, getDocumentsStorageKey, getEditorContentKey, type DocumentItem } from "@/contexts/StoryContext";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { storage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  computeDialogueMetrics, computeVocabularyRichness, computeReadability,
  computeChapterStats, stripHtml,
} from "@/lib/text-analytics";

interface ActivityLogEntry {
  timestamp: string;
  wordCount: number;
  docId: string | null;
}

interface EditorData { current: string }

function getDailyActivity(log: ActivityLogEntry[]): Array<{ date: string; saves: number }> {
  const map = new Map<string, number>();
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const e of log) {
    const date = e.timestamp.slice(0, 10);
    if (map.has(date)) map.set(date, (map.get(date) ?? 0) + 1);
  }
  return [...map.entries()].map(([date, saves]) => ({ date: date.slice(5), saves }));
}

function getHourlyActivity(log: ActivityLogEntry[]): Array<{ hour: string; saves: number }> {
  const counts = new Array(24).fill(0);
  for (const e of log) counts[new Date(e.timestamp).getHours()]++;
  return counts.map((saves, h) => ({ hour: `${String(h).padStart(2, '0')}h`, saves }));
}

async function loadAllDocText(storyId: string, userId: string, docs: DocumentItem[]): Promise<string> {
  let html = '';
  const collect = async (items: DocumentItem[]) => {
    for (const item of items) {
      if (item.type === 'file' || item.type === 'scene') {
        const data = await storage.getItem<EditorData>(getEditorContentKey(storyId, item.id, userId));
        if (data?.current) html += ' ' + data.current;
      }
      if (item.children) await collect(item.children);
    }
  };
  await collect(docs);
  return html;
}

function getAllDocItems(items: DocumentItem[]): DocumentItem[] {
  const result: DocumentItem[] = [];
  for (const item of items) {
    if (item.type !== 'folder') result.push(item);
    if (item.children) result.push(...getAllDocItems(item.children));
  }
  return result;
}

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeStoryId, activeStoryName, getActivityLogKey } = useStoryContext();
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [docItems, setDocItems] = useState<DocumentItem[]>([]);

  // Deep-scan state
  const [scanning, setScanning] = useState(false);
  const [deepResult, setDeepResult] = useState<{
    dialogue: ReturnType<typeof computeDialogueMetrics>;
    vocab: ReturnType<typeof computeVocabularyRichness>;
    readability: ReturnType<typeof computeReadability>;
  } | null>(null);

  const activityLogStorageKey = getActivityLogKey(activeStoryId, user?.uid);

  const loadData = useCallback(async () => {
    if (activityLogStorageKey) {
      const log = await storage.getItem<ActivityLogEntry[]>(activityLogStorageKey);
      setActivityLog(log ?? []);
    } else {
      setActivityLog([]);
    }
    if (activeStoryId && user) {
      const docs = await storage.getItem<DocumentItem[]>(getDocumentsStorageKey(activeStoryId, user.uid));
      setDocItems(getAllDocItems(docs ?? []));
    }
    setIsMounted(true);
  }, [activityLogStorageKey, activeStoryId, user]);

  useEffect(() => {
    loadData();
    const handler = (e: Event) => {
      const key = (e as CustomEvent).detail?.key;
      if (key === activityLogStorageKey) loadData();
    };
    window.addEventListener('storage-change', handler);
    return () => window.removeEventListener('storage-change', handler);
  }, [loadData, activityLogStorageKey]);

  const handleDeepScan = useCallback(async () => {
    if (!activeStoryId || !user) return;
    setScanning(true);
    try {
      const docs = await storage.getItem<DocumentItem[]>(getDocumentsStorageKey(activeStoryId, user.uid));
      const html = await loadAllDocText(activeStoryId, user.uid, docs ?? []);
      const plain = stripHtml(html);
      setDeepResult({
        dialogue: computeDialogueMetrics(plain),
        vocab: computeVocabularyRichness(plain),
        readability: computeReadability(plain),
      });
    } finally {
      setScanning(false);
    }
  }, [activeStoryId, user]);

  if (!isMounted) return null;

  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
            {t('analytics.no_active_story_title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('analytics.no_active_story_desc_1')}{' '}
            <Link href="/stories" className="text-primary hover:underline">{t('analytics.no_active_story_desc_2')}</Link>{' '}
            {t('analytics.no_active_story_desc_3')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const dailyData = getDailyActivity(activityLog);
  const hourlyData = getHourlyActivity(activityLog);
  const chapterWords = docItems.filter(d => d.words && d.words > 0).map(d => ({ name: d.name.slice(0, 18), words: d.words ?? 0 }));
  const chapterStats = computeChapterStats(chapterWords.map(c => c.words));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('analytics.title')}</h1>
        <p className="text-muted-foreground">
          {t('analytics.description')}{' '}
          <span className="font-semibold text-primary">{activeStoryName ?? ''}</span>
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <WordGoalCard />
        <DeadlineCard />
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.productive_times.title')}</CardTitle>
            <CardDescription>{t('analytics.productive_times.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{calculateProductiveTimes(activityLog, t)}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('analytics.productive_times.footer')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity charts */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('analytics.charts.section_title')}</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('analytics.charts.daily_title')}</CardTitle>
              <CardDescription>{t('analytics.charts.daily_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="saves" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} name={t('analytics.charts.saves_label')} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('analytics.charts.hourly_title')}</CardTitle>
              <CardDescription>{t('analytics.charts.hourly_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="saves" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} name={t('analytics.charts.saves_label')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chapter length distribution */}
      {chapterWords.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t('analytics.chapters.section_title')}</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('analytics.chapters.chart_title')}</CardTitle>
              <CardDescription>
                {t('analytics.chapters.avg')}: {chapterStats.avg.toLocaleString()} · {t('analytics.chapters.min')}: {chapterStats.min.toLocaleString()} · {t('analytics.chapters.max')}: {chapterStats.max.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={Math.min(40 * chapterWords.length + 40, 300)}>
                <BarChart layout="vertical" data={chapterWords.slice(0, 20)} margin={{ top: 5, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => [v.toLocaleString(), t('analytics.chapters.words_label')]} />
                  <Bar dataKey="words" fill="hsl(var(--primary))" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Deep analysis */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('analytics.deep.section_title')}</h2>
          <Button variant="outline" size="sm" onClick={handleDeepScan} disabled={scanning}>
            {scanning
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('analytics.deep.scanning')}</>
              : <><ScanText className="mr-2 h-4 w-4" />{t('analytics.deep.scan_button')}</>}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{t('analytics.deep.description')}</p>

        {deepResult ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {t('analytics.general.dialogue_ratio_title')}
                </CardTitle>
                <CardDescription>{t('analytics.general.dialogue_ratio_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{Math.round(deepResult.dialogue.dialogueRatio * 100)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('analytics.deep.dialogue_style')}: {deepResult.dialogue.detectedStyle}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {t('analytics.advanced.vocabulary_richness_title')}
                </CardTitle>
                <CardDescription>{t('analytics.advanced.vocabulary_richness_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{deepResult.vocab.uniqueWords.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('analytics.deep.unique_words')} · TTR {(deepResult.vocab.ttr * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  {t('analytics.general.reading_difficulty_title')}
                </CardTitle>
                <CardDescription>{t('analytics.general.reading_difficulty_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{deepResult.readability.ease}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {deepResult.readability.scoreDescription} · {t('analytics.deep.grade')} {deepResult.readability.grade}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
            <ScanText className="mx-auto h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">{t('analytics.deep.empty_state')}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function calculateProductiveTimes(log: ActivityLogEntry[], t: (k: never) => string): string {
  if (!log.length) return t('analytics.productive_times.no_activity' as never);
  const today = new Date().toISOString().slice(0, 10);
  const todayEntries = log.filter(e => e.timestamp.startsWith(today));
  if (!todayEntries.length) return t('analytics.productive_times.no_activity' as never);

  const byHour: Record<number, number> = {};
  for (const e of todayEntries) byHour[new Date(e.timestamp).getHours()] = (byHour[new Date(e.timestamp).getHours()] ?? 0) + 1;
  const bestHour = Object.entries(byHour).sort(([, a], [, b]) => b - a)[0];
  const h = Number(bestHour[0]);
  return (t as (k: string, p?: object) => string)('analytics.productive_times.most_active', {
    start_hour: String(h).padStart(2, '0'),
    end_hour: String(h + 1).padStart(2, '0'),
    saves: bestHour[1],
  });
}
