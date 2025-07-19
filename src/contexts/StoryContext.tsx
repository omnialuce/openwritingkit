

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth from our updated AuthContext
import type { CharacterProfile } from '@/app/(app)/characters/page';

export interface Locale {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

interface Story {
  id: string;
  title: string;
  description: string;
  lastModified: string;
}

interface StoryContextType {
  stories: Story[];
  activeStoryId: string | null;
  activeStoryName: string | null;
  setActiveStory: (storyId: string | null) => void;
  addStory: (newStory: Story) => void;
  updateStory: (updatedStory: Story) => void;
  deleteStory: (storyId: string) => void;
  refreshStories: () => void;
  documentToOpen: string | null;
  setDocumentToOpen: (docId: string | null) => void;
  consumeDocumentToOpen: () => string | null;
  historyDocumentId: string | null;
  setHistoryDocumentId: (docId: string | null) => void;
  consumeHistoryDocumentId: () => string | null;
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

  const deleteStory = useCallback((storyId: string) => {
    if (!user) return;
    const uid = user.uid;
    const keysToRemove = [
        getCharactersStorageKey(storyId, uid),
        getOutlineStorageKey(storyId, uid),
        getPlotPointsStorageKey(storyId, uid),
        getTimelineEventsStorageKey(storyId, uid),
        getEditorContentKey(storyId, null, uid), // remove scratchpad for story
        getWordGoalKey(storyId, uid),
        getActivityLogKey(storyId, uid),
        getDocumentsStorageKey(storyId, uid),
        getWorldBuildingStorageKey(storyId, uid),
        getResearchStorageKey(storyId, uid),
    ];
    // Also remove character sheets and individual documents
    const documentsKey = getDocumentsStorageKey(storyId, uid);
    const storedDocuments = JSON.parse(localStorage.getItem(documentsKey) || '[]') as { id: string, children?: any[] }[];

    const removeDocsRecursive = (docs: any[]) => {
      docs.forEach(doc => {
        keysToRemove.push(getEditorContentKey(storyId, doc.id, uid));
        if (doc.children) {
          removeDocsRecursive(doc.children);
        }
      });
    };
    removeDocsRecursive(storedDocuments);
    
    const charactersKey = getCharactersStorageKey(storyId, uid);
    const storedCharacters = JSON.parse(localStorage.getItem(charactersKey) || '[]') as CharacterProfile[];
    for (const char of storedCharacters) {
        keysToRemove.push(getCharacterSheetStorageKey(storyId, char.id, uid));
    }

    const localesKey = getWorldBuildingStorageKey(storyId, uid);
    const storedLocales = JSON.parse(localStorage.getItem(localesKey) || '[]') as Locale[];
    for (const locale of storedLocales) {
        keysToRemove.push(getLocaleSheetStorageKey(storyId, locale.id, uid));
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    const updatedStories = stories.filter(s => s.id !== storyId);
    setStories(updatedStories);
    localStorage.setItem(storiesStorageKey, JSON.stringify(updatedStories));
    if (activeStoryId === storyId) {
      setActiveStory(null);
    }
  }, [user, activeStoryId, setActiveStory, stories, storiesStorageKey]);
  
  const refreshStories = useCallback(() => {
    if (user) {
        loadDataForUser();
    }
  }, [user, loadDataForUser]);

  if (!isLoaded) {
    return null;
  }

  return (
    <StoryContext.Provider value={{ stories, activeStoryId, activeStoryName, setActiveStory, addStory, updateStory, deleteStory, refreshStories, documentToOpen, setDocumentToOpen, consumeDocumentToOpen, historyDocumentId, setHistoryDocumentId, consumeHistoryDocumentId }}>
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

export const getPlotPointsStorageKey = (storyId: string | null, userId: string | undefined | null): string => {
    return storyId && userId ? `openwritingkit-story-${storyId}-plotpoints-user-${userId}` : 'openwritingkit-plotpoints-noactive';
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

export const getActivityLogKey = (storyId: string | null, userId: string | undefined | null): string => {
    return storyId && userId ? `openwritingkit-story-${storyId}-activity-log-user-${userId}` : 'openwritingkit-activity-log-noactive';
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


export type { CharacterProfile, Locale };
