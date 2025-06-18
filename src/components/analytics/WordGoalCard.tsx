
// src/components/analytics/WordGoalCard.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Edit3, Save, AlertTriangle } from 'lucide-react';
import { useStoryContext, getWordGoalKey, getEditorContentKey } from '@/contexts/StoryContext';
import Link from 'next/link';

interface DocumentData {
  current: string;
}

export function WordGoalCard() {
  const { activeStoryId } = useStoryContext();
  const wordGoalStorageKey = getWordGoalKey(activeStoryId);
  const editorDocStorageKey = getEditorContentKey(activeStoryId);

  const [goal, setGoal] = useState<number>(1000);
  const [currentWords, setCurrentWords] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(goal.toString());
  const [isMounted, setIsMounted] = useState(false);


  const updateCurrentWords = () => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const editorDocRaw = localStorage.getItem(editorDocStorageKey);
      if (editorDocRaw) {
        try {
          const docData = JSON.parse(editorDocRaw) as DocumentData;
          const editorContent = docData.current || "";
          const words = editorContent.trim() ? editorContent.trim().split(/\s+/).filter(w => w.length > 0) : [];
          setCurrentWords(words.length);
        } catch (e) {
          setCurrentWords(0);
          console.error("Error parsing editor document data for word goal:", e);
        }
      } else {
        setCurrentWords(0);
      }
    } else {
      setCurrentWords(0);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && activeStoryId) {
      const savedGoal = localStorage.getItem(wordGoalStorageKey);
      if (savedGoal) {
        const numGoal = parseInt(savedGoal, 10);
        setGoal(numGoal);
        setInputValue(numGoal.toString());
      } else {
        // Reset to default if no saved goal for this story
        setGoal(1000);
        setInputValue("1000");
      }
      updateCurrentWords(); 
    } else if (!activeStoryId) {
      // Reset when no story is active
      setGoal(1000);
      setInputValue("1000");
      setCurrentWords(0);
    }
  }, [activeStoryId, wordGoalStorageKey]); // Depend on activeStoryId and the derived key

  useEffect(() => {
    if (goal > 0) {
      setProgress(Math.min((currentWords / goal) * 100, 100));
    } else {
      setProgress(0);
    }
  }, [currentWords, goal]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Listen to changes on the specific story's editor content key
      if (event.key === editorDocStorageKey) {
        updateCurrentWords();
      }
      if (event.key === wordGoalStorageKey) {
         const newGoal = parseInt(event.newValue || '1000', 10);
         setGoal(newGoal);
         setInputValue(newGoal.toString());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [editorDocStorageKey, wordGoalStorageKey]); // Re-attach listener if key changes

  const handleGoalChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSetGoal = () => {
    if (!activeStoryId) return;
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setGoal(numValue);
      localStorage.setItem(wordGoalStorageKey, numValue.toString());
      setIsEditingGoal(false);
    } else {
      setInputValue(goal.toString()); 
    }
  };

  if (!isMounted) return null; // Or a loading skeleton

  if (!activeStoryId) {
     return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle>Word Count Goal</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Select a story to set and track word goals.
          </div>
           <Link href="/stories" passHref className="mt-2">
            <Button variant="link" className="p-0">Go to Stories</Button>
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
            <CardTitle>Word Count Goal</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditingGoal(!isEditingGoal)} title={isEditingGoal ? "Save Goal" : "Edit Goal"}>
            {isEditingGoal ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
          </Button>
        </div>
        <CardDescription>Set a target for the current story and track progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditingGoal ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={inputValue}
              onChange={handleGoalChange}
              placeholder="Enter word goal"
              min="1"
            />
            <Button onClick={handleSetGoal}>Set</Button>
          </div>
        ) : (
          <p className="text-2xl font-semibold">
            Goal: {goal.toLocaleString()} words
          </p>
        )}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Current Progress</span>
            <span>{currentWords.toLocaleString()} / {goal.toLocaleString()} words</span>
          </div>
          <Progress value={progress} className="w-full h-3" />
          <p className="text-right text-sm text-primary font-semibold mt-1">{progress.toFixed(0)}% complete</p>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Your goal is saved for this story in your browser.</p>
      </CardFooter>
    </Card>
  );
}
