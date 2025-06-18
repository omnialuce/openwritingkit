
// src/app/analytics/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, BookOpen, Users, FileText, Percent, TrendingUp, CalendarClock } from "lucide-react"; // Added TrendingUp, CalendarClock
import Image from "next/image";
import { WordGoalCard } from "@/components/analytics/WordGoalCard";
import { useEffect, useState } from "react";

interface InsightCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  value?: string;
  unit?: string;
  children?: React.ReactNode;
}

interface ActivityLogEntry {
  timestamp: string;
  wordCount: number;
}

const ACTIVITY_LOG_KEY = 'openwritingkit-activity-log';

function InsightCard({ title, description, icon: Icon, value, unit, children }: InsightCardProps) {
  return (
    <Card>
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
        {!value && !children && (
          <p className="text-muted-foreground">Data will appear here once you start writing.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLog = localStorage.getItem(ACTIVITY_LOG_KEY);
      if (storedLog) {
        setActivityLog(JSON.parse(storedLog));
      }
    }
  }, []);

  const getTodayISOString = () => new Date().toISOString().split('T')[0];

  const calculateWordCountTrends = () => {
    const todayISO = getTodayISOString();
    const todayEntries = activityLog.filter(entry => entry.timestamp.startsWith(todayISO));
    
    if (todayEntries.length === 0) return "0 words today";

    // Assuming each entry's wordCount is the total at that point for the current doc.
    // For "words written today", we'd ideally track diffs, but for simplicity:
    // Let's take the word count of the last entry today.
    // This is a simplification; true "words written today" would need more complex logic
    // if the user switches documents or clears content often.
    const lastEntryToday = todayEntries[todayEntries.length - 1];
    return `${lastEntryToday.wordCount.toLocaleString()} words recorded in editor today`;
  };

  const calculateProductiveTimes = () => {
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


  const insights = [
    // { title: "Word Count Trends", description: "Track your daily/weekly writing output.", icon: BarChart3, value: "1,200", unit: "words this week" },
    // { title: "Productive Times", description: "Discover when you write the most.", icon: Clock, value: "Evenings", unit: "" },
    { title: "Vocabulary Richness", description: "Assess the diversity of your word usage.", icon: BookOpen, value: "N/A", unit: "analysis pending" },
    { title: "Dialogue Ratio", description: "Analyze dialogue vs. narrative balance.", icon: Users, value: "N/A", unit: "analysis pending" },
    { title: "Chapter Length Consistency", description: "Monitor the consistency of your chapter lengths.", icon: FileText, value: "N/A", unit: "analysis pending" },
    { title: "Reading Difficulty", description: "Gauge the readability of your text.", icon: Percent, value: "N/A", unit: "analysis pending" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Writing Analytics & Insights</h1>
        <p className="text-muted-foreground">Understand your writing patterns and improve your craft.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <WordGoalCard /> 
        <InsightCard title="Word Count Today" description="Words recorded in the editor today based on saves." icon={TrendingUp}>
           <p className="text-2xl font-bold">{calculateWordCountTrends()}</p>
           <p className="text-xs text-muted-foreground mt-1">Based on auto-saves. More detailed daily/weekly trends coming soon.</p>
        </InsightCard>
        <InsightCard title="Productive Times Today" description="Hour with most saves in the editor today." icon={CalendarClock}>
           <p className="text-2xl font-bold">{calculateProductiveTimes()}</p>
           <p className="text-xs text-muted-foreground mt-1">Based on auto-saves. Deeper analysis coming soon.</p>
        </InsightCard>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">General Writing Statistics (Coming Soon)</h2>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
            <InsightCard key={insight.title} {...insight} />
            ))}
        </div>
      </div>

      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Overall Progress Overview</CardTitle>
          <CardDescription>A visual summary of your writing journey.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
           <Image src="https://placehold.co/800x300.png" data-ai-hint="monochrome data chart graph" alt="Progress chart placeholder" width={800} height={300} className="mx-auto rounded-md" />
          <p className="text-muted-foreground mt-4">Detailed charts and graphs are coming soon to help you visualize your progress.</p>
        </CardContent>
      </Card>
    </div>
  );
}
