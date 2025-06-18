// src/hooks/useAutosave.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

function useAutosave<T>(
  key: string,
  initialValue: T,
  saveInterval: number = 2000 // Default 2 seconds
): [T, (value: T) => void, boolean, () => void, Date | null] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  const saveValue = useCallback(
    (currentValue: T) => {
      if (typeof window !== 'undefined') {
        setIsSaving(true);
        try {
          const item = JSON.stringify(currentValue);
          window.localStorage.setItem(key, item);
          const now = new Date();
          setLastSavedTime(now);

          // For streak counter: update last active date on save
          const today = now.toISOString().split('T')[0];
          const lastActiveDate = localStorage.getItem('linguaflow-last-active-date');
          const currentStreak = parseInt(localStorage.getItem('linguaflow-writing-streak') || '0', 10);
          const lastStreakDate = localStorage.getItem('linguaflow-last-streak-date');

          if (lastActiveDate !== today) { // First save of a new day
            localStorage.setItem('linguaflow-last-active-date', today);
            
            // Update streak
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastStreakDate === yesterdayStr) { // Continued from yesterday
              localStorage.setItem('linguaflow-writing-streak', (currentStreak + 1).toString());
            } else { // New streak or first day
              localStorage.setItem('linguaflow-writing-streak', '1');
            }
            localStorage.setItem('linguaflow-last-streak-date', today);
            // Dispatch a storage event so dashboard updates if open
            window.dispatchEvent(new Event('storage'));
          }


        } catch (error) {
          console.error(`Error saving to localStorage key "${key}":`, error);
        } finally {
          setTimeout(() => setIsSaving(false), 500);
        }
      }
    },
    [key]
  );
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const storedItem = window.localStorage.getItem(key);
        // Only save if content has actually changed from what's in localStorage or if it's the initial non-empty value
        if (JSON.stringify(value) !== storedItem || (value !== initialValue && storedItem === null && JSON.stringify(value) !== JSON.stringify(initialValue))) {
           saveValue(value);
        }
      }
    }, saveInterval);

    return () => clearTimeout(handler);
  }, [value, saveInterval, saveValue, initialValue, key]);


  const clearSavedValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
        setValue(initialValue); 
        setLastSavedTime(null);
        // Optionally, clear related streak data if content is fully cleared
        // localStorage.removeItem('linguaflow-last-active-date');
        // localStorage.removeItem('linguaflow-writing-streak');
        // localStorage.removeItem('linguaflow-last-streak-date');
        // window.dispatchEvent(new Event('storage'));
        toast({ title: "Content Cleared", description: "The editor content has been cleared from local storage." });
      } catch (error) {
        console.error(`Error clearing localStorage key "${key}":`, error);
         toast({ title: "Error", description: "Could not clear content.", variant: "destructive" });
      }
    }
  }, [key, initialValue]);

  // Load last saved time on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
            // This doesn't store the actual save time, just that it exists.
            // For actual last saved time, it's updated on saveValue.
            // If you need to persist lastSavedTime itself, it'd need its own localStorage item.
        }
    }
  }, [key]);

  return [value, setValue, isSaving, clearSavedValue, lastSavedTime];
}

export default useAutosave;
