
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import type { CharacterProfile } from '@/app/(app)/characters/page';
import { storage } from '@/lib/storage';

export interface Locale {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

export type DocumentType = "folder" | "chapter" | "scene" | "file";
export type DocumentStatus = "Draft" | "Revised" | "Complete";
export type DocumentTag = "Draft" | "WIP" | "Review" | "Published" | "Idea" | "Research" | "Key Scene" | "Needs Work" | "Outline" | "Character";

export interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  lastModified?: string;
  words?: number;
  itemCount?: number;
  status?: DocumentStatus;
  tags?: DocumentTag[];
  notes?: string;
  children?: DocumentItem[];
}


interface Story {
  id: string;
  title: string;
  description: string;
  lastModified: string;
}

export interface PlotSettings {
  showTemplates: boolean;
  primaryTemplate: string;
}

interface StoryContextType {
  stories: Story[];
  activeStoryId: string | null;
  activeStoryName: string | null;
  setActiveStory: (storyId: string | null) => void;
  addStory: (newStory: Story) => void;
  updateStory: (updatedStory: Story) => void;
  updateDocumentMetadata: (docId: string, metadata: { words: number; lastModified: string }) => void;
  deleteStory: (storyId: string) => void;
  refreshStories: () => void;
  documentToOpen: string | null;
  setDocumentToOpen: (docId: string | null) => void;
  consumeDocumentToOpen: () => string | null;
  historyDocumentId: string | null;
  setHistoryDocumentId: (docId: string | null) => void;
  consumeHistoryDocumentId: () => string | null;
  getActivityLogKey: (storyId: string | null, userId: string | null | undefined) => string | null;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

// Helper function to get the storage key for stories, now namespaced by user ID
const getStoriesStorageKey = (userId: string | undefined | null) => 
  userId ? `openwritingkit-user-${userId}-stories` : 'openwritingkit-stories-anonymous';

export function StoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // Get the current user from next-auth session
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryId, setActiveStoryIdState] = useState<string | null>(null);
  const [activeStoryName, setActiveStoryName] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [documentToOpen, setDocumentToOpen] = useState<string | null>(null);
  const [historyDocumentId, setHistoryDocumentId] = useState<string | null>(null);

  const storiesStorageKey = getStoriesStorageKey(user?.uid);
  const activeStoryIdKey = user?.uid ? `openwritingkit-user-${user.uid}-active-story-id` : 'openwritingkit-active-story-id-anonymous';

  const consumeDocumentToOpen = (): string | null => {
    const docId = documentToOpen;
    setDocumentToOpen(null); // Consume it
    return docId;
  };

  const consumeHistoryDocumentId = (): string | null => {
    const docId = historyDocumentId;
    setHistoryDocumentId(null);
    return docId;
  };

  const loadDataForUser = useCallback(async () => {
    if (!user) {
      setStories([]);
      setActiveStoryIdState(null);
      setActiveStoryName(null);
      setIsLoaded(true);
      return;
    }

    const loadedStories = JSON.parse(localStorage.getItem(storiesStorageKey) || '[]') as Story[];
    setStories(loadedStories);

    const storedActiveId = localStorage.getItem(activeStoryIdKey);
    if (storedActiveId) {
      const foundActiveStory = loadedStories.find(s => s.id === storedActiveId);
      if (foundActiveStory) {
        setActiveStoryIdState(storedActiveId);
        setActiveStoryName(foundActiveStory.title);
      } else {
        localStorage.removeItem(activeStoryIdKey);
        setActiveStoryIdState(null);
        setActiveStoryName(null);
      }
    } else {
        setActiveStoryIdState(null);
        setActiveStoryName(null);
    }
    setIsLoaded(true);
  }, [user, storiesStorageKey, activeStoryIdKey]);

  useEffect(() => {
    loadDataForUser();
  }, [loadDataForUser]);

  const setActiveStory = useCallback((storyId: string | null) => {
    if (!user) return;
    if (storyId) {
      localStorage.setItem(activeStoryIdKey, storyId);
      const story = stories.find(s => s.id === storyId);
      setActiveStoryName(story ? story.title : null);
    } else {
      localStorage.removeItem(activeStoryIdKey);
      setActiveStoryName(null);
    }
    setActiveStoryIdState(storyId);
  }, [user, stories, activeStoryIdKey]);

  const addStory = useCallback((newStory: Story) => {
    if (!user) return;
    const updatedStories = [...stories, newStory];
    setStories(updatedStories);
    localStorage.setItem(storiesStorageKey, JSON.stringify(updatedStories));
  }, [user, stories, storiesStorageKey]);

  const updateStory = useCallback((updatedStoryData: Story) => {
    if (!user) return;
    const updatedStories = stories.map(s => s.id === updatedStoryData.id ? updatedStoryData : s);
    setStories(updatedStories);
    localStorage.setItem(storiesStorageKey, JSON.stringify(updatedStories));
    if (activeStoryId === updatedStoryData.id) {
      setActiveStoryName(updatedStoryData.title);
    }
  }, [user, stories, activeStoryId, storiesStorageKey]);
  
  const updateDocumentMetadata = useCallback((docId: string, metadata: { words: number; lastModified: string }) => {
    if (!activeStoryId || !user) return;

    const docsKey = getDocumentsStorageKey(activeStoryId, user.uid);
    storage.getItem<DocumentItem[]>(docsKey).then(storedData => {
      if (!storedData) return;

      const updateRecursive = (items: DocumentItem[]): DocumentItem[] => {
        return items.map(item => {
          if (item.id === docId) {
            return { ...item, ...metadata };
          }
          if (item.children) {
            return { ...item, children: updateRecursive(item.children) };
          }
          return item;
        });
      };
      
      const updatedDocs = updateRecursive(storedData);
      storage.setItem(docsKey, updatedDocs);
      // Dispatch a custom event to notify other components (like Documents page) of the change
      window.dispatchEvent(new CustomEvent('storage-change', { detail: { key: docsKey } }));
    });
  }, [activeStoryId, user]);


  const deleteStory = useCallback((storyId: string) => {
    if (!user) return;
    const uid = user.uid;

    // Recursive function to get all document IDs
    const getAllDocIdsRecursive = (items: DocumentItem[]): string[] => {
        let ids: string[] = [];
        for (const item of items) {
            if (item.type === 'file' || item.type === 'scene') {
                ids.push(item.id);
            }
            if (item.children) {
                ids = ids.concat(getAllDocIdsRecursive(item.children));
            }
        }
        return ids;
    };
    
    // Get all document IDs to remove their content from localStorage
    const documentsKey = getDocumentsStorageKey(storyId, uid);
    const storedDocumentsJSON = localStorage.getItem(documentsKey);
    const storedDocuments = storedDocumentsJSON ? JSON.parse(storedDocumentsJSON) : [];
    const docIdsToDelete = getAllDocIdsRecursive(storedDocuments);
    
    docIdsToDelete.forEach(docId => {
        localStorage.removeItem(getEditorContentKey(storyId, docId, uid));
    });

    // Get all character IDs to remove their sheets
    const charactersKey = getCharactersStorageKey(storyId, uid);
    const storedCharactersJSON = localStorage.getItem(charactersKey);
    const storedCharacters: CharacterProfile[] = storedCharactersJSON ? JSON.parse(storedCharactersJSON) : [];
    storedCharacters.forEach(char => {
        localStorage.removeItem(getCharacterSheetStorageKey(storyId, char.id, uid));
    });

    // Get all locale IDs to remove their sheets
    const localesKey = getWorldBuildingStorageKey(storyId, uid);
    const storedLocalesJSON = localStorage.getItem(localesKey);
    const storedLocales: Locale[] = storedLocalesJSON ? JSON.parse(storedLocalesJSON) : [];
    storedLocales.forEach(locale => {
        localStorage.removeItem(getLocaleSheetStorageKey(storyId, locale.id, uid));
    });


    // Remove main story data keys
    const keysToRemove = [
        documentsKey,
        charactersKey,
        localesKey,
        getOutlineStorageKey(storyId, uid),
        getTimelineEventsStorageKey(storyId, uid),
        getEditorContentKey(storyId, null, uid), // scratchpad
        getWordGoalKey(storyId, uid),
        getActivityLogKey(storyId, uid),
        getResearchStorageKey(storyId, uid),
        getResearchTodosStorageKey(storyId, uid),
        getDeadlineKey(storyId, uid),
        getPlotSettingsKey(storyId, uid),
    ];

    keysToRemove.forEach(key => key && localStorage.removeItem(key));
    
    // Finally remove the story itself from the stories list
    const updatedStories = stories.filter(s => s.id !== storyId);
    setStories(updatedStories);
    localStorage.setItem(storiesStorageKey, JSON.stringify(updatedStories));

    // If the deleted story was active, clear the active state
    if (activeStoryId === storyId) {
      setActiveStory(null);
    }
  }, [user, activeStoryId, setActiveStory, stories, storiesStorageKey]);
  
  const refreshStories = useCallback(() => {
    if (user) {
        loadDataForUser();
    }
  }, [user, loadDataForUser]);

  const getActivityLogKey = useCallback((storyId: string | null, userId: string | null | undefined): string | null => {
    return storyId && userId ? `openwritingkit-story-${storyId}-activity-log-user-${userId}` : null;
  }, []);


  if (!isLoaded) {
    return null;
  }

  return (
    <StoryContext.Provider value={{ stories, activeStoryId, activeStoryName, setActiveStory, addStory, updateStory, updateDocumentMetadata, deleteStory, refreshStories, documentToOpen, setDocumentToOpen, consumeDocumentToOpen, historyDocumentId, setHistoryDocumentId, consumeHistoryDocumentId, getActivityLogKey }}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStoryContext() {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStoryContext must be used within a StoryProvider');
  }
  return context;
}

