
// src/app/(app)/page.tsx
'use client';

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ArrowRight, BookText, Cpu, BarChart3, FolderOpen, TrendingUp, CalendarDays, BookOpenCheck, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useStoryContext } from "@/contexts/StoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { t } = useLanguage();
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
    { title: t('dashboard.quick_actions.editor_title'), description: t('dashboard.quick_actions.editor_desc'), href: "/editor", icon: BookText, cta: t('dashboard.quick_actions.editor_cta') },
    { title: t('dashboard.quick_actions.stories_title'), description: t('dashboard.quick_actions.stories_desc'), href: "/stories", icon: BookOpenCheck, cta: t('dashboard.quick_actions.stories_cta')},
    { title: t('dashboard.quick_actions.ai_tools_title'), description: t('dashboard.quick_actions.ai_tools_desc'), href: "/ai-tools", icon: Cpu, cta: t('dashboard.quick_actions.ai_tools_cta') },
    { title: t('dashboard.quick_actions.analytics_title'), description: t('dashboard.quick_actions.analytics_desc'), href: "/analytics", icon: BarChart3, cta: t('dashboard.quick_actions.analytics_cta') },
  ];
  
  if (!isMounted) return null;

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-lg border">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
             <h1 className="text-4xl font-bold mb-4 text-primary">
              {activeStoryName ? `${t('dashboard.working_on')}: ${activeStoryName}` : `${t('dashboard.welcome')}, ${user?.email?.split('@')[0] || t('dashboard.writer')}`}
            </h1>
            <p className="text-lg text-foreground mb-6">
              {activeStoryId 
                ? t('dashboard.welcome_back_active')
                : t('dashboard.welcome_back_inactive')}
            </p>
            <Link href={activeStoryId ? "/editor" : "/stories"} passHref>
              <Button size="lg" className="rounded-md">
                {activeStoryId ? t('dashboard.open_editor') : t('dashboard.go_to_stories')} <ArrowRight className="ml-2 h-5 w-5" />
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
              <CardTitle className="text-xl text-primary">{t('dashboard.no_story_selected_title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {t('dashboard.no_story_selected_desc')}
            </p>
            <div className="flex flex-wrap gap-2">
                <Link href="/stories" passHref>
                  <Button variant="default">
                    <BookOpenCheck className="mr-2 h-4 w-4" /> {t('dashboard.go_to_stories')}
                  </Button>
                </Link>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="secondary">
                            <Info className="mr-2 h-4 w-4" /> {t('dashboard.how_to_use_button')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">{t('dashboard.how_to_use_title')}</DialogTitle>
                            <DialogDescription>
                                {t('dashboard.how_to_use_desc')}
                            </DialogDescription>
                        </DialogHeader>
                          <ScrollArea className="max-h-[70vh]">
                            <div className="space-y-4 py-4 pr-6 text-sm">
                                <div>
                                    <h3 className="font-semibold mb-2">{t('dashboard.how_to_use_features_title')}</h3>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        <li><span className="font-semibold text-foreground">{t('dashboard.how_to_use_feature_1_title')}:</span> {t('dashboard.how_to_use_feature_1_desc')}</li>
                                        <li><span className="font-semibold text-foreground">{t('dashboard.how_to_use_feature_2_title')}:</span> {t('dashboard.how_to_use_feature_2_desc')}</li>
                                        <li><span className="font-semibold text-foreground">{t('dashboard.how_to_use_feature_3_title')}:</span> {t('dashboard.how_to_use_feature_3_desc')}</li>
                                        <li><span className="font-semibold text-foreground">{t('dashboard.how_to_use_feature_4_title')}:</span> {t('dashboard.how_to_use_feature_4_desc')}</li>
                                        <li><span className="font-semibold text-foreground">{t('dashboard.how_to_use_feature_5_title')}:</span> {t('dashboard.how_to_use_feature_5_desc')}</li>
                                    </ul>
                                </div>
                                
                                <Alert variant="default" className="bg-primary/5 border-primary/20">
                                    <AlertTriangle className="h-4 w-4 text-primary" />
                                    <AlertDescription>
                                        <span className="font-semibold">{t('dashboard.how_to_use_beta_title')}:</span> {t('dashboard.how_to_use_beta_desc')}
                                    </AlertDescription>
                                </Alert>

                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <h4 className="font-bold mb-1">{t('dashboard.how_to_use_storage_title')}</h4>
                                        <p>{t('dashboard.how_to_use_storage_desc_1')}</p>
                                        <p className="mt-2">{t('dashboard.how_to_use_storage_desc_2')}</p>
                                    </AlertDescription>
                                </Alert>

                                <div className="flex justify-end pt-4">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                            {t('common.close')}
                                        </Button>
                                    </DialogClose>
                                </div>
                            </div>
                          </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {activeStoryId && isMounted && (
        <>
          <section>
            <h2 className="text-2xl font-semibold mb-6">{t('dashboard.quick_actions_title')}</h2>
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
                  <CardTitle>{t('dashboard.writing_streak_title')} {activeStoryName ? `(${t('common.for')} ${activeStoryName})` : ''}</CardTitle>
                </div>
                <CardDescription>{t('dashboard.writing_streak_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-6xl font-bold text-primary">{activeStoryId ? writingStreak : "-"}</p>
                  <p className="text-muted-foreground">{writingStreak === 1 ? t('dashboard.day') : t('dashboard.days')}</p>
                </div>
                 {!activeStoryId && <p className="text-xs text-center text-muted-foreground mt-2">{t('dashboard.select_story_for_streak')}</p>}
              </CardContent>
            </Card>
            <Card className="rounded-lg border">
              <CardHeader>
                 <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <CardTitle>{t('dashboard.word_goal_title')} {activeStoryName ? `(${t('common.for')} ${activeStoryName})` : ''}</CardTitle>
                </div>
                <CardDescription>{t('dashboard.word_goal_desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-center py-4">
                    <Link href="/analytics" passHref>
                        <Button variant="link" disabled={!activeStoryId}>{t('dashboard.word_goal_cta')}</Button>
                    </Link>
                    {!activeStoryId && <p className="text-xs text-center text-muted-foreground mt-1">{t('dashboard.select_story_for_goal')}</p>}
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
