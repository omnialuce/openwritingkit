'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, AlertTriangle } from 'lucide-react';
import { analyzePovTense, type PovTenseResult } from '@/lib/style-checker';
import { useStoryContext, getDocumentsStorageKey, getEditorContentKey, type DocumentItem } from '@/contexts/StoryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';

interface EditorData { current: string }

export function POVTenseCard() {
  const { t } = useLanguage();
  const { activeStoryId } = useStoryContext();
  const { user } = useAuth();
  const [result, setResult] = useState<PovTenseResult | null>(null);
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
      setTimeout(() => {
        setResult(analyzePovTense(html));
        setLoading(false);
      }, 30);
    } catch {
      setLoading(false);
    }
  }, [activeStoryId, user]);

  const povLabel = (pov: PovTenseResult['dominantPov']) =>
    t(`pov_tense.pov_${pov}` as never);
  const tenseLabel = (tense: PovTenseResult['dominantTense']) =>
    t(`pov_tense.tense_${tense}` as never);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          {t('pov_tense.title')}
        </CardTitle>
        <CardDescription>{t('pov_tense.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAnalyze} disabled={loading || !activeStoryId} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? t('pov_tense.analyzing') : t('pov_tense.analyze_button')}
        </Button>

        {!activeStoryId && (
          <p className="text-sm text-muted-foreground text-center">{t('writing_tools.no_story')}</p>
        )}

        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InfoBox label={t('pov_tense.dominant_pov')} value={povLabel(result.dominantPov)} />
              <InfoBox label={t('pov_tense.dominant_tense')} value={tenseLabel(result.dominantTense)} />
            </div>

            <div className="rounded-md border p-3 space-y-1 text-sm">
              <p className="font-medium text-muted-foreground text-xs mb-2">{t('pov_tense.pronoun_breakdown')}</p>
              <PovBar label={t('pov_tense.first_person')} count={result.firstPersonCount} max={Math.max(result.firstPersonCount, result.secondPersonCount, result.thirdPersonCount, 1)} />
              <PovBar label={t('pov_tense.second_person')} count={result.secondPersonCount} max={Math.max(result.firstPersonCount, result.secondPersonCount, result.thirdPersonCount, 1)} />
              <PovBar label={t('pov_tense.third_person')} count={result.thirdPersonCount} max={Math.max(result.firstPersonCount, result.secondPersonCount, result.thirdPersonCount, 1)} />
            </div>

            {result.inconsistencies.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle className="h-3 w-3" />
                  {t('pov_tense.inconsistencies')} ({result.inconsistencies.length})
                </p>
                <ul className="space-y-1">
                  {result.inconsistencies.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground border-l-2 border-yellow-400 pl-2 italic">
                      "{s}"
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.inconsistencies.length === 0 && result.dominantTense !== 'unknown' && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✓ {t('pov_tense.consistent')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function PovBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = Math.round((count / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs w-8 text-right">{count}</span>
    </div>
  );
}