export const getCharactersStorageKey = (storyId: string | null, userId: string | undefined | null): string => {
    return (storyId && userId) ? `openwritingkit-story-${storyId}-characters-user-${userId}` : 'openwritingkit-characters-noactive';
}

export const getCharacterSheetStorageKey = (storyId: string | null, characterId: string | null, userId: string | undefined | null): string => {
  return (storyId && characterId && userId) ? `openwritingkit-story-${storyId}-character-${characterId}-sheet-user-${userId}` : 'openwritingkit-sheet-noactive';
}

export const getOutlineStorageKey = (storyId: string | null, userId: string | undefined | null): string => {
    return storyId && userId ? `openwritingkit-story-${storyId}-outline-items-v3-user-${userId}` : 'openwritingkit-outline-items-v3-noactive';
}

export const getTimelineEventsStorageKey = (storyId: string | null, userId: string | undefined | null): string => {
    return storyId && userId ? `openwritingkit-story-${storyId}-timeline-events-user-${userId}` : 'openwritingkit-timeline-events-noactive';
}
  
export const getEditorContentKey = (storyId: string | null, docId: string | null, userId: string | undefined | null): string => {
    if (!storyId || !userId) return 'openwritingkit-scratchpad-noactive';
    return docId 
        ? `openwritingkit-story-${storyId}-doc-${docId}-user-${userId}`
        : `openwritingkit-story-${storyId}-scratchpad-user-${userId}`;
}

