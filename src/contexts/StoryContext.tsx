
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { storage } from '@/lib/storage';
import type { CharacterProfile } from '@/app/characters/page';

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
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

const STORIES_STORAGE_KEY = 'openwritingkit-stories';
const ACTIVE_STORY_ID_KEY = 'openwritingkit-active-story-id';

export function StoryProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryId, setActiveStoryIdState] = useState<string | null>(null);
  const [activeStoryName, setActiveStoryName] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadStories = useCallback(async () => {
    const loadedStories = await storage.getItem<Story[]>(STORIES_STORAGE_KEY) || [];
    setStories(loadedStories);
    return loadedStories;
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const loadedStories = await loadStories();
      const storedActiveId = await storage.getItem<string>(ACTIVE_STORY_ID_KEY);
      if (storedActiveId) {
        const foundActiveStory = loadedStories.find(s => s.id === storedActiveId);
        if (foundActiveStory) {
          setActiveStoryIdState(storedActiveId);
          setActiveStoryName(foundActiveStory.title);
        } else {
          await storage.removeItem(ACTIVE_STORY_ID_KEY);
          setActiveStoryIdState(null);
          setActiveStoryName(null);
        }
      }
      setIsLoaded(true);
    };
    initialize();
  }, [loadStories]);

  const setActiveStory = useCallback(async (storyId: string | null) => {
    if (storyId) {
      await storage.setItem(ACTIVE_STORY_ID_KEY, storyId);
      const story = stories.find(s => s.id === storyId);
      setActiveStoryName(story ? story.title : null);
    } else {
      await storage.removeItem(ACTIVE_STORY_ID_KEY);
      setActiveStoryName(null);
    }
    setActiveStoryIdState(storyId);
  }, [stories]);

  const addStory = useCallback(async (newStory: Story) => {
    const updatedStories = [...stories, newStory];
    setStories(updatedStories);
    await storage.setItem(STORIES_STORAGE_KEY, updatedStories);
  }, [stories]);

  const updateStory = useCallback(async (updatedStoryData: Story) => {
    const updatedStories = stories.map(s => s.id === updatedStoryData.id ? updatedStoryData : s);
    setStories(updatedStories);
    await storage.setItem(STORIES_STORAGE_KEY, updatedStories);
    if (activeStoryId === updatedStoryData.id) {
      setActiveStoryName(updatedStoryData.title);
    }
  }, [stories, activeStoryId]);

  const deleteStory = useCallback(async (storyId: string) => {
    const charactersKey = getCharactersStorageKey(storyId);
    const storedCharacters = await storage.getItem<CharacterProfile[]>(charactersKey);
    if (storedCharacters) {
      for (const char of storedCharacters) {
        const sheetKey = getCharacterSheetStorageKey(storyId, char.id);
        await storage.removeItem(sheetKey);
      }
    }
    await storage.removeItem(charactersKey);
    await storage.removeItem(getOutlineStorageKey(storyId));
    await storage.removeItem(getPlotPointsStorageKey(storyId));
    await storage.removeItem(getTimelineEventsStorageKey(storyId));
    await storage.removeItem(getEditorContentKey(storyId));
    await storage.removeItem(getWordGoalKey(storyId));
    await storage.removeItem(getActivityLogKey(storyId));
    await storage.removeItem(getDocumentsStorageKey(storyId));
    
    const updatedStories = stories.filter(s => s.id !== storyId);
    setStories(updatedStories);
    await storage.setItem(STORIES_STORAGE_KEY, updatedStories);
    if (activeStoryId === storyId) {
      await setActiveStory(null);
    }
  }, [activeStoryId, setActiveStory, stories]);

  const refreshStories = useCallback(async () => {
    await loadStories();
  }, [loadStories]);


  if (!isLoaded) {
    return null;
  }

  return (
    <StoryContext.Provider value={{ stories, activeStoryId, activeStoryName, setActiveStory, addStory, updateStory, deleteStory, refreshStories }}>
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
  
export const getEditorContentKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-active-document-content` : 'openwritingkit-active-document-content-noactive';

export const getWordGoalKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-word-goal` : 'openwritingkit-word-goal-noactive';

export const getActivityLogKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-activity-log` : 'openwritingkit-activity-log-noactive';

export const getDocumentsStorageKey = (storyId: string | null): string =>
  storyId ? `openwritingkit-story-${storyId}-documents` : 'openwritingkit-documents-noactive';

export type { CharacterProfile };
