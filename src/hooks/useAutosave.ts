
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  docId: string | null; // null for scratchpad
}

function useAutosave<T extends string>( 
  storageKey: string, 
  initialValue: T,
  saveInterval: number = 2000
): [T, (value: T) => void, boolean, () => void, Date | null, Array<VersionHistoryEntry<T>>] {
  const { t } = useLanguage();
  const { toast } = useToast(); 
  const { activeStoryId } = useStoryContext();
  const { user } = useAuth();

  const [currentText, setCurrentTextInternal] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [history, setHistory] = useState<Array<VersionHistoryEntry<T>>>([]);
  const isInitialLoad = useRef(true);

  // Load data effect
  useEffect(() => {
    isInitialLoad.current = true;
    const loadData = async () => {
      if (storageKey) {
        try {
          const item = await storage.getItem<DocumentData<T>>(storageKey);
          if (item) {
            setCurrentTextInternal(item.current || initialValue);
            setHistory(item.history || []);
            setLastSavedTime(item.lastSaved ? new Date(item.lastSaved) : null);
          } else {
            setCurrentTextInternal(initialValue);
            setHistory([]);
            setLastSavedTime(null);
          }
        } catch (error) {
          console.warn(`Error reading storage key "${storageKey}":`, error);
          setCurrentTextInternal(initialValue);
          setHistory([]);
          setLastSavedTime(null);
        } finally {
            isInitialLoad.current = false;
        }
      } else {
        setCurrentTextInternal(initialValue); 
        setHistory([]);
        setLastSavedTime(null);
        isInitialLoad.current = false;
      }
    };
    loadData();
  }, [storageKey, initialValue]);

  const logActivity = useCallback(async (textToSave: T) => {
    const activityKey = getActivityLogKey(activeStoryId, user?.uid);
     // Extract docId from storageKey (e.g., '...-doc-123-user-...')
    const docIdMatch = storageKey.match(/-doc-([^-]*)-/);
    const docId = docIdMatch ? docIdMatch[1] : null;


    if (activeStoryId && textToSave && typeof textToSave === 'string' && !textToSave.startsWith('{') && activityKey) {
      const words = textToSave.trim() ? textToSave.trim().split(/\s+/).filter(word => word.length > 0) : [];
      const wordCount = words.length;
      const newLogEntry: ActivityLogEntry = { 
          timestamp: new Date().toISOString(), 
          wordCount,
          docId, // Log which document was updated
      };

      try {
        let activityLog = await storage.getItem<ActivityLogEntry[]>(activityKey) || [];
        activityLog.push(newLogEntry);
        await storage.setItem(activityKey, activityLog);
        
        window.dispatchEvent(new CustomEvent('storage-change', { detail: { key: activityKey } }));
      } catch (error) {
        console.warn(`Error updating activity log:`, error);
      }
    }
  }, [activeStoryId, user, storageKey]);

  const saveDocument = useCallback(
    async (textToSave: T, forceHistory: boolean = false) => {
      if (!storageKey) return;

      setIsSaving(true);
      try {
        const now = new Date();
        const timestamp = now.toISOString();
        
        let documentData: DocumentData<T>;
        const existingItem = await storage.getItem<DocumentData<T>>(storageKey);
        
        documentData = existingItem || { current: initialValue, history: [], lastSaved: null };

        const latestHistoryEntry = documentData.history?.[0]?.text;
        if (forceHistory || textToSave !== latestHistoryEntry) {
          const newHistoryEntry = { timestamp, text: textToSave };
          documentData.history = documentData.history || [];
          documentData.history.unshift(newHistoryEntry);
          if (documentData.history.length > MAX_HISTORY_LENGTH) {
            documentData.history.pop();
          }
          setHistory([...documentData.history]);
        }
        
        documentData.current = textToSave;
        documentData.lastSaved = timestamp;

        await storage.setItem(storageKey, documentData);
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
        console.error(`Error saving to storage key "${storageKey}":`, error);
        toast({ title: t('autosave.error_save_title'), description: t('autosave.error_save_desc'), variant: "destructive" });
      } finally {
        setTimeout(() => setIsSaving(false), 500); 
      }
    },
    [storageKey, initialValue, toast, logActivity, activeStoryId, user, t]
  );
  
  // Autosave effect
  useEffect(() => {
    if (isInitialLoad.current || !storageKey) return; 

    const handler = setTimeout(async () => {
      const item = await storage.getItem<DocumentData<T>>(storageKey);
      if (currentText !== item?.current) {
        await saveDocument(currentText);
      }
    }, saveInterval);

    return () => clearTimeout(handler);
  }, [currentText, saveInterval, saveDocument, storageKey]);

  const clearSavedDocument = useCallback(async () => {
    if (storageKey) { 
      try {
        await storage.removeItem(storageKey);
        setCurrentTextInternal(initialValue); 
        setLastSavedTime(null);
        toast({ title: t('autosave.cleared_title'), description: t('autosave.cleared_desc') });
      } catch (error) {
        console.error(`Error clearing storage key "${storageKey}":`, error);
        toast({ title: t('common.error'), description: t('autosave.error_clear_desc'), variant: "destructive" });
      }
    }
  }, [storageKey, initialValue, toast, t]);

  const setAndSaveCurrentText = (value: T) => {
    setCurrentTextInternal(value);
    // Force a history save when manually reverting
    saveDocument(value, true); 
  };

  return [currentText, setAndSaveCurrentText, isSaving, clearSavedDocument, lastSavedTime, history];
}

export default useAutosave;
