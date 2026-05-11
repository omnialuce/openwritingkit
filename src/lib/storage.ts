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
      if (!item) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        // Legacy: value was stored as a plain string without JSON.stringify.
        // Return it as-is so callers that expect a string still work.
        return item as unknown as T;
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
