// src/app/(app)/analytics/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, BookOpen, Users, FileText, Percent, TrendingUp, CalendarClock, AlertTriangle, AlignLeft, SpellCheck2, GitMerge } from "lucide-react"; 
import Image from "next/image";
import { WordGoalCard } from "@/components/analytics/WordGoalCard";
import { useEffect, useState, useCallback } from "react";
import { useStoryContext } from "@/contexts/StoryContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { storage } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";

interface InsightCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  value?: string;
  unit?: string;
  children?: React.ReactNode;
  comingSoon?: boolean;
}

interface ActivityLogEntry {
  timestamp: string;
  wordCount: number;
}

function InsightCard({ title, description, icon: Icon, value, unit, children, comingSoon }: InsightCardProps) {
  const { t } = useLanguage();
  return (
    <Card className={cn(comingSoon && "opacity-70")}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-1">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {value && !children && (
          <p className="text-3xl font-bold">
            {value} <span className="text-lg text-muted-foreground">{unit}</span>
          </p>
        )}
        {children && <div>{children}</div>}
        {!value && !children && !comingSoon && (
          <p className="text-muted-foreground">{t('analytics.no_data')}</p>
        )}
        {comingSoon && (
          <p className="text-sm text-primary font-semibold">{t('common.coming_soon')}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeStoryId, activeStoryName, getActivityLogKey } = useStoryContext();
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const activityLogStorageKey = getActivityLogKey();

  const loadActivityLog = useCallback(async () => {
    if (activityLogStorageKey) {
      const storedLog = await storage.getItem<ActivityLogEntry[]>(activityLogStorageKey);
      setActivityLog(storedLog || []);
    } else {
      setActivityLog([]);
    }
  }, [activityLogStorageKey]);
  
  useEffect(() => {
    setIsMounted(true);
    loadActivityLog();

    const handleStorageChange = (event: Event) => {
        // This is a custom event dispatched from useAutosave
        if ((event as CustomEvent).detail?.key === activityLogStorageKey) {
            loadActivityLog();
        }
    };
    window.addEventListener('storage-change', handleStorageChange);

    return () => {
        window.removeEventListener('storage-change', handleStorageChange);
    };

  }, [loadActivityLog, activityLogStorageKey]);


  const getTodayISOString = () => new Date().toISOString().split('T')[0];

  const calculateWordCountTrends = () => {
    if (!activeStoryId) return t('analytics.word_count_today.no_story');
    const todayISO = getTodayISOString();
    const todayEntries = activityLog.filter(entry => entry.timestamp.startsWith(todayISO));
    
    if (todayEntries.length === 0) return t('analytics.word_count_today.no_words');

    // This is a simplified calculation. A more complex one would track net words added.
    // For now, let's show the highest word count recorded today.
    const maxWordCountToday = todayEntries.reduce((max, entry) => Math.max(max, entry.wordCount), 0);
    return t('analytics.word_count_today.words_recorded', { count: maxWordCountToday.toLocaleString() });
  };

  const calculateProductiveTimes = () => {
    if (!activeStoryId) return t('analytics.productive_times.no_story');
    const todayISO = getTodayISOString();
    const todayEntries = activityLog.filter(entry => entry.timestamp.startsWith(todayISO));

    if (todayEntries.length === 0) return t('analytics.productive_times.no_activity');

    const savesByHour: Record<string, number> = {};
    todayEntries.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      savesByHour[hour] = (savesByHour[hour] || 0) + 1; 
    });

    let mostActiveHour = -1;
    let maxSaves = 0;
    for (const hour in savesByHour) {
      if (savesByHour[hour] > maxSaves) {
        maxSaves = savesByHour[hour];
        mostActiveHour = parseInt(hour, 10);
      }
    }
    if(mostActiveHour === -1) return t('analytics.productive_times.not_enough_data');
    
    return t('analytics.productive_times.most_active', { 
        start_hour: mostActiveHour.toString().padStart(2, '0'), 
        end_hour: (mostActiveHour + 1).toString().padStart(2,'0'), 
        saves: maxSaves.toString() 
    });
  };


  const advancedInsights = [
    { title: t('analytics.advanced.writing_pattern_title'), description: t('analytics.advanced.writing_pattern_desc'), icon: AlignLeft, comingSoon: true },
    { title: t('analytics.advanced.vocabulary_richness_title'), description: t('analytics.advanced.vocabulary_richness_desc'), icon: SpellCheck2, comingSoon: true },
    { title: t('analytics.advanced.narrative_pacing_title'), description: t('analytics.advanced.narrative_pacing_desc'), icon: GitMerge, comingSoon: true },
  ];
  
  const generalInsights = [
    { title: t('analytics.general.dialogue_ratio_title'), description: t('analytics.general.dialogue_ratio_desc'), icon: Users, value: "N/A", unit: t('analytics.general.analysis_pending') },
    { title: t('analytics.general.chapter_length_title'), description: t('analytics.general.chapter_length_desc'), icon: FileText, value: "N/A", unit: t('analytics.general.analysis_pending') },
    { title: t('analytics.general.reading_difficulty_title'), description: t('analytics.general.reading_difficulty_desc'), icon: Percent, value: "N/A", unit: t('analytics.general.analysis_pending') },
  ];


  if (!isMounted) return null; 

  if (!activeStoryId && isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('analytics.no_active_story_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('analytics.no_active_story_desc_1')} <Link href="/stories" className="text-primary hover:underline">{t('analytics.no_active_story_desc_2')}</Link> {t('analytics.no_active_story_desc_3')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('analytics.title')}</h1>
        <p className="text-muted-foreground">{t('analytics.description')} <span className="font-semibold text-primary">{activeStoryName || ''}</span></p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <WordGoalCard /> 
        <InsightCard title={t('analytics.word_count_today.title')} description={t('analytics.word_count_today.description')} icon={TrendingUp}>
           <p className="text-2xl font-bold">{calculateWordCountTrends()}</p>
           <p className="text-xs text-muted-foreground mt-1">{t('analytics.word_count_today.footer')}</p>
        </InsightCard>
        <InsightCard title={t('analytics.productive_times.title')} description={t('analytics.productive_times.description')} icon={CalendarClock}>
           <p className="text-2xl font-bold">{calculateProductiveTimes()}</p>
           <p className="text-xs text-muted-foreground mt-1">{t('analytics.productive_times.footer')}</p>
        </InsightCard>
      </div>
      
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">{t('analytics.advanced.section_title')}</h2>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {advancedInsights.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
            ))}
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">{t('analytics.general.section_title')}</h2>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generalInsights.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
            ))}
        </div>
      </div>

      <Card className="mt-12">
        <CardHeader>
          <CardTitle>{t('analytics.overall_progress.title')}</CardTitle>
          <CardDescription>{t('analytics.overall_progress.description')}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
           <Image src="/comingsoon.svg" alt="Illustration of building site with the words 'coming soon'." width={800} height={300} className="mx-auto rounded-md dark:invert max-w-sm w-full" />
          <p className="text-muted-foreground mt-4">{t('analytics.overall_progress.footer')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
