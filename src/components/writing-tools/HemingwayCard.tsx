'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Pen, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { analyzeStyle, type StyleAnalysisResult } from '@/lib/style-checker';
import { useStoryContext, getDocumentsStorageKey, getEditorContentKey, type DocumentItem } from '@/contexts/StoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';

interface EditorData { current: string }

export function HemingwayCard() {
  const { t } = useLanguage();
  const { activeStoryId } = useStoryContext();
  const { user } = useAuth();
  const [result, setResult] = useState<StyleAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = useCallback(async () => {
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
      // setTimeout so React renders the loading state before the sync NLP work
      setTimeout(() => {
        setResult(analyzeStyle(html));
        setLoading(false);
      }, 30);
    } catch {
      setLoading(false);
    }
  }, [activeStoryId, user]);

  const gradeColor = result
    ? result.grade === 'clean' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    : result.grade === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pen className="h-5 w-5 text-primary" />
          {t('hemingway.title')}
        </CardTitle>
        <CardDescription>{t('hemingway.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAnalyze} disabled={loading || !activeStoryId} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? t('hemingway.analyzing') : t('hemingway.analyze_button')}
        </Button>

        {!activeStoryId && (
          <p className="text-sm text-muted-foreground text-center">{t('writing_tools.no_story')}</p>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('hemingway.prose_grade')}</span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded ${gradeColor}`}>
                {t(`hemingway.grade_${result.grade}`)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric label={t('hemingway.adverbs')} value={result.adverbs.length}
                icon={result.adverbs.length > 5 ? 'warn' : 'ok'} />
              <Metric label={t('hemingway.passive')} value={result.passiveVoiceCount}
                icon={result.passiveVoiceCount > 3 ? 'warn' : 'ok'} />
              <Metric label={t('hemingway.complex')} value={result.complexSentenceCount}
                icon={result.complexSentenceCount > 2 ? 'warn' : 'ok'} />
              <Metric label={t('hemingway.weak_verbs')} value={result.weakVerbCount}
                icon={result.weakVerbCount > 10 ? 'warn' : 'ok'} />
            </div>

            {result.adverbs.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{t('hemingway.adverb_list')}</p>
                <div className="flex flex-wrap gap-1">
                  {result.adverbs.slice(0, 12).map(a => (
                    <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                  ))}
                  {result.adverbs.length > 12 && (
                    <Badge variant="secondary" className="text-xs">+{result.adverbs.length - 12}</Badge>
                  )}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              {t('hemingway.tip')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: 'warn' | 'ok' }) {
  return (
    <div className="flex items-center justify-between rounded-md border p-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 font-medium">
        {value}
        {icon === 'warn'
          ? <AlertTriangle className="h-3 w-3 text-yellow-500" />
          : <CheckCircle className="h-3 w-3 text-green-500" />}
      </div>
    </div>
  );
}
