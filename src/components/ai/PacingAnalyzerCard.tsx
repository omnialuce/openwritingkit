'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Activity, AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, getDocumentsStorageKey, getEditorContentKey } from '@/contexts/StoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { analyzePacing, type PacingAnalysisResult, type PacingLevel } from '@/lib/pacing-analysis';
import { cn } from '@/lib/utils';

interface DocumentItemFlat {
  id: string;
  name: string;
}

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  children?: DocumentItem[];
}

interface EditorData {
  current: string;
}

const PACING_COLORS: Record<PacingLevel, string> = {
  fast: 'text-green-600 dark:text-green-400',
  medium: 'text-amber-600 dark:text-amber-400',
  slow: 'text-blue-600 dark:text-blue-400',
};

const PACING_BG: Record<PacingLevel, string> = {
  fast: 'bg-green-100 dark:bg-green-950',
  medium: 'bg-amber-100 dark:bg-amber-950',
  slow: 'bg-blue-100 dark:bg-blue-950',
};

const PACING_LABELS: Record<PacingLevel, string> = {
  fast: 'Fast',
  medium: 'Medium',
  slow: 'Slow',
};

function PacingBadge({ level }: { level: PacingLevel }) {
  return (
    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-semibold', PACING_BG[level], PACING_COLORS[level])}>
      {PACING_LABELS[level]}
    </span>
  );
}

function MetricRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium">{value}</span>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function flattenDocuments(items: DocumentItem[]): DocumentItemFlat[] {
  let flat: DocumentItemFlat[] = [];
  for (const item of items) {
    if (item.type === 'file' || item.type === 'scene') {
      flat.push({ id: item.id, name: item.name });
    }
    if (item.children) {
      flat = flat.concat(flattenDocuments(item.children));
    }
  }
  return flat;
}

export function PacingAnalyzerCard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeStoryId } = useStoryContext();
  const [documents, setDocuments] = useState<DocumentItemFlat[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [result, setResult] = useState<PacingAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (activeStoryId && user) {
      const docKey = getDocumentsStorageKey(activeStoryId, user.uid);
      storage.getItem<DocumentItem[]>(docKey).then(parsed => {
        setDocuments(parsed ? flattenDocuments(parsed) : []);
      });
    } else {
      setDocuments([]);
    }
    setSelectedDocumentId('');
    setResult(null);
  }, [activeStoryId, user]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocumentId || !activeStoryId || !user) {
      toast({
        title: t('pacing_analyzer.toast.no_doc_title'),
        description: t('pacing_analyzer.toast.no_doc_desc'),
        variant: 'destructive',
      });
      return;
    }

    const editorKey = getEditorContentKey(activeStoryId, selectedDocumentId, user.uid);
    const editorData = await storage.getItem<EditorData>(editorKey);
    const content = editorData?.current;

    if (!content || content === '<p></p>' || content === '<p><br></p>') {
      toast({
        title: t('pacing_analyzer.toast.doc_empty_title'),
        description: t('pacing_analyzer.toast.doc_empty_desc'),
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    // Small timeout to let the loading state render before the synchronous NLP work runs
    await new Promise(r => setTimeout(r, 30));

    try {
      const analysis = analyzePacing(content);
      setResult(analysis);
    } catch (error) {
      console.error('Pacing analysis error:', error);
      toast({
        title: t('pacing_analyzer.toast.error_title'),
        description: t('pacing_analyzer.toast.error_desc'),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <CardTitle>{t('pacing_analyzer.title')}</CardTitle>
        </div>
        <CardDescription>{t('pacing_analyzer.description')}</CardDescription>
      </CardHeader>

      <form onSubmit={handleAnalyze}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="document-to-analyze">{t('pacing_analyzer.doc_label')}</Label>
            <Select
              value={selectedDocumentId}
              onValueChange={setSelectedDocumentId}
              disabled={!activeStoryId || documents.length === 0}
            >
              <SelectTrigger id="document-to-analyze">
                <SelectValue
                  placeholder={
                    !activeStoryId
                      ? t('pacing_analyzer.no_story_placeholder')
                      : documents.length > 0
                      ? t('pacing_analyzer.doc_placeholder')
                      : t('documents.empty_state.message')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {documents.map(doc => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {result && (
            <ScrollArea className="h-[420px]">
              <div className="space-y-4 pr-2">

                {/* Overall */}
                <div className={cn('rounded-md p-3 flex items-center gap-3', PACING_BG[result.overallLevel])}>
                  <TrendingUp className={cn('h-5 w-5 shrink-0', PACING_COLORS[result.overallLevel])} />
                  <div>
                    <p className="text-sm font-semibold">
                      Overall pacing: <PacingBadge level={result.overallLevel} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {result.wordCount.toLocaleString()} words · {result.paragraphs.count} paragraphs
                    </p>
                  </div>
                </div>

                {/* Sentence metrics */}
                <Card className="shadow-none">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm">{t('pacing_analyzer.results.sentence_title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <MetricRow
                      label={t('pacing_analyzer.results.avg_sentence_length')}
                      value={`${result.sentenceLength.average} words`}
                      sub={result.sentenceLength.average <= 12 ? 'Short — fast-paced' : result.sentenceLength.average <= 20 ? 'Medium — balanced' : 'Long — descriptive'}
                    />
                    <MetricRow
                      label={t('pacing_analyzer.results.sentence_variety')}
                      value={`±${result.sentenceLength.standardDeviation}`}
                      sub={result.sentenceLength.varietyLabel}
                    />
                    <MetricRow
                      label={t('pacing_analyzer.results.sentence_range')}
                      value={`${result.sentenceLength.min}–${result.sentenceLength.max} words`}
                    />
                  </CardContent>
                </Card>

                {/* Paragraph & dialogue */}
                <Card className="shadow-none">
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm">{t('pacing_analyzer.results.structure_title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <MetricRow
                      label={t('pacing_analyzer.results.avg_paragraph_length')}
                      value={`${result.paragraphs.averageWords} words`}
                    />
                    {result.paragraphs.longParagraphs > 0 && (
                      <MetricRow
                        label={t('pacing_analyzer.results.long_paragraphs')}
                        value={result.paragraphs.longParagraphs}
                        sub="Paragraphs over 150 words"
                      />
                    )}
                    <MetricRow
                      label={t('pacing_analyzer.results.dialogue_ratio')}
                      value={`${result.dialogue.percentage}%`}
                      sub={result.dialogue.label}
                    />
                  </CardContent>
                </Card>

                {/* Section breakdown */}
                {result.sections.length > 0 && (
                  <Card className="shadow-none">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm">{t('pacing_analyzer.results.sections_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1 space-y-2">
                      {result.sections.map(section => (
                        <div key={section.label} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{section.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{section.avgSentenceLength}w avg</span>
                            <PacingBadge level={section.level} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Callouts */}
                {result.callouts.length > 0 && (
                  <Card className="shadow-none">
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm">{t('pacing_analyzer.results.callouts_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1 space-y-2">
                      {result.callouts.map((callout, i) => (
                        <div key={i} className="flex items-start gap-2">
                          {callout.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}
                          {callout.type === 'positive' && <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />}
                          {callout.type === 'tip' && <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />}
                          <p className="text-xs">{callout.message}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isAnalyzing || !selectedDocumentId} className="w-full">
            {isAnalyzing
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('pacing_analyzer.analyzing_button')}</>
              : <><Activity className="mr-2 h-4 w-4" />{t('pacing_analyzer.submit_button')}</>
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
