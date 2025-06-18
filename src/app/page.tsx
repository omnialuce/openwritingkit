
// src/app/page.tsx
'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookText, Cpu, BarChart3, FolderOpen, TrendingUp, CalendarDays } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Define new localStorage keys
const LAST_ACTIVE_DATE_KEY = 'openwriting-kit-last-active-date';
const WRITING_STREAK_KEY = 'openwriting-kit-writing-streak';
const LAST_STREAK_DATE_KEY = 'openwriting-kit-last-streak-date';

export default function DashboardPage() {
  const [writingStreak, setWritingStreak] = useState(0);

  const updateStreakDisplay = () => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDateStr = localStorage.getItem(LAST_ACTIVE_DATE_KEY);
      const storedStreak = parseInt(localStorage.getItem(WRITING_STREAK_KEY) || '0', 10);
      const lastStreakUpdateDate = localStorage.getItem(LAST_STREAK_DATE_KEY);

      if (lastStreakUpdateDate === today) {
        // Streak was updated today (likely by useAutosave)
        setWritingStreak(storedStreak);
      } else {
        // Streak not updated today, check if it should be reset
        if (lastActiveDateStr) {
          const lastActiveDate = new Date(lastActiveDateStr);
          const todayDate = new Date(today);
          
          const diffTime = todayDate.getTime() - lastActiveDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            // More than one day of inactivity, reset streak
            localStorage.setItem(WRITING_STREAK_KEY, '0');
            setWritingStreak(0);
          } else {
            // Activity was yesterday or earlier today, but streak not updated for *today*
            // rely on useAutosave to update it on first write.
            // For display, if it's a new day and no write yet, show stored streak.
            // If lastStreakUpdateDate wasn't today, but was yesterday, it means streak should continue.
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastStreakUpdateDate === yesterday.toISOString().split('T')[0]) {
               setWritingStreak(storedStreak); // Show yesterday's streak, will increment on write
            } else if (lastStreakUpdateDate !== today && lastActiveDateStr !== today) { 
              // If not updated today and not active today, means it should be 0 unless lastStreakUpdate was yesterday
               localStorage.setItem(WRITING_STREAK_KEY, '0');
               setWritingStreak(0);
            } else {
                 setWritingStreak(storedStreak); // Default to stored if not explicitly reset
            }
          }
        } else {
          // No last active date found, so streak is 0
          localStorage.setItem(WRITING_STREAK_KEY, '0');
          setWritingStreak(0);
        }
      }
    }
  };

  useEffect(() => {
    updateStreakDisplay(); // Initial load

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === WRITING_STREAK_KEY ||
        event.key === LAST_ACTIVE_DATE_KEY ||
        event.key === LAST_STREAK_DATE_KEY
      ) {
        updateStreakDisplay();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const quickActions = [
    { title: "New Document", description: "Start writing in the editor.", href: "/editor", icon: BookText, cta: "Open Editor" },
    { title: "AI Tools", description: "Explore creative writing prompts and analysis.", href: "/ai-tools", icon: Cpu, cta: "Use AI Tools" },
    { title: "My Documents", description: "Manage your saved work.", href: "/documents", icon: FolderOpen, cta: "View Documents" },
    { title: "Writing Analytics", description: "Track your progress and insights.", href: "/analytics", icon: BarChart3, cta: "See Analytics" },
  ];

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-none border">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to OpenWriting Kit</h1>
            <p className="text-lg text-foreground mb-6">
              Your intelligent writing companion. Unleash creativity, refine prose, and stay focused.
            </p>
            <Link href="/editor" passHref>
              <Button size="lg" className="rounded-none">
                Start Writing <ArrowRight className="ml-2 h-5 w-5" />
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
                  <Button variant="outline" className="w-full rounded-none">
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
              <CardTitle>Daily Writing Streak</CardTitle>
            </div>
            <CardDescription>Keep your momentum going!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-6xl font-bold text-primary">{writingStreak}</p>
              <p className="text-muted-foreground">{writingStreak === 1 ? "day" : "days"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border">
          <CardHeader>
             <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <CardTitle>Word Count Goal</CardTitle>
            </div>
            <CardDescription>Set and track your daily/weekly targets. (View in Analytics)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">
                <Link href="/analytics" passHref>
                    <Button variant="link">Set & View Goal in Analytics</Button>
                </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
