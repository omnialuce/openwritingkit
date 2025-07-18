
// src/app/(app)/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { ArrowRight, BookText, Cpu, BarChart3, FolderOpen, TrendingUp, CalendarDays, BookOpenCheck, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useStoryContext } from "@/contexts/StoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeStoryId, activeStoryName } = useStoryContext();
  const [writingStreak, setWritingStreak] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const updateStreakDisplay = useCallback(() => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDateKey = `openwritingkit-story-${activeStoryId}-last-active-date-${user.uid}`;
      const streakKey = `openwritingkit-story-${activeStoryId}-writing-streak-${user.uid}`;
      const lastStreakDateKey = `openwritingkit-story-${activeStoryId}-last-streak-date-${user.uid}`;

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
    } else {
        setWritingStreak(0);
    }
  }, [activeStoryId, user]);


  useEffect(() => {
    setIsMounted(true);
    if (activeStoryId) { // Only update streak if a story is active initially
        updateStreakDisplay();
    } else {
        setWritingStreak(0); // Reset streak if no story active on mount
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (!activeStoryId || !user) return;
      const lastActiveDateKey = `openwritingkit-story-${activeStoryId}-last-active-date-${user.uid}`;
      const streakKey = `openwritingkit-story-${activeStoryId}-writing-streak-${user.uid}`;
      const lastStreakDateKey = `openwritingkit-story-${activeStoryId}-last-streak-date-${user.uid}`;

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
  }, [activeStoryId, updateStreakDisplay, user]);


  const quickActions = [
    { title: "New Document", description: "Start writing in the editor.", href: "/editor", icon: BookText, cta: "Open Editor" },
    { title: "My Stories", description: "Manage your stories.", href: "/stories", icon: BookOpenCheck, cta: "View Stories"},
    { title: "AI Tools", description: "Explore creative writing prompts and analysis.", href: "/ai-tools", icon: Cpu, cta: "Use AI Tools" },
    { title: "Writing Analytics", description: "Track your progress and insights.", href: "/analytics", icon: BarChart3, cta: "See Analytics" },
  ];
  
  if (!isMounted) return null;

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-lg border">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
             <h1 className="text-4xl font-bold mb-4 text-primary">
              {activeStoryName ? `Working on: ${activeStoryName}` : `Welcome, ${user?.email?.split('@')[0] || 'Writer'}`}
            </h1>
            <p className="text-lg text-foreground mb-6">
              {activeStoryId 
                ? "Continue your writing journey or explore other tools." 
                : "Select a story or create a new one to get started!"}
            </p>
            <Link href={activeStoryId ? "/editor" : "/stories"} passHref>
              <Button size="lg" className="rounded-md">
                {activeStoryId ? "Open Editor" : "Go to Stories"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="flex justify-center items-center">
            <Image 
              src="/typewriter.svg" 
              alt="OpenWritingKit illustrative banner" 
              width={300} 
              height={300}
              className="rounded-md dark:invert"
            />
          </div>
        </div>
      </section>
      
      {!activeStoryId && isMounted && (
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
            <div className="flex flex-wrap gap-2">
                <Link href="/stories" passHref>
                  <Button variant="default">
                    <BookOpenCheck className="mr-2 h-4 w-4" /> Go to Stories
                  </Button>
                </Link>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="secondary">
                            <Info className="mr-2 h-4 w-4" /> How to Use This App
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">Welcome to OpenWritingKit!</DialogTitle>
                            <DialogDescription>
                                Here's a quick guide to get you started.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-grow pr-4 -mr-4">
                          <div className="space-y-4 py-4 text-sm">
                              <div>
                                  <h3 className="font-semibold mb-2">Main Features</h3>
                                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                      <li><span className="font-semibold text-foreground">Distraction-Free Editor:</span> A clean space to write your masterpiece.</li>
                                      <li><span className="font-semibold text-foreground">Story Organization:</span> Manage multiple stories, each with its own documents, characters, and outlines.</li>
                                      <li><span className="font-semibold text-foreground">Character Development:</span> Create detailed character profiles and sheets.</li>
                                      <li><span className="font-semibold text-foreground">Outline Builder:</span> Structure your narrative with a drag-and-drop outliner.</li>
                                      <li><span className="font-semibold text-foreground">AI-Powered Tools:</span> Get writing prompts, feedback, and analysis (opt-in required in Settings).</li>
                                  </ul>
                              </div>
                              
                               <Alert variant="default" className="bg-primary/5 border-primary/20">
                                  <AlertTriangle className="h-4 w-4 text-primary" />
                                  <AlertDescription>
                                      <span className="font-semibold">Beta Release:</span> This is a preliminary release. Features may change and unexpected issues may occur. Your feedback is greatly appreciated!
                                  </AlertDescription>
                              </Alert>

                              <Alert variant="destructive">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription>
                                      <h4 className="font-bold mb-1">Important: How Your Data is Saved</h4>
                                      <p>By default, all your writing data (stories, characters, etc.) is stored **locally in your web browser only**. This means if you clear your browser's data, use a different browser, or switch devices, your work will be lost.</p>
                                      <p className="mt-2">To prevent data loss, please connect to Google Drive in the sidebar or **always save a backup copy** of your work elsewhere using the export features.</p>
                                  </AlertDescription>
                              </Alert>
                          </div>
                        </ScrollArea>
                        <DialogFooter className="pt-2 shrink-0">
                           <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {activeStoryId && isMounted && (
        <>
          <section>
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Card key={action.title} className="hover:shadow-md transition-shadow duration-300 rounded-lg border">
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
                      <Button variant="outline" className="w-full rounded-md" disabled={!activeStoryId && !['/stories', '/settings', '/ai-tools'].includes(action.href) }>
                        {action.cta} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-lg border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 text-primary" />
                  <CardTitle>Daily Writing Streak {activeStoryName ? `(for ${activeStoryName})` : ''}</CardTitle>
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
            <Card className="rounded-lg border">
              <CardHeader>
                 <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <CardTitle>Word Count Goal {activeStoryName ? `(for ${activeStoryName})` : ''}</CardTitle>
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
        </>
      )}
    </div>
  );
}
