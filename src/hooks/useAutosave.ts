
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
          // This check ensures we handle both simple strings and the DocumentData object
          let loadedValue: T;
          let lastSaved: string | null = null;
          try {
            const data: DocumentData<T> = JSON.parse(item);
            loadedValue = data.current || initialValue;
            lastSaved = data.lastSaved;
          } catch(e) {
            // It might be a simple string from a previous version
            loadedValue = item as T;
          }
          setCurrentTextInternal(loadedValue);
          setLastSavedTime(lastSaved ? new Date(lastSaved) : null);
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
    if (typeof window !== 'undefined' && activeStoryId && textToSave && typeof textToSave === 'string' && !textToSave.startsWith('{')) {
      const activityLogStorageKey = getActivityLogKey(activeStoryId);
      const words = textToSave.trim() ? textToSave.trim().split(/\s+/).filter(word => word.length > 0) : [];
      const wordCount = words.length;
      const newLogEntry: ActivityLogEntry = { timestamp: new Date().toISOString(), wordCount };

      try {
        const existingLog = window.localStorage.getItem(activityLogStorageKey);
        let activityLog: ActivityLogEntry[] = existingLog ? JSON.parse(existingLog) : [];
        activityLog.push(newLogEntry);
        window.localStorage.setItem(activityLogStorageKey, JSON.stringify(activityLog));
      } catch (error) {
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
            try {
              documentData = JSON.parse(existingItem);
              if(typeof documentData.current === 'undefined') { // Handle legacy string format
                documentData = { current: existingItem as T, history: [], lastSaved: null };
              }
            } catch (e) {
              // Legacy format, was just a string.
              documentData = { current: existingItem as T, history: [], lastSaved: null };
            }
          } else {
            documentData = { current: initialValue, history: [], lastSaved: null };
          }

          const latestHistoryEntry = documentData.history?.[0]?.text;
          if (textToSave !== latestHistoryEntry) {
            const newHistoryEntry = { timestamp, text: textToSave };
            documentData.history = documentData.history || [];
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
          
          if(activeStoryId){
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
      if (typeof window !== 'undefined') {
         const item = window.localStorage.getItem(dynamicStorageKey);
         let storedCurrent = initialValue;
         if (item) {
           try {
             storedCurrent = JSON.parse(item).current;
           } catch {
             // It could be a simple string
             try {
                if (JSON.parse(item)) storedCurrent = item as T;
             } catch {
                 storedCurrent = item as T;
             }
           }
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
  };

  return [currentText, setAndSaveCurrentText, isSaving, clearSavedDocument, lastSavedTime];
}

export default useAutosave;
