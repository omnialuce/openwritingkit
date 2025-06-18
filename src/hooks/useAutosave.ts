
// src/hooks/useAutosave.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast'; 

const MAX_HISTORY_LENGTH = 20; 
const EDITOR_CONTENT_KEY = 'openwritingkit-active-document-content';
const ACTIVITY_LOG_KEY = 'openwritingkit-activity-log'; // New key for activity logging

interface DocumentData<T> {
  current: T;
  history: Array<{ timestamp: string; text: T }>;
  lastSaved: string | null;
}

interface ActivityLogEntry {
  timestamp: string;
  wordCount: number;
}

function useAutosave<T extends string>( 
  key: string, 
  initialValue: T,
  saveInterval: number = 2000
): [T, (value: T) => void, boolean, () => void, Date | null] {
  const { toast } = useToast(); 

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

  const logActivity = useCallback((textToSave: T) => {
    if (typeof window !== 'undefined') {
      const words = textToSave.trim() ? textToSave.trim().split(/\s+/).filter(word => word.length > 0) : [];
      const wordCount = words.length;
      const newLogEntry: ActivityLogEntry = { timestamp: new Date().toISOString(), wordCount };

      try {
        const existingLog = window.localStorage.getItem(ACTIVITY_LOG_KEY);
        let activityLog: ActivityLogEntry[] = existingLog ? JSON.parse(existingLog) : [];
        activityLog.push(newLogEntry);
        // Optional: Prune old log entries if it gets too large
        // if (activityLog.length > 1000) activityLog = activityLog.slice(-1000); 
        window.localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(activityLog));
      } catch (error) {
        console.warn(`Error updating activity log:`, error);
      }
    }
  }, []);


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
          logActivity(textToSave); // Log activity on successful save

          const today = now.toISOString().split('T')[0];
          const lastActiveDateKey = 'openwritingkit-last-active-date';
          const streakKey = 'openwritingkit-writing-streak';
          const lastStreakDateKey = 'openwritingkit-last-streak-date';

          const lastActiveDate = localStorage.getItem(lastActiveDateKey);
          
          if (lastActiveDate !== today) { 
            localStorage.setItem(lastActiveDateKey, today);
            let currentStreak = parseInt(localStorage.getItem(streakKey) || '0', 10);
            const lastStreakUpdateDate = localStorage.getItem(lastStreakDateKey);
            
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastStreakUpdateDate === yesterdayStr) { 
              currentStreak++;
            } else { 
              currentStreak = 1;
            }
            localStorage.setItem(streakKey, currentStreak.toString());
            localStorage.setItem(lastStreakDateKey, today);
            window.dispatchEvent(new Event('storage')); 
          }
        } catch (error) {
          console.error(`Error saving to localStorage key "${key}":`, error);
          toast({ title: "Save Error", description: "Could not save changes.", variant: "destructive" });
        } finally {
          setTimeout(() => setIsSaving(false), 500); 
        }
      }
    },
    [key, initialValue, toast, logActivity]
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
        toast({ title: "Content Cleared", description: "The document content and its history have been cleared." });
      } catch (error) {
        console.error(`Error clearing localStorage key "${key}":`, error);
        toast({ title: "Error", description: "Could not clear content.", variant: "destructive" });
      }
    }
  }, [key, initialValue, toast]);

  const setAndSaveCurrentText = (value: T) => {
    setCurrentTextInternal(value);
  };

  return [currentText, setAndSaveCurrentText, isSaving, clearSavedDocument, lastSavedTime];
}

export default useAutosave;
