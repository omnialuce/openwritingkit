// src/hooks/useAutosave.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

function useAutosave<T>(
  key: string,
  initialValue: T,
  saveInterval: number = 2000 // Default 2 seconds
): [T, (value: T) => void, boolean, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveValue = useCallback(
    (currentValue: T) => {
      if (typeof window !== 'undefined') {
        setIsSaving(true);
        try {
          const item = JSON.stringify(currentValue);
          window.localStorage.setItem(key, item);
          setLastSaved(new Date());
        } catch (error) {
          console.error(`Error saving to localStorage key "${key}":`, error);
        } finally {
          // Simulate saving time if needed, or remove for instant UI update
          setTimeout(() => setIsSaving(false), 500);
        }
      }
    },
    [key]
  );
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(value) !== window.localStorage.getItem(key)) {
         saveValue(value);
      }
    }, saveInterval);

    return () => clearTimeout(handler);
  }, [value, saveInterval, saveValue]);


  const clearSavedValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
        setValue(initialValue); // Reset state to initial value
        setLastSaved(null);
        console.log(`Cleared localStorage for key "${key}"`);
      } catch (error) {
        console.error(`Error clearing localStorage key "${key}":`, error);
      }
    }
  }, [key, initialValue]);

  return [value, setValue, isSaving, clearSavedValue];
}

export default useAutosave;
