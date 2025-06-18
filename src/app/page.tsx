
// src/app/page.tsx
'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookText, Cpu, BarChart3, FolderOpen, TrendingUp, CalendarDays, BookOpenCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useStoryContext } from "@/contexts/StoryContext";

export default function DashboardPage() {
  const { activeStoryId, activeStoryName } = useStoryContext();
  const [writingStreak, setWritingStreak] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Streak logic will also need to be story-specific if we want per-story streaks
  // For now, this updates a global streak, but ideally, keys should be dynamic
  const updateStreakDisplay = () => {
    if (typeof window !== 'undefined' && activeStoryId) { // Only update streak if a story is active
      const today = new Date().toISOString().split('T')[0];
      // Story-specific keys for streak
      const lastActiveDateKey = `openwritingkit-story-${activeStoryId}-last-active-date`;
      const streakKey = `openwritingkit-story-${activeStoryId}-writing-streak`;
      const lastStreakDateKey = `openwritingkit-story-${activeStoryId}-last-streak-date`;

      const lastActiveDateStr = localStorage.getItem(lastActiveDateKey);
      const storedStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);
      const lastStreakUpdateDate = localStorage.getItem(lastStreakDateKey);

      if (lastStreakUpdateDate === today) {
        setWritingStreak(storedStreak);
      } else {
        if (lastActiveDateStr) {
          const lastActiveDate = new Date(lastActiveDateStr);
          const todayDate = new Date(today);
          
          const diffTime = todayDate.getTime() - lastActiveDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            localStorage.setItem(streakKey, '0');
            setWritingStreak(0);
          } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastStreakUpdateDate === yesterday.toISOString().split('T')[0]) {
               setWritingStreak(storedStreak);
            } else if (lastStreakUpdateDate !== today && lastActiveDateStr !== today) {
               localStorage.setItem(streakKey, '0');
               setWritingStreak(0);
            } else {
                 setWritingStreak(storedStreak);
            }
          }
        } else {
          localStorage.setItem(streakKey, '0');
          setWritingStreak(0);
        }
      }
    } else { // No active story, reset streak display
        setWritingStreak(0);
    }
  };

  useEffect(() => {
    setIsMounted(true); // Ensure client-side execution
    updateStreakDisplay(); 

    const handleStorageChange = (event: StorageEvent) => {
      if (!activeStoryId) return;
      const lastActiveDateKey = `openwritingkit-story-${activeStoryId}-last-active-date`;
      const streakKey = `openwritingkit-story-${activeStoryId}-writing-streak`;
      const lastStreakDateKey = `openwritingkit-story-${activeStoryId}-last-streak-date`;

      if (
        event.key === streakKey ||
        event.key === lastActiveDateKey ||
        event.key === lastStreakDateKey
      ) {
        updateStreakDisplay();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeStoryId]); // Rerun when activeStoryId changes

  useEffect(() => {
    // This effect is purely to update streak when activeStoryId changes
    // as the keys for localStorage depend on it.
    updateStreakDisplay();
  }, [activeStoryId]);


  const quickActions = [
    { title: "New Document", description: "Start writing in the editor.", href: "/editor", icon: BookText, cta: "Open Editor" },
    { title: "My Stories", description: "Manage your stories.", href: "/stories", icon: BookOpenCheck, cta: "View Stories"},
    { title: "AI Tools", description: "Explore creative writing prompts and analysis.", href: "/ai-tools", icon: Cpu, cta: "Use AI Tools" },
    // { title: "My Documents", description: "Manage your saved work.", href: "/documents", icon: FolderOpen, cta: "View Documents" },
    { title: "Writing Analytics", description: "Track your progress and insights.", href: "/analytics", icon: BarChart3, cta: "See Analytics" },
  ];
  
  if (!isMounted) return null; // Or a loading skeleton

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-none border">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
             <h1 className="text-4xl font-bold mb-4 text-primary">
              {activeStoryName ? `Working on: ${activeStoryName}` : "Welcome to OpenWriting Kit"}
            </h1>
            <p className="text-lg text-foreground mb-6">
              {activeStoryId 
                ? "Continue your writing journey or explore other tools." 
                : "Your intelligent writing companion. Select a story or create a new one to get started!"}
            </p>
            <Link href={activeStoryId ? "/editor" : "/stories"} passHref>
              <Button size="lg" className="rounded-none">
                {activeStoryId ? "Open Editor" : "Go to Stories"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="hidden md:block">
            <Image 
              src="https://placehold.co/500x300.png" 
              alt="OpenWriting Kit illustrative banner" 
              width={500} 
              height={300}
              className="rounded-none"
              data-ai-hint="minimalist abstract design"
            />
          </div>
        </div>
      </section>
      
      {!activeStoryId && (
         <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-primary" />
              <CardTitle className="text-xl text-primary">No Story Selected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Please select an existing story or create a new one to begin working. 
              Most features are disabled until a story is active.
            </p>
            <Link href="/stories" passHref>
              <Button variant="default">
                <BookOpenCheck className="mr-2 h-4 w-4" /> Go to Stories
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-md transition-shadow duration-300 rounded-none border">
              <CardHeader>
                <div className="flex items-start gap-3 mb-2">
                  <action.icon className="h-7 w-7 text-primary mt-1" />
                  <div>
                    <CardTitle className="text-xl">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter>
                <Link href={action.href} passHref className="w-full">
                  <Button variant="outline" className="w-full rounded-none" disabled={!activeStoryId && !['/stories', '/settings'].includes(action.href) && action.href !== '/'}>
                    {action.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-none border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" />
              <CardTitle>Daily Writing Streak {activeStoryId ? `(for ${activeStoryName})` : ''}</CardTitle>
            </div>
            <CardDescription>Keep your momentum going! Streak is per story.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-6xl font-bold text-primary">{activeStoryId ? writingStreak : "-"}</p>
              <p className="text-muted-foreground">{writingStreak === 1 ? "day" : "days"}</p>
            </div>
             {!activeStoryId && <p className="text-xs text-center text-muted-foreground mt-2">Select a story to see its streak.</p>}
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardHeader>
             <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <CardTitle>Word Count Goal {activeStoryId ? `(for ${activeStoryName})` : ''}</CardTitle>
            </div>
            <CardDescription>Set and track your daily/weekly targets. (View in Analytics)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-center py-4">
                <Link href="/analytics" passHref>
                    <Button variant="link" disabled={!activeStoryId}>Set & View Goal in Analytics</Button>
                </Link>
                {!activeStoryId && <p className="text-xs text-center text-muted-foreground mt-1">Select a story first.</p>}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
