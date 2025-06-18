
// src/hooks/useAutosave.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast'; // Keep for toast notifications

const MAX_HISTORY_LENGTH = 20; // Max number of versions to keep in history

interface DocumentData<T> {
  current: T;
  history: Array<{ timestamp: string; text: T }>;
  lastSaved: string | null;
}

function useAutosave<T extends string>( // Ensure T is a string for text content
  key: string, // e.g., 'openwriting-kit-active-document-content'
  initialValue: T,
  saveInterval: number = 2000
): [T, (value: T) => void, boolean, () => void, Date | null] {
  const { toast } = useToast(); // For notifications

  const [currentText, setCurrentTextInternal] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const data: DocumentData<T> = JSON.parse(item);
        return data.current || initialValue;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const data: DocumentData<T> = JSON.parse(item);
        return data.lastSaved ? new Date(data.lastSaved) : null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const saveDocument = useCallback(
    (textToSave: T) => {
      if (typeof window !== 'undefined') {
        setIsSaving(true);
        try {
          const now = new Date();
          const timestamp = now.toISOString();
          
          let documentData: DocumentData<T>;
          const existingItem = window.localStorage.getItem(key);
          if (existingItem) {
            documentData = JSON.parse(existingItem);
          } else {
            documentData = { current: initialValue, history: [], lastSaved: null };
          }

          // Add to history if different from latest history entry
          const latestHistoryEntry = documentData.history[0]?.text;
          if (textToSave !== latestHistoryEntry) {
            const newHistoryEntry = { timestamp, text: textToSave };
            documentData.history.unshift(newHistoryEntry);
            if (documentData.history.length > MAX_HISTORY_LENGTH) {
              documentData.history.pop();
            }
          }
          
          documentData.current = textToSave;
          documentData.lastSaved = timestamp;

          window.localStorage.setItem(key, JSON.stringify(documentData));
          setLastSavedTime(now);

          // Streak counter logic with new keys
          const today = now.toISOString().split('T')[0];
          const lastActiveDateKey = 'openwriting-kit-last-active-date';
          const streakKey = 'openwriting-kit-writing-streak';
          const lastStreakDateKey = 'openwriting-kit-last-streak-date';

          const lastActiveDate = localStorage.getItem(lastActiveDateKey);
          
          if (lastActiveDate !== today) { // First save of a new day
            localStorage.setItem(lastActiveDateKey, today);
            let currentStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);
            const lastStreakUpdateDate = localStorage.getItem(lastStreakDateKey);
            
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastStreakUpdateDate === yesterdayStr) { // Continued from yesterday
              currentStreak++;
            } else { // New streak or first day
              currentStreak = 1;
            }
            localStorage.setItem(streakKey, currentStreak.toString());
            localStorage.setItem(lastStreakDateKey, today);
            window.dispatchEvent(new Event('storage')); // Notify other tabs/components
          }
        } catch (error) {
          console.error(`Error saving to localStorage key "${key}":`, error);
          toast({ title: "Save Error", description: "Could not save changes.", variant: "destructive" });
        } finally {
          setTimeout(() => setIsSaving(false), 500); // UI feedback for saving
        }
      }
    },
    [key, initialValue, toast]
  );
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        let existingCurrentText = initialValue;
        if (item) {
          try {
            const data: DocumentData<T> = JSON.parse(item);
            existingCurrentText = data.current;
          } catch { /* ignore parse error, use initialValue */ }
        }
        if (currentText !== existingCurrentText || (currentText !== initialValue && !item) ) {
           saveDocument(currentText);
        }
      }
    }, saveInterval);

    return () => clearTimeout(handler);
  }, [currentText, saveInterval, saveDocument, key, initialValue]);

  const clearSavedDocument = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
        setCurrentTextInternal(initialValue); 
        setLastSavedTime(null);
        // Optionally clear streak if all content is removed - for now, streak is independent of specific doc clear
        toast({ title: "Content Cleared", description: "The document content and its history have been cleared." });
      } catch (error) {
        console.error(`Error clearing localStorage key "${key}":`, error);
        toast({ title: "Error", description: "Could not clear content.", variant: "destructive" });
      }
    }
  }, [key, initialValue, toast]);

  const setAndSaveCurrentText = (value: T) => {
    setCurrentTextInternal(value);
    // Immediate save on explicit set can be considered, or rely on autosave interval
    // For now, rely on autosave interval to pick up the change.
  };

  return [currentText, setAndSaveCurrentText, isSaving, clearSavedDocument, lastSavedTime];
}

export default useAutosave;
