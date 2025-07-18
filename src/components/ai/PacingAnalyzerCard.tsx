// src/components/ai/PacingAnalyzerCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Activity } from 'lucide-react';
import { analyzeTextPacing, type AnalyzeTextPacingInput } from '@/ai/flows/analyze-text-insights';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, getDocumentsStorageKey } from '@/contexts/StoryContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  content?: string;
  children?: DocumentItem[];
}

export function PacingAnalyzerCard() {
  const { t } = useLanguage();
  const { activeStoryId } = useStoryContext();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [genre, setGenre] = useState('');
  const [analysis, setAnalysis] = useState<{ pacingAnalysis: string; recommendations: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const flattenDocuments = (items: DocumentItem[]): DocumentItem[] => {
    let flatList: DocumentItem[] = [];
    for (const item of items) {
      if (item.type === 'file' || item.type === 'scene') {
        flatList.push(item);
      }
      if (item.children) {
        flatList = flatList.concat(flattenDocuments(item.children));
      }
    }
    return flatList;
  };
  
  useEffect(() => {
    if (activeStoryId) {
      const docKey = getDocumentsStorageKey(activeStoryId);
      const storedDocs = localStorage.getItem(docKey);
      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          setDocuments(flattenDocuments(parsedDocs));
        } catch (e) {
          setDocuments([]);
        }
      } else {
        setDocuments([]);
      }
    } else {
      setDocuments([]);
    }
    setSelectedDocumentId('');
  }, [activeStoryId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocumentId) {
        toast({ title: t('pacing_analyzer.toast.no_doc_title'), description: t('pacing_analyzer.toast.no_doc_desc'), variant: "destructive" });
        return;
    }
    
    const selectedDoc = documents.find(d => d.id === selectedDocumentId);
    if (!selectedDoc || !selectedDoc.content) {
        toast({ title: t('pacing_analyzer.toast.doc_empty_title'), description: t('pacing_analyzer.toast.doc_empty_desc'), variant: "destructive" });
        return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const input: AnalyzeTextPacingInput = { text: selectedDoc.content, genre: genre || undefined };
      const result = await analyzeTextPacing(input);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing pacing:', error);
      toast({
        title: t('pacing_analyzer.toast.error_title'),
        description: (error as Error).message || t('pacing_analyzer.toast.error_desc'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
           <div>
            <Label htmlFor="document-to-analyze">{t('pacing_analyzer.doc_label')}</Label>
            <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId} disabled={!activeStoryId || documents.length === 0}>
                <SelectTrigger id="document-to-analyze">
                    <SelectValue placeholder={!activeStoryId ? t('pacing_analyzer.no_story_placeholder') : t('pacing_analyzer.doc_placeholder')} />
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
          <div>
            <Label htmlFor="text-genre">{t('pacing_analyzer.genre_label')}</Label>
            <Input
              id="text-genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder={t('pacing_analyzer.genre_placeholder')}
            />
          </div>
          {analysis && (
            <ScrollArea className="h-64 p-4 border rounded-md bg-muted">
              <div>
                <h4 className="font-semibold mb-2">{t('pacing_analyzer.results.analysis_title')}</h4>
                <p className="text-sm mb-4 whitespace-pre-wrap">{analysis.pacingAnalysis}</p>
                <h4 className="font-semibold mb-2">{t('pacing_analyzer.results.recommendations_title')}</h4>
                <p className="text-sm whitespace-pre-wrap">{analysis.recommendations}</p>
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading || !selectedDocumentId} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
            {t('pacing_analyzer.submit_button')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
