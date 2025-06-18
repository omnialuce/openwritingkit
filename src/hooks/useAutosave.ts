
// src/hooks/useAutosave.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast'; 
import { useStoryContext, getActivityLogKey } from '@/contexts/StoryContext'; 

const MAX_HISTORY_LENGTH = 20; 

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
  dynamicStorageKey: string, 
  initialValue: T,
  saveInterval: number = 2000
): [T, (value: T) => void, boolean, () => void, Date | null] {
  const { toast } = useToast(); 
  const { activeStoryId } = useStoryContext();

  const [currentText, setCurrentTextInternal] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && dynamicStorageKey) {
      try {
        const item = window.localStorage.getItem(dynamicStorageKey);
        if (item) {
          const data: DocumentData<T> = JSON.parse(item);
          setCurrentTextInternal(data.current || initialValue);
          setLastSavedTime(data.lastSaved ? new Date(data.lastSaved) : null);
        } else {
          // No item found for this key, ensure state is reset to initial if key changed
          setCurrentTextInternal(initialValue);
          setLastSavedTime(null);
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${dynamicStorageKey}" on mount/key change:`, error);
        setCurrentTextInternal(initialValue);
        setLastSavedTime(null);
      }
    } else if (!dynamicStorageKey) {
        // Reset if no key (e.g. no active story)
        setCurrentTextInternal(initialValue); 
        setLastSavedTime(null);
    }
  }, [dynamicStorageKey, initialValue]);


  const logActivity = useCallback((textToSave: T) => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const activityLogStorageKey = getActivityLogKey(activeStoryId);
      const words = textToSave.trim() ? textToSave.trim().split(/\s+/).filter(word => word.length > 0) : [];
      const wordCount = words.length;
      const newLogEntry: ActivityLogEntry = { timestamp: new Date().toISOString(), wordCount };

      try {
        const existingLog = window.localStorage.getItem(activityLogStorageKey);
        let activityLog: ActivityLogEntry[] = existingLog ? JSON.parse(existingLog) : [];
        activityLog.push(newLogEntry);
        window.localStorage.setItem(activityLogStorageKey, JSON.stringify(activityLog));
      } catch (error)
        console.warn(`Error updating activity log:`, error);
      }
    }
  }, [activeStoryId]);


  const saveDocument = useCallback(
    (textToSave: T) => {
      if (typeof window !== 'undefined' && dynamicStorageKey) { 
        setIsSaving(true);
        try {
          const now = new Date();
          const timestamp = now.toISOString();
          
          let documentData: DocumentData<T>;
          const existingItem = window.localStorage.getItem(dynamicStorageKey);
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

          window.localStorage.setItem(dynamicStorageKey, JSON.stringify(documentData));
          setLastSavedTime(now);
          logActivity(textToSave);

          const today = now.toISOString().split('T')[0];
          const lastActiveDateKey = `openwritingkit-story-${activeStoryId}-last-active-date`; 
          const streakKey = `openwritingkit-story-${activeStoryId}-writing-streak`; 
          const lastStreakDateKey = `openwritingkit-story-${activeStoryId}-last-streak-date`;


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
          console.error(`Error saving to localStorage key "${dynamicStorageKey}":`, error);
          toast({ title: "Save Error", description: "Could not save changes.", variant: "destructive" });
        } finally {
          setTimeout(() => setIsSaving(false), 500); 
        }
      }
    },
    [dynamicStorageKey, initialValue, toast, logActivity, activeStoryId]
  );
  
  useEffect(() => {
    if (!dynamicStorageKey) return; 

    const handler = setTimeout(() => {
      // Only save if currentText is different from what might be initially loaded
      // or if it has been genuinely updated by user interaction.
      // This check helps prevent saving right after loading from localStorage if initialValue was different.
      if (typeof window !== 'undefined') {
         const item = window.localStorage.getItem(dynamicStorageKey);
         let storedCurrent = initialValue;
         if (item) {
           try {
             storedCurrent = JSON.parse(item).current;
           } catch {}
         }
         if (currentText !== storedCurrent) {
           saveDocument(currentText);
         }
      }
    }, saveInterval);

    return () => clearTimeout(handler);
  }, [currentText, saveInterval, saveDocument, dynamicStorageKey, initialValue]);

  const clearSavedDocument = useCallback(() => {
    if (typeof window !== 'undefined' && dynamicStorageKey) { 
      try {
        window.localStorage.removeItem(dynamicStorageKey);
        setCurrentTextInternal(initialValue); 
        setLastSavedTime(null);
        toast({ title: "Content Cleared", description: "The document content and its history have been cleared for this story." });
      } catch (error) {
        console.error(`Error clearing localStorage key "${dynamicStorageKey}":`, error);
        toast({ title: "Error", description: "Could not clear content.", variant: "destructive" });
      }
    }
  }, [dynamicStorageKey, initialValue, toast]);

  const setAndSaveCurrentText = (value: T) => {
    setCurrentTextInternal(value);
    // The useEffect for autosaving will pick up this change.
  };

  return [currentText, setAndSaveCurrentText, isSaving, clearSavedDocument, lastSavedTime];
}

export default useAutosave;

