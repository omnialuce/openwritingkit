'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, CheckCircle } from 'lucide-react';
import { detectCliches } from '@/lib/cliche-list';
import { stripHtml } from '@/lib/text-analytics';
import { useStoryContext, getDocumentsStorageKey, getEditorContentKey, type DocumentItem } from '@/contexts/StoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';

interface EditorData { current: string }

export function ClicheDetectorCard() {
  const { t } = useLanguage();
  const { activeStoryId } = useStoryContext();
  const { user } = useAuth();
  const [found, setFound] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = useCallback(async () => {
    if (!activeStoryId || !user) return;
    setLoading(true);
    try {
      let html = '';
      const docsKey = getDocumentsStorageKey(activeStoryId, user.uid);
      const docs = await storage.getItem<DocumentItem[]>(docsKey) ?? [];
      const collect = async (items: DocumentItem[]) => {
        for (const item of items) {
          if (item.type === 'file' || item.type === 'scene') {
            const key = getEditorContentKey(activeStoryId, item.id, user.uid);
            const data = await storage.getItem<EditorData>(key);
            if (data?.current) html += ' ' + data.current;
          }
          if (item.children) await collect(item.children);
        }
      };
      await collect(docs);
      const text = stripHtml(html);
      setTimeout(() => {
        setFound(detectCliches(text));
        setLoading(false);
      }, 30);
    } catch {
      setLoading(false);
    }
  }, [activeStoryId, user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {t('cliche.title')}
        </CardTitle>
        <CardDescription>{t('cliche.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleScan} disabled={loading || !activeStoryId} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? t('cliche.scanning') : t('cliche.scan_button')}
        </Button>

        {!activeStoryId && (
          <p className="text-sm text-muted-foreground text-center">{t('writing_tools.no_story')}</p>
        )}

        {found !== null && (
          <div className="space-y-3">
            {found.length === 0 ? (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {t('cliche.none_found')}
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {t('cliche.found_count', { count: String(found.length) })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {found.map((c, i) => (
                    <Badge key={i} variant="destructive" className="text-xs font-normal">
                      {c}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{t('cliche.tip')}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
