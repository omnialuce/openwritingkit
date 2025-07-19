

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

  const storiesStorageKey = getStoriesStorageKey(user?.email); // Use email or another stable ID
  const activeStoryIdKey = user?.email ? `openwritingkit-user-${user.email}-active-story-id` : 'openwritingkit-active-story-id-anonymous';

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
    const keysToRemove = [
        getCharactersStorageKey(storyId),
        getOutlineStorageKey(storyId),
        getPlotPointsStorageKey(storyId),
        getTimelineEventsStorageKey(storyId),
        getEditorContentKey(storyId, null), // remove scratchpad for story
        getWordGoalKey(storyId),
        getActivityLogKey(storyId),
        getDocumentsStorageKey(storyId),
        getWorldBuildingStorageKey(storyId),
        getResearchStorageKey(storyId),
    ];
    // Also remove character sheets and individual documents
    const documentsKey = getDocumentsStorageKey(storyId);
    const storedDocuments = JSON.parse(localStorage.getItem(documentsKey) || '[]') as { id: string, children?: any[] }[];

    const removeDocsRecursive = (docs: any[]) => {
      docs.forEach(doc => {
        keysToRemove.push(getEditorContentKey(storyId, doc.id));
        if (doc.children) {
          removeDocsRecursive(doc.children);
        }
      });
    };
    removeDocsRecursive(storedDocuments);
    
    const charactersKey = getCharactersStorageKey(storyId);
    const storedCharacters = JSON.parse(localStorage.getItem(charactersKey) || '[]') as CharacterProfile[];
    for (const char of storedCharacters) {
        keysToRemove.push(getCharacterSheetStorageKey(storyId, char.id));
    }

    const localesKey = getWorldBuildingStorageKey(storyId);
    const storedLocales = JSON.parse(localStorage.getItem(localesKey) || '[]') as Locale[];
    for (const locale of storedLocales) {
        keysToRemove.push(getLocaleSheetStorageKey(storyId, locale.id));
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

export const getCharactersStorageKey = (storyId: string | null): string => 
  storyId ? `openwritingkit-story-${storyId}-characters` : 'openwritingkit-characters-noactive';

export const getCharacterSheetStorageKey = (storyId: string | null, characterId: string | null): string =>
  (storyId && characterId) ? `openwritingkit-story-${storyId}-character-${characterId}-sheet` : 'openwritingkit-sheet-noactive';

export const getOutlineStorageKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-outline-items-v3` : 'openwritingkit-outline-items-v3-noactive';

export const getPlotPointsStorageKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-plotpoints` : 'openwritingkit-plotpoints-noactive';

export const getTimelineEventsStorageKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-timeline-events` : 'openwritingkit-timeline-events-noactive';
  
export const getEditorContentKey = (storyId: string | null, docId: string | null): string => {
  if (!storyId) return 'openwritingkit-scratchpad-noactive';
  // If a docId is provided, use it. Otherwise, use a generic "scratchpad" key for the story.
  return docId 
    ? `openwritingkit-story-${storyId}-doc-${docId}`
    : `openwritingkit-story-${storyId}-scratchpad`;
}

export const getWordGoalKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-word-goal` : 'openwritingkit-word-goal-noactive';

export const getActivityLogKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-activity-log` : 'openwritingkit-activity-log-noactive';

export const getDocumentsStorageKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-documents` : 'openwritingkit-documents-noactive';

export const getWorldBuildingStorageKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-world-building-v2` : 'openwritingkit-world-building-v2-noactive';

export const getLocaleSheetStorageKey = (storyId: string | null, localeId: string | null): string =>
  (storyId && localeId) ? `openwritingkit-story-${storyId}-locale-${localeId}-sheet` : 'openwritingkit-locale-sheet-noactive';

export const getResearchStorageKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-research` : 'openwritingkit-research-noactive';


export type { CharacterProfile, Locale };
