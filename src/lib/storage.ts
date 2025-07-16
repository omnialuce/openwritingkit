// src/lib/storage.ts

'use client';

// With Next-Auth, we don't need a complex storage class to switch between
// local and Drive storage based on a cookie.
// All data is currently stored in localStorage, namespaced by the user's ID/email
// in the StoryContext. This simplified service reflects that.
// Cloud sync would be a separate feature built on top of this.

class StorageService {
  
  constructor() {}

  public async setItem<T>(key: string, value: T): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }

  public async getItem<T>(key: string): Promise<T | null> {
    if (typeof window !== 'undefined') {
      const item = window.localStorage.getItem(key);
      try {
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error(`Error parsing JSON from localStorage for key "${key}":`, error);
        return null;
      }
    }
    return null;
  }

  public async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }
}

export const storage = new StorageService();
