// src/app/page.tsx
'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookText, Cpu, BarChart3, FolderOpen, TrendingUp, CalendarDays } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardPage() {
  const [writingStreak, setWritingStreak] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDateStr = localStorage.getItem('linguaflow-last-active-date');
      let currentStreak = parseInt(localStorage.getItem('linguaflow-writing-streak') || '0', 10);

      if (lastActiveDateStr) {
        const lastActiveDate = new Date(lastActiveDateStr);
        const todayDate = new Date(today);
        
        const diffTime = todayDate.getTime() - lastActiveDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Last active was yesterday, increment streak
          // This logic should ideally be in editor when content is *actually* saved for the day
          // For now, this updates if they *visit* after being active yesterday.
          // A more robust way is to update streak when editor saves on a *new* day.
        } else if (diffDays > 1) {
          // Missed a day or more, reset streak
          currentStreak = 0;
        }
        // If diffDays is 0, they were active today, streak remains.
      } else {
        // No last active date, so streak is 0 (or 1 if they write today, handled in editor)
        currentStreak = 0;
      }
      
      // The actual increment of streak for *today's* activity happens in WritingArea.tsx
      // This useEffect primarily handles reset or maintaining based on past activity.
      // We fetch the potentially updated streak from local storage which might have been set by editor.
      const updatedStreak = parseInt(localStorage.getItem('linguaflow-writing-streak') || '0', 10);
      const lastActiveForStreak = localStorage.getItem('linguaflow-last-streak-date');

      if (lastActiveForStreak === today) {
         setWritingStreak(updatedStreak);
      } else if (lastActiveDateStr) {
        // If today is not the last streak date, but there was a last active date
        const lastActive = new Date(lastActiveDateStr);
        const todayD = new Date(today);
        const diff = Math.ceil((todayD.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        if (diff > 1) { // if last activity was more than a day ago, reset
          localStorage.setItem('linguaflow-writing-streak', '0');
          setWritingStreak(0);
        } else { // activity was yesterday or today, maintain from storage
           setWritingStreak(updatedStreak);
        }
      } else { // No activity at all
        localStorage.setItem('linguaflow-writing-streak', '0');
        setWritingStreak(0);
      }


      // This effect is tricky because streak increment should happen upon *writing*,
      // not just loading the dashboard. The editor now updates 'linguaflow-last-active-date'.
      // We'll refine streak logic. For now, read what editor might have set.
      const storedStreak = localStorage.getItem('linguaflow-writing-streak');
      const storedLastStreakDate = localStorage.getItem('linguaflow-last-streak-date');

      if (storedStreak) {
        if (storedLastStreakDate === today) {
          setWritingStreak(parseInt(storedStreak, 10));
        } else {
          // If last streak update was not today, check if yesterday was the last active date
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastActiveDateStr === yesterday.toISOString().split('T')[0]) {
            // Streak continues from yesterday but wasn't updated today yet.
            setWritingStreak(parseInt(storedStreak, 10));
          } else if (lastActiveDateStr !== today) {
            // If not active today and last activity wasn't yesterday, reset.
            localStorage.setItem('linguaflow-writing-streak', '0');
            setWritingStreak(0);
          }
        }
      }
    }
  }, []);

  // Effect to update streak if last active date changes to today
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const handleStorageChange = () => {
            const today = new Date().toISOString().split('T')[0];
            const lastActiveDateStr = localStorage.getItem('linguaflow-last-active-date');
            let currentStreak = parseInt(localStorage.getItem('linguaflow-writing-streak') || '0', 10);
            const lastStreakUpdateDate = localStorage.getItem('linguaflow-last-streak-date');

            if (lastActiveDateStr === today && lastStreakUpdateDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(todayDate.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastStreakUpdateDate === yesterdayStr || currentStreak === 0) { // If streak was from yesterday or reset
                    currentStreak++;
                }
                // else if it's a new day but not consecutive, it should be 1
                // This logic still needs to be robustly tied to "first save of the day"
                localStorage.setItem('linguaflow-writing-streak', currentStreak.toString());
                localStorage.setItem('linguaflow-last-streak-date', today);
                setWritingStreak(currentStreak);
            }
        };
        
        // Simplified: just read from storage on mount, assuming editor handles updates.
        const today = new Date().toISOString().split('T')[0];
        const storedStreak = localStorage.getItem('linguaflow-writing-streak') || '0';
        const lastStreakDate = localStorage.getItem('linguaflow-last-streak-date');

        if (lastStreakDate === today) {
            setWritingStreak(parseInt(storedStreak, 10));
        } else {
            // If it's a new day, check if the streak should be reset or continued
            const lastActiveDate = localStorage.getItem('linguaflow-last-active-date');
            if (lastActiveDate) {
                const lastActive = new Date(lastActiveDate);
                const todayDate = new Date(today);
                const diffDays = Math.ceil((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays > 1 && lastStreakDate !== new Date(new Date().setDate(todayDate.getDate()-1)).toISOString().split('T')[0] ) { // if last active was more than 1 day ago, and not yesterday's streak
                    setWritingStreak(0);
                    localStorage.setItem('linguaflow-writing-streak', '0');
                } else if (lastStreakDate) { // If there was a streak date, but not today, respect it
                     setWritingStreak(parseInt(localStorage.getItem('linguaflow-writing-streak') || '0', 10));
                }
            } else { // No activity
                 setWritingStreak(0);
                 localStorage.setItem('linguaflow-writing-streak', '0');
            }
        }


        window.addEventListener('storage', handleStorageChange); // Listen for changes from other tabs
        return () => window.removeEventListener('storage', handleStorageChange);
    }
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
            <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to LinguaFlow</h1>
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
              alt="LinguaFlow illustrative banner" 
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
            <CardDescription>Set and track your daily/weekly targets.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-4">Goal setting coming soon.</p>
            {/* Placeholder for goal setting and progress */}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
