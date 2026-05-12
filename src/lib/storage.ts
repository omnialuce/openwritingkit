'use client';

import { cloudSync } from './cloud-sync';

// The active user ID is set by AuthContext after login so this module can
// shadow-write to the cloud without importing AuthContext (which would create
// a circular dependency).
let _cloudUserId: string | null = null;

export function setCloudUserId(uid: string | null) {
  _cloudUserId = uid;
}

class StorageService {
  async setItem<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    const json = JSON.stringify(value);
    window.localStorage.setItem(key, json);
    if (_cloudUserId) {
      cloudSync.push(_cloudUserId, key, json).catch(() => {});
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      // Legacy: value was stored as a plain string without JSON.stringify
      return item as unknown as T;
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
    if (_cloudUserId) {
      cloudSync.remove(_cloudUserId, key).catch(() => {});
    }
  }
}

export const storage = new StorageService();
