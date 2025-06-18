// src/components/analytics/WordGoalCard.tsx
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Edit3, Save } from 'lucide-react';

const WORD_GOAL_KEY = 'linguaflow-word-goal';
const EDITOR_CONTENT_KEY = 'linguaflow-editor-content'; // Assuming this is where editor content is saved

export function WordGoalCard() {
  const [goal, setGoal] = useState<number>(1000);
  const [currentWords, setCurrentWords] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(goal.toString());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load goal from localStorage
      const savedGoal = localStorage.getItem(WORD_GOAL_KEY);
      if (savedGoal) {
        const numGoal = parseInt(savedGoal, 10);
        setGoal(numGoal);
        setInputValue(numGoal.toString());
      }

      // Load current words from localStorage (editor content)
      const editorContentRaw = localStorage.getItem(EDITOR_CONTENT_KEY);
      if (editorContentRaw) {
        try {
          const editorContent = JSON.parse(editorContentRaw) as string;
          const words = editorContent.trim() ? editorContent.trim().split(/\s+/).filter(w => w.length > 0) : [];
          setCurrentWords(words.length);
        } catch (e) {
          setCurrentWords(0);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (goal > 0) {
      setProgress(Math.min((currentWords / goal) * 100, 100));
    } else {
      setProgress(0);
    }
  }, [currentWords, goal]);

  // Listen to storage changes to update current words if editor content changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === EDITOR_CONTENT_KEY && event.newValue) {
        try {
          const editorContent = JSON.parse(event.newValue) as string;
          const words = editorContent.trim() ? editorContent.trim().split(/\s+/).filter(w => w.length > 0) : [];
          setCurrentWords(words.length);
        } catch (e) {
          setCurrentWords(0);
        }
      } else if (event.key === EDITOR_CONTENT_KEY && !event.newValue) {
        setCurrentWords(0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleGoalChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSetGoal = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setGoal(numValue);
      localStorage.setItem(WORD_GOAL_KEY, numValue.toString());
      setIsEditingGoal(false);
    } else {
      // Handle invalid input, maybe show a toast
      setInputValue(goal.toString()); // Reset to current valid goal
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle>Word Count Goal</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsEditingGoal(!isEditingGoal)}>
            {isEditingGoal ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
          </Button>
        </div>
        <CardDescription>Set a target and track your writing progress.</CardDescription>
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
        <p className="text-xs text-muted-foreground">Your goal is saved in your browser.</p>
      </CardFooter>
    </Card>
  );
}
