
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

  const loadStories = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedStories = localStorage.getItem(STORIES_STORAGE_KEY);
      const loadedStories = storedStories ? JSON.parse(storedStories) : [];
      setStories(loadedStories);
      return loadedStories;
    }
    return [];
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadedStories = loadStories();
      const storedActiveId = localStorage.getItem(ACTIVE_STORY_ID_KEY);
      if (storedActiveId) {
        const foundActiveStory = loadedStories.find(s => s.id === storedActiveId);
        if (foundActiveStory) {
          setActiveStoryIdState(storedActiveId);
          setActiveStoryName(foundActiveStory.title);
        } else {
          // Active ID points to a non-existent story, clear it
          localStorage.removeItem(ACTIVE_STORY_ID_KEY);
          setActiveStoryIdState(null);
          setActiveStoryName(null);
        }
      }
      setIsLoaded(true);
    }
  }, [loadStories]);

  const setActiveStory = useCallback((storyId: string | null) => {
    if (typeof window !== 'undefined') {
      if (storyId) {
        localStorage.setItem(ACTIVE_STORY_ID_KEY, storyId);
        const story = stories.find(s => s.id === storyId);
        setActiveStoryName(story ? story.title : null);
      } else {
        localStorage.removeItem(ACTIVE_STORY_ID_KEY);
        setActiveStoryName(null);
      }
      setActiveStoryIdState(storyId);
    }
  }, [stories]);

  const addStory = useCallback((newStory: Story) => {
    setStories(prevStories => {
      const updatedStories = [...prevStories, newStory];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updatedStories));
      }
      return updatedStories;
    });
  }, []);

  const updateStory = useCallback((updatedStoryData: Story) => {
    setStories(prevStories => {
      const updatedStories = prevStories.map(s => s.id === updatedStoryData.id ? updatedStoryData : s);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updatedStories));
      }
      if (activeStoryId === updatedStoryData.id) {
        setActiveStoryName(updatedStoryData.title);
      }
      return updatedStories;
    });
  }, [activeStoryId]);

  const deleteStory = useCallback((storyId: string) => {
    // Also clean up associated character data
    if (typeof window !== 'undefined') {
        const charactersKey = getCharactersStorageKey(storyId);
        const storedCharacters = localStorage.getItem(charactersKey);
        if(storedCharacters) {
            const characters: CharacterProfile[] = JSON.parse(storedCharacters);
            characters.forEach(char => {
                const sheetKey = getCharacterSheetStorageKey(storyId, char.id);
                localStorage.removeItem(sheetKey);
            });
        }
        localStorage.removeItem(charactersKey);
        localStorage.removeItem(getOutlineStorageKey(storyId));
        localStorage.removeItem(getPlotPointsStorageKey(storyId));
        localStorage.removeItem(getTimelineEventsStorageKey(storyId));
        localStorage.removeItem(getEditorContentKey(storyId));
        localStorage.removeItem(getWordGoalKey(storyId));
        localStorage.removeItem(getActivityLogKey(storyId));
        localStorage.removeItem(getDocumentsStorageKey(storyId));
    }
    
    setStories(prevStories => {
      const updatedStories = prevStories.filter(s => s.id !== storyId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(updatedStories));
        if (activeStoryId === storyId) {
          setActiveStory(null); // Clear active story if it's deleted
        }
      }
      return updatedStories;
    });
  }, [activeStoryId, setActiveStory]);

  const refreshStories = useCallback(() => {
    loadStories();
  }, [loadStories]);


  if (!isLoaded && typeof window !== 'undefined') { // Check for window to avoid SSR issues with isLoaded
    return null; // Or a loading indicator
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

// Helper functions for dynamic localStorage keys
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