export const getWordGoalKey = (storyId: string | null, userId: string | undefined | null): string => {
    return storyId && userId ? `openwritingkit-story-${storyId}-word-goal-user-${userId}` : 'openwritingkit-word-goal-noactive';
}

export const getDocumentsStorageKey = (storyId: string | null, userId: string | undefined | null): string => {
    return storyId && userId ? `openwritingkit-story-${storyId}-documents-user-${userId}` : 'openwritingkit-documents-noactive';
}

export const getWorldBuildingStorageKey = (storyId: string | null, userId: string | undefined | null): string => {
    return storyId && userId ? `openwritingkit-story-${storyId}-world-building-v2-user-${userId}` : 'openwritingkit-world-building-v2-noactive';
}

export const getLocaleSheetStorageKey = (storyId: string | null, localeId: string | null, userId: string | undefined | null): string => {
  return (storyId && localeId && userId) ? `openwritingkit-story-${storyId}-locale-${localeId}-sheet-user-${userId}` : 'openwritingkit-locale-sheet-noactive';
}

export const getResearchStorageKey = (storyId: string | null, userId: string | undefined | null): string => {
    return storyId && userId ? `openwritingkit-story-${storyId}-research-user-${userId}` : 'openwritingkit-research-noactive';
}

export const getResearchTodosStorageKey = (storyId: string | null, userId: string | undefined | null): string => {
    return storyId && userId ? `openwritingkit-story-${storyId}-research-todos-user-${userId}` : 'openwritingkit-research-todos-noactive';
};

export const getDeadlineKey = (storyId: string | null, userId: string | undefined | null): string | null => {
    return storyId && userId ? `openwritingkit-story-${storyId}-deadline-user-${userId}` : null;
}

export const getPlotSettingsKey = (storyId: string | null, userId: string | undefined | null): string | null => {
    return storyId && userId ? `openwritingkit-story-${storyId}-plot-settings-user-${userId}` : null;
};

export const getPlotTemplateDataKey = (storyId: string | null, templateId: string, userId: string | undefined | null): string | null => {
  return storyId && userId ? `openwritingkit-story-${storyId}-plottemplate-${templateId}-user-${userId}` : null;
}

export type { CharacterProfile, Locale, Story };
