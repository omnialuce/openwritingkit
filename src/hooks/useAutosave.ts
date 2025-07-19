

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast'; 
import { useStoryContext, getActivityLogKey } from '@/contexts/StoryContext'; 
import { storage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const MAX_HISTORY_LENGTH = 20; 

export interface VersionHistoryEntry<T> {
  timestamp: string;
  text: T;
}

interface DocumentData<T> {
  current: T;
  history: Array<VersionHistoryEntry<T>>;
  lastSaved: string | null;
}

interface ActivityLogEntry {
  timestamp: string;
  wordCount: number;
}

function useAutosave<T extends string>( 
  dynamicStorageKey: string, 
  initialValue: T,
  saveInterval: number = 2000,
  preventAutoload: boolean = false
): [T, (value: T) => void, boolean, () => void, Date | null, Array<VersionHistoryEntry<T>>] {
  const { t } = useLanguage();
  const { toast } = useToast(); 
  const { activeStoryId } = useStoryContext();
  const { user } = useAuth();

  const [currentText, setCurrentTextInternal] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [history, setHistory] = useState<Array<VersionHistoryEntry<T>>>([]);

  useEffect(() => {
    if (preventAutoload) return;
    const key = dynamicStorageKey;
    const loadData = async () => {
      if (key) {
        try {
          const item = await storage.getItem<string | DocumentData<T>>(key);
          if (item) {
            let loadedValue: T;
            let lastSaved: string | null = null;
            let loadedHistory: Array<VersionHistoryEntry<T>> = [];

            if (typeof item === 'string') {
              loadedValue = item as T;
            } else {
              loadedValue = item.current || initialValue;
              lastSaved = item.lastSaved;
              loadedHistory = item.history || [];
            }
            setCurrentTextInternal(loadedValue);
            setHistory(loadedHistory);
            setLastSavedTime(lastSaved ? new Date(lastSaved) : null);
          } else {
            setCurrentTextInternal(initialValue);
            setHistory([]);
            setLastSavedTime(null);
          }
        } catch (error) {
          console.warn(`Error reading storage key "${key}":`, error);
          setCurrentTextInternal(initialValue);
          setHistory([]);
          setLastSavedTime(null);
        }
      } else {
        setCurrentTextInternal(initialValue); 
        setHistory([]);
        setLastSavedTime(null);
      }
    };
    loadData();
  }, [dynamicStorageKey, initialValue, preventAutoload]);

  const logActivity = useCallback(async (textToSave: T) => {
    const activityKey = getActivityLogKey(activeStoryId, user?.uid);
    if (activeStoryId && textToSave && typeof textToSave === 'string' && !textToSave.startsWith('{') && activityKey) {
      const words = textToSave.trim() ? textToSave.trim().split(/\s+/).filter(word => word.length > 0) : [];
      const wordCount = words.length;
      const newLogEntry: ActivityLogEntry = { timestamp: new Date().toISOString(), wordCount };

      try {
        let activityLog = await storage.getItem<ActivityLogEntry[]>(activityKey) || [];
        activityLog.push(newLogEntry);
        await storage.setItem(activityKey, activityLog);
        
        window.dispatchEvent(new CustomEvent('storage-change', { detail: { key: activityKey } }));
      } catch (error) {
        console.warn(`Error updating activity log:`, error);
      }
    }
  }, [activeStoryId, user]);

  const saveDocument = useCallback(
    async (textToSave: T, forceHistory: boolean = false) => {
      const key = dynamicStorageKey;
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
          if (forceHistory || textToSave !== latestHistoryEntry) {
            const newHistoryEntry = { timestamp, text: textToSave };
            documentData.history = documentData.history || [];
            documentData.history.unshift(newHistoryEntry);
            if (documentData.history.length > MAX_HISTORY_LENGTH) {
              documentData.history.pop();
            }
            setHistory(documentData.history);
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
              
              window.dispatchEvent(new CustomEvent('storage-change', { detail: { key: lastActiveDateKey } }));
              window.dispatchEvent(new CustomEvent('storage-change', { detail: { key: streakKey } }));

            }
          }

        } catch (error) {
          console.error(`Error saving to storage key "${key}":`, error);
          toast({ title: t('autosave.error_save_title'), description: t('autosave.error_save_desc'), variant: "destructive" });
        } finally {
          setTimeout(() => setIsSaving(false), 500); 
        }
      }
    },
    [dynamicStorageKey, initialValue, toast, logActivity, activeStoryId, user, t]
  );
  
  useEffect(() => {
    const key = dynamicStorageKey;
    if (!key) return; 

    const handler = setTimeout(async () => {
      let storedCurrent: T | undefined = initialValue;
      try {
        const item = await storage.getItem<string | DocumentData<T>>(key);
        if (item) {
            if (typeof item === 'string') {
              storedCurrent = item as T;
            } else {
              storedCurrent = item.current;
            }
        }
        if (currentText !== storedCurrent) {
          await saveDocument(currentText);
        }
      } catch(e) {
        // Could be a race condition on initial load, ignore.
      }
    }, saveInterval);

    return () => clearTimeout(handler);
  }, [currentText, saveInterval, saveDocument, dynamicStorageKey, initialValue]);

  const clearSavedDocument = useCallback(async () => {
    const key = dynamicStorageKey;
    if (key) { 
      try {
        await storage.removeItem(key);
        setCurrentTextInternal(initialValue); 
        setLastSavedTime(null);
        toast({ title: t('autosave.cleared_title'), description: t('autosave.cleared_desc') });
      } catch (error) {
        console.error(`Error clearing storage key "${key}":`, error);
        toast({ title: t('common.error'), description: t('autosave.error_clear_desc'), variant: "destructive" });
      }
    }
  }, [dynamicStorageKey, initialValue, toast, t]);

  const setAndSaveCurrentText = (value: T) => {
    setCurrentTextInternal(value);
    // Force a history save when manually reverting
    saveDocument(value, true); 
  };

  return [currentText, setAndSaveCurrentText, isSaving, clearSavedDocument, lastSavedTime, history];
}

export default useAutosave;
