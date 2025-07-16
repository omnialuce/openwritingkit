
// src/app/analytics/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, BookOpen, Users, FileText, Percent, TrendingUp, CalendarClock, AlertTriangle, AlignLeft, SpellCheck2, GitMerge } from "lucide-react"; 
import Image from "next/image";
import { WordGoalCard } from "@/components/analytics/WordGoalCard";
import { useEffect, useState } from "react";
import { useStoryContext, getActivityLogKey } from "@/contexts/StoryContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
          <p className="text-muted-foreground">Data will appear here once you start writing in the selected story.</p>
        )}
        {comingSoon && (
          <p className="text-sm text-primary font-semibold">Coming Soon</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { activeStoryId, activeStoryName } = useStoryContext(); // HOOK 1: Call once at the top
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]); // HOOK 2
  const [isMounted, setIsMounted] = useState(false); // HOOK 3

  useEffect(() => { // HOOK 4
    setIsMounted(true);
    if (typeof window !== 'undefined' && activeStoryId) {
      const activityLogStorageKey = getActivityLogKey(activeStoryId);
      const storedLog = localStorage.getItem(activityLogStorageKey);
      if (storedLog) {
        try {
          setActivityLog(JSON.parse(storedLog));
        } catch(e) {
          console.error("Failed to parse activity log:", e);
          setActivityLog([]);
        }
      } else {
        setActivityLog([]);
      }
    } else if (!activeStoryId) {
      setActivityLog([]);
    }
  }, [activeStoryId]);

  const getTodayISOString = () => new Date().toISOString().split('T')[0];

  const calculateWordCountTrends = () => {
    if (!activeStoryId) return "0 words (No story selected)";
    const todayISO = getTodayISOString();
    const todayEntries = activityLog.filter(entry => entry.timestamp.startsWith(todayISO));
    
    if (todayEntries.length === 0) return "0 words recorded today";

    const lastEntryToday = todayEntries[todayEntries.length - 1];
    return `${lastEntryToday.wordCount.toLocaleString()} words recorded in editor today`;
  };

  const calculateProductiveTimes = () => {
    if (!activeStoryId) return "No activity (No story selected)";
    const todayISO = getTodayISOString();
    const todayEntries = activityLog.filter(entry => entry.timestamp.startsWith(todayISO));

    if (todayEntries.length === 0) return "No activity logged today";

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
    if(mostActiveHour === -1) return "Not enough data for today."
    
    return `Most active: ${mostActiveHour.toString().padStart(2, '0')}:00 - ${(mostActiveHour + 1).toString().padStart(2,'0')}:00 (${maxSaves} save(s))`;
  };


  const advancedInsights = [
    { title: "Writing Pattern Analysis", description: "Analyze sentence length, common phrases, and writing habits.", icon: AlignLeft, comingSoon: true },
    { title: "Vocabulary Richness Analysis", description: "Assess the diversity and complexity of your word usage.", icon: SpellCheck2, comingSoon: true },
    { title: "Narrative Pacing & Structure Deep Dive", description: "Get detailed insights into your story's structural flow and tension.", icon: GitMerge, comingSoon: true },
  ];
  
  const generalInsights = [
    { title: "Dialogue Ratio", description: "Analyze dialogue vs. narrative balance.", icon: Users, value: "N/A", unit: "analysis pending" },
    { title: "Chapter Length Consistency", description: "Monitor the consistency of your chapter lengths.", icon: FileText, value: "N/A", unit: "analysis pending" },
    { title: "Reading Difficulty", description: "Gauge the readability of your text.", icon: Percent, value: "N/A", unit: "analysis pending" },
  ];


  if (!isMounted) return null; 

  if (!activeStoryId && isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> No Active Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select or create a story from the <Link href="/stories" className="text-primary hover:underline">Stories page</Link> to view analytics.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Writing Analytics & Insights</h1>
        <p className="text-muted-foreground">Understand your writing patterns for the current story: <span className="font-semibold text-primary">{activeStoryName || ''}</span></p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <WordGoalCard /> 
        <InsightCard title="Word Count Today" description="Words recorded in the editor today based on saves for this story." icon={TrendingUp}>
           <p className="text-2xl font-bold">{calculateWordCountTrends()}</p>
           <p className="text-xs text-muted-foreground mt-1">Based on auto-saves. More detailed daily/weekly trends coming soon.</p>
        </InsightCard>
        <InsightCard title="Productive Times Today" description="Hour with most saves in the editor today for this story." icon={CalendarClock}>
           <p className="text-2xl font-bold">{calculateProductiveTimes()}</p>
           <p className="text-xs text-muted-foreground mt-1">Based on auto-saves. Deeper analysis coming soon.</p>
        </InsightCard>
      </div>
      
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">Advanced Writing Insights (Coming Soon)</h2>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {advancedInsights.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
            ))}
        </div>
      </div>
      
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">General Writing Statistics (Coming Soon)</h2>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generalInsights.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
            ))}
        </div>
      </div>

      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Overall Progress Overview</CardTitle>
          <CardDescription>A visual summary of your writing journey for this story.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
           <Image src="comingsoon.svg" alt="Illustration of building site with the words 'coming soon'." width={800} height={300} className="mx-auto rounded-md" />
          <p className="text-muted-foreground mt-4">Detailed charts and graphs are coming soon to help you visualize your progress.</p>
        </CardContent>
      </Card>
    </div>
  );
}

