// src/components/analytics/WordGoalCard.tsx
'use client';

import { useState, useEffect, ChangeEvent, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Edit3, Save, AlertTriangle } from 'lucide-react';
import { useStoryContext, getWordGoalKey, getDocumentsStorageKey, getEditorContentKey, type DocumentItem } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';

interface EditorData {
    current: string;
}

const countWords = (htmlString: string): number => {
    if (!htmlString) return 0;
    const text = htmlString.replace(/<[^>]*>/g, ' ').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
};


function collectFileItems(items: DocumentItem[]): DocumentItem[] {
  const result: DocumentItem[] = [];
  for (const item of items) {
    if (item.type === 'file' || item.type === 'scene') result.push(item);
    if (item.children) result.push(...collectFileItems(item.children));
  }
  return result;
}

const getTotalWordCount = async (storyId: string, userId: string): Promise<number> => {
    const documentsKey = getDocumentsStorageKey(storyId, userId);
    const documents = await storage.getItem<DocumentItem[]>(documentsKey) || [];
    const fileItems = collectFileItems(documents);
    const results = await Promise.all(
      fileItems.map(item => storage.getItem<EditorData>(getEditorContentKey(storyId, item.id, userId)))
    );
    return results.reduce((total, editorData) => total + (editorData?.current ? countWords(editorData.current) : 0), 0);
  };

export function WordGoalCard() {
  const { t } = useLanguage();
  const { activeStoryId } = useStoryContext();
  const { user } = useAuth();
  
  const wordGoalStorageKey = getWordGoalKey(activeStoryId, user?.uid);

  const [goal, setGoal] = useState<number>(50000);
  const [currentWords, setCurrentWords] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(goal.toString());
  const [isMounted, setIsMounted] = useState(false);


  const updateCurrentWords = useCallback(async () => {
    if (activeStoryId && user?.uid) {
        const words = await getTotalWordCount(activeStoryId, user.uid);
        setCurrentWords(words);
    } else {
        setCurrentWords(0);
    }
  }, [activeStoryId, user?.uid]);

  useEffect(() => {
    setIsMounted(true);
    if (activeStoryId && user?.uid) {
      storage.getItem<string>(wordGoalStorageKey).then(savedGoal => {
        if (savedGoal) {
          const numGoal = parseInt(savedGoal, 10);
          setGoal(numGoal);
          setInputValue(numGoal.toString());
        } else {
          setGoal(50000);
          setInputValue("50000");
        }
      });
      updateCurrentWords();
    } else if (!activeStoryId) {
      setGoal(50000);
      setInputValue("50000");
      setCurrentWords(0);
    }
  }, [activeStoryId, wordGoalStorageKey, user?.uid, updateCurrentWords]);

  useEffect(() => {
    if (goal > 0) {
      setProgress(Math.min((currentWords / goal) * 100, 100));
    } else {
      setProgress(0);
    }
  }, [currentWords, goal]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        // A bit broad, but if any story-related doc changes, re-calc word count
      if (event.key?.startsWith(`openwritingkit-story-${activeStoryId}`)) {
        updateCurrentWords();
      }
      if (event.key === wordGoalStorageKey) {
         const newGoal = parseInt(event.newValue || '50000', 10);
         setGoal(newGoal);
         setInputValue(newGoal.toString());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [wordGoalStorageKey, activeStoryId, updateCurrentWords]);

  const handleGoalChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSetGoal = () => {
    if (!activeStoryId) return;
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setGoal(numValue);
      storage.setItem(wordGoalStorageKey, numValue.toString());
      setIsEditingGoal(false);
    } else {
      setInputValue(goal.toString());
    }
  };

  if (!isMounted) return null;

  if (!activeStoryId) {
     return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle>{t('word_goal.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            {t('word_goal.no_story_desc')}
          </div>
           <Link href="/stories" passHref className="mt-2">
            <Button variant="link" className="p-0">{t('word_goal.go_to_stories')}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle>{t('word_goal.title')}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditingGoal(!isEditingGoal)} title={isEditingGoal ? t('common.save') : t('common.edit')}>
            {isEditingGoal ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
          </Button>
        </div>
        <CardDescription>{t('word_goal.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditingGoal ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={inputValue}
              onChange={handleGoalChange}
              placeholder={t('word_goal.placeholder')}
              min="1"
            />
            <Button onClick={handleSetGoal}>{t('word_goal.set_button')}</Button>
          </div>
        ) : (
          <p className="text-2xl font-semibold">
            {t('word_goal.goal_prefix')} {goal.toLocaleString()} {t('word_goal.words')}
          </p>
        )}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>{t('word_goal.progress')}</span>
            <span>{currentWords.toLocaleString()} / {goal.toLocaleString()} {t('word_goal.words')}</span>
          </div>
          <Progress value={progress} className="w-full h-3" />
          <p className="text-right text-sm text-primary font-semibold mt-1">{t('word_goal.complete', { progress: progress.toFixed(0) })}</p>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">{t('word_goal.footer')}</p>
      </CardFooter>
    </Card>
  );
}
