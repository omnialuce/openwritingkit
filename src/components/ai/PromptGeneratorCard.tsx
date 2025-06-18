// src/components/ai/PromptGeneratorCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2 } from 'lucide-react';
import { generateWritingPrompts, type GenerateWritingPromptsInput } from '@/ai/flows/generate-writing-prompts';
import { useToast } from "@/hooks/use-toast";

export function PromptGeneratorCard() {
  const [genre, setGenre] = useState('');
  const [style, setStyle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrompt('');

    try {
      const input: GenerateWritingPromptsInput = { genre, style };
      const result = await generateWritingPrompts(input);
      setPrompt(result.prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Error Generating Prompt",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" />
          <CardTitle>Writing Prompt Generator</CardTitle>
        </div>
        <CardDescription>Get inspired with a custom writing prompt based on your preferences.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Fantasy, Sci-Fi, Mystery"
              required
            />
          </div>
          <div>
            <Label htmlFor="style">Style</Label>
            <Input
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="e.g., Humorous, Dark, Poetic"
              required
            />
          </div>
          {prompt && (
            <div>
              <Label htmlFor="generated-prompt">Generated Prompt:</Label>
              <Textarea id="generated-prompt" value={prompt} readOnly rows={4} className="bg-muted" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Prompt
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
