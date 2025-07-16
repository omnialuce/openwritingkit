
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast'; 
import { useStoryContext, getActivityLogKey } from '@/contexts/StoryContext'; 
import { storage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const [currentText, setCurrentTextInternal] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  const getStorageKeyWithUser = useCallback((baseKey: string) => {
    if (!user) return null;
    return `${baseKey}-${user.uid}`;
  }, [user]);

  useEffect(() => {
    const key = getStorageKeyWithUser(dynamicStorageKey);
    const loadData = async () => {
      if (key) {
        try {
          const item = await storage.getItem<string | DocumentData<T>>(key);
          if (item) {
            let loadedValue: T;
            let lastSaved: string | null = null;
            if (typeof item === 'string') {
              loadedValue = item as T;
            } else {
              loadedValue = item.current || initialValue;
              lastSaved = item.lastSaved;
            }
            setCurrentTextInternal(loadedValue);
            setLastSavedTime(lastSaved ? new Date(lastSaved) : null);
          } else {
            setCurrentTextInternal(initialValue);
            setLastSavedTime(null);
          }
        } catch (error) {
          console.warn(`Error reading storage key "${key}":`, error);
          setCurrentTextInternal(initialValue);
          setLastSavedTime(null);
        }
      } else {
        setCurrentTextInternal(initialValue); 
        setLastSavedTime(null);
      }
    };
    loadData();
  }, [dynamicStorageKey, initialValue, getStorageKeyWithUser]);

  const logActivity = useCallback(async (textToSave: T) => {
    const activityKey = getStorageKeyWithUser(getActivityLogKey(activeStoryId));
    if (activeStoryId && textToSave && typeof textToSave === 'string' && !textToSave.startsWith('{') && activityKey) {
      const words = textToSave.trim() ? textToSave.trim().split(/\s+/).filter(word => word.length > 0) : [];
      const wordCount = words.length;
      const newLogEntry: ActivityLogEntry = { timestamp: new Date().toISOString(), wordCount };

      try {
        let activityLog = await storage.getItem<ActivityLogEntry[]>(activityKey) || [];
        activityLog.push(newLogEntry);
        await storage.setItem(activityKey, activityLog);
      } catch (error) {
        console.warn(`Error updating activity log:`, error);
      }
    }
  }, [activeStoryId, getStorageKeyWithUser]);

  const saveDocument = useCallback(
    async (textToSave: T) => {
      const key = getStorageKeyWithUser(dynamicStorageKey);
      if (key) { 
        setIsSaving(true);
        try {
          const now = new Date();
          const timestamp = now.toISOString();
          
          let documentData: DocumentData<T>;
          const existingItem = await storage.getItem<string | DocumentData<T>>(key);
          
          if (existingItem) {
            if (typeof existingItem === 'string') {
              documentData = { current: existingItem, history: [], lastSaved: null };
            } else if (typeof existingItem.current !== 'undefined') {
              documentData = existingItem;
            } else {
               documentData = { current: initialValue, history: [], lastSaved: null };
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

          await storage.setItem(key, documentData);
          setLastSavedTime(now);
          await logActivity(textToSave);
          
          if(activeStoryId && user){
            const today = now.toISOString().split('T')[0];
            const lastActiveDateKey = `openwritingkit-story-${activeStoryId}-last-active-date-${user.uid}`; 
            const streakKey = `openwritingkit-story-${activeStoryId}-writing-streak-${user.uid}`; 
            const lastStreakDateKey = `openwritingkit-story-${activeStoryId}-last-streak-date-${user.uid}`;

            const lastActiveDate = await storage.getItem<string>(lastActiveDateKey);
            
            if (lastActiveDate !== today) { 
              await storage.setItem(lastActiveDateKey, today);
              let currentStreak = await storage.getItem<number>(streakKey) || 0;
              const lastStreakUpdateDate = await storage.getItem<string>(lastStreakDateKey);
              
              const yesterday = new Date(now);
              yesterday.setDate(now.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];

              if (lastStreakUpdateDate === yesterdayStr) { 
                currentStreak++;
              } else { 
                currentStreak = 1;
              }
              await storage.setItem(streakKey, currentStreak);
              await storage.setItem(lastStreakDateKey, today);
              window.dispatchEvent(new Event('storage')); 
            }
          }

        } catch (error) {
          console.error(`Error saving to storage key "${key}":`, error);
          toast({ title: "Save Error", description: "Could not save changes.", variant: "destructive" });
        } finally {
          setTimeout(() => setIsSaving(false), 500); 
        }
      }
    },
    [dynamicStorageKey, initialValue, toast, logActivity, activeStoryId, getStorageKeyWithUser, user]
  );
  
  useEffect(() => {
    const key = getStorageKeyWithUser(dynamicStorageKey);
    if (!key) return; 

    const handler = setTimeout(async () => {
      let storedCurrent: T | undefined = initialValue;
      const item = await storage.getItem<string | DocumentData<T>>(key);
      if (item) {
        try {
          if (typeof item === 'string') {
            storedCurrent = item as T;
          } else {
            storedCurrent = item.current;
          }
        } catch {}
      }
      if (currentText !== storedCurrent) {
        await saveDocument(currentText);
      }
    }, saveInterval);

    return () => clearTimeout(handler);
  }, [currentText, saveInterval, saveDocument, dynamicStorageKey, initialValue, getStorageKeyWithUser]);

  const clearSavedDocument = useCallback(async () => {
    const key = getStorageKeyWithUser(dynamicStorageKey);
    if (key) { 
      try {
        await storage.removeItem(key);
        setCurrentTextInternal(initialValue); 
        setLastSavedTime(null);
        toast({ title: "Content Cleared", description: "The document content and its history have been cleared." });
      } catch (error) {
        console.error(`Error clearing storage key "${key}":`, error);
        toast({ title: "Error", description: "Could not clear content.", variant: "destructive" });
      }
    }
  }, [dynamicStorageKey, initialValue, toast, getStorageKeyWithUser]);

  const setAndSaveCurrentText = (value: T) => {
    setCurrentTextInternal(value);
  };

  return [currentText, setAndSaveCurrentText, isSaving, clearSavedDocument, lastSavedTime];
}

export default useAutosave;
