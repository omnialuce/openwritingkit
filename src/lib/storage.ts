'use client';

import { cloudSync } from './cloud-sync';

let _cloudUserId: string | null = null;
// Callback set by the app to surface a quota warning toast without this lib
// importing UI components (which would create circular deps).
let _onQuotaExceeded: (() => void) | null = null;

export function setCloudUserId(uid: string | null) {
  _cloudUserId = uid;
}

export function setOnQuotaExceeded(cb: () => void) {
  _onQuotaExceeded = cb;
}

class StorageService {
  async setItem<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    const json = JSON.stringify(value);
    try {
      window.localStorage.setItem(key, json);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        _onQuotaExceeded?.();
        return;
      }
      throw e;
    }
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
