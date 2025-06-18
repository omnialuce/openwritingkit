// src/components/ai/PacingAnalyzerCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Activity } from 'lucide-react';
import { analyzeTextPacing, type AnalyzeTextPacingInput } from '@/ai/flows/analyze-text-insights';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';

export function PacingAnalyzerCard() {
  const [text, setText] = useState('');
  const [genre, setGenre] = useState('');
  const [analysis, setAnalysis] = useState<{ pacingAnalysis: string; recommendations: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAnalysis(null);

    try {
      const input: AnalyzeTextPacingInput = { text, genre: genre || undefined };
      const result = await analyzeTextPacing(input);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing pacing:', error);
      toast({
        title: "Error Analyzing Pacing",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <CardTitle>Pacing Analyzer</CardTitle>
        </div>
        <CardDescription>Get AI-powered feedback on your story's pacing.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="text-to-analyze">Text to Analyze</Label>
            <Textarea
              id="text-to-analyze"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your story excerpt here..."
              rows={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="text-genre">Genre (Optional)</Label>
            <Input
              id="text-genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Thriller, Romance"
            />
          </div>
          {analysis && (
            <ScrollArea className="h-64 p-4 border rounded-md bg-muted">
              <div>
                <h4 className="font-semibold mb-2">Pacing Analysis:</h4>
                <p className="text-sm mb-4 whitespace-pre-wrap">{analysis.pacingAnalysis}</p>
                <h4 className="font-semibold mb-2">Recommendations:</h4>
                <p className="text-sm whitespace-pre-wrap">{analysis.recommendations}</p>
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
            Analyze Pacing
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
