'use client';

import { supabase } from './supabase';

const BUCKET = 'owk-data';

// Map a localStorage key to a Supabase Storage path.
// All user data lives under {userId}/... so RLS policies isolate it.
function toPath(userId: string, key: string): string {
  // Encode the key so slashes inside it don't create unintended folders
  return `${userId}/${encodeURIComponent(key)}`;
}

export const cloudSync = {
  async push(userId: string, key: string, value: string): Promise<void> {
    const path = toPath(userId, key);
    const blob = new Blob([value], { type: 'application/json' });
    await supabase.storage.from(BUCKET).upload(path, blob, { upsert: true });
  },

  async pull(userId: string, key: string): Promise<string | null> {
    const path = toPath(userId, key);
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error || !data) return null;
    return data.text();
  },

  async remove(userId: string, key: string): Promise<void> {
    const path = toPath(userId, key);
    await supabase.storage.from(BUCKET).remove([path]);
  },

  // Pull all of this user's files from Supabase into localStorage.
  // Called once after login so the rest of the app reads instantly from cache.
  async pullAll(userId: string): Promise<void> {
    const { data: files, error } = await supabase.storage
      .from(BUCKET)
      .list(userId, { limit: 1000 });

    if (error || !files) return;

    await Promise.all(
      files.map(async (file) => {
        const path = `${userId}/${file.name}`;
        const { data } = await supabase.storage.from(BUCKET).download(path);
        if (!data) return;
        const text = await data.text();
        const key = decodeURIComponent(file.name);
        window.localStorage.setItem(key, text);
      }),
    );
  },

  // Push all OpenWritingKit-namespaced localStorage keys up to Supabase.
  // Used for one-time migration from a pre-cloud install and the
  // "Back up to cloud" button in settings.
  async pushAll(userId: string): Promise<void> {
    const entries: Array<{ key: string; value: string }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (!key.startsWith('openwritingkit-')) continue;
      const value = localStorage.getItem(key);
      if (value !== null) entries.push({ key, value });
    }
    await Promise.all(entries.map(({ key, value }) => cloudSync.push(userId, key, value)));
  },
};
