// src/components/ai/PromptGeneratorCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2 } from 'lucide-react';
import { generateWritingPrompts, type GenerateWritingPromptsInput } from '@/ai/flows/generate-writing-prompts';
import { useToast } from "@/hooks/use-toast";
import { useStoryContext, getDocumentsStorageKey, getCharactersStorageKey } from '@/contexts/StoryContext';
import type { CharacterProfile } from '@/app/(app)/characters/page';
import { useLanguage } from '@/contexts/LanguageContext';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  content?: string;
  children?: DocumentItem[];
}


export function PromptGeneratorCard() {
  const { t } = useLanguage();
  const { activeStoryId } = useStoryContext();
  const [genre, setGenre] = useState('');
  const [style, setStyle] = useState('');
  const [notes, setNotes] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);

  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState('');

  const flattenDocuments = (items: DocumentItem[]): DocumentItem[] => {
    let flatList: DocumentItem[] = [];
    for (const item of items) {
      flatList.push(item);
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

      const charKey = getCharactersStorageKey(activeStoryId);
      const storedChars = localStorage.getItem(charKey);
      if (storedChars) {
        setCharacters(JSON.parse(storedChars));
      } else {
        setCharacters([]);
      }
    } else {
      setDocuments([]);
      setCharacters([]);
    }
  }, [activeStoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPrompt('');

    try {
      const selectedDoc = documents.find(d => d.id === selectedDocumentId);
      const selectedChar = characters.find(c => c.id === selectedCharacterId);
      
      const characterContext = selectedChar 
        ? `Name: ${selectedChar.name}\nRole: ${selectedChar.role || 'N/A'}\nDescription: ${selectedChar.description || 'N/A'}\nBackstory: ${selectedChar.backstory || 'N/A'}`
        : undefined;

      const input: GenerateWritingPromptsInput = { 
        genre, 
        style,
        notes: notes || undefined,
        documentContext: selectedDoc?.content || undefined,
        characterContext: characterContext,
      };
      
      const result = await generateWritingPrompts(input);
      setPrompt(result.prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: t('prompt_generator.toast.error_title'),
        description: (error as Error).message || t('prompt_generator.toast.error_desc'),
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
          <Wand2 className="h-6 w-6 text-primary" />
          <CardTitle>{t('prompt_generator.title')}</CardTitle>
        </div>
        <CardDescription>{t('prompt_generator.description')}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">{t('prompt_generator.genre_label')}</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder={t('prompt_generator.genre_placeholder')}
                required
              />
            </div>
            <div>
              <Label htmlFor="style">{t('prompt_generator.style_label')}</Label>
              <Input
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder={t('prompt_generator.style_placeholder')}
                required
              />
            </div>
          </div>
           <div>
            <Label htmlFor="notes">{t('prompt_generator.notes_label')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('prompt_generator.notes_placeholder')}
              rows={3}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="link-doc">{t('prompt_generator.link_doc_label')}</Label>
                <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId} disabled={!activeStoryId || documents.length === 0}>
                  <SelectTrigger id="link-doc">
                    <SelectValue placeholder={!activeStoryId ? t('prompt_generator.no_story_placeholder') : t('prompt_generator.doc_placeholder')} />
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
                <Label htmlFor="link-char">{t('prompt_generator.link_char_label')}</Label>
                <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId} disabled={!activeStoryId || characters.length === 0}>
                  <SelectTrigger id="link-char">
                    <SelectValue placeholder={!activeStoryId ? t('prompt_generator.no_story_placeholder') : t('prompt_generator.char_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {characters.map(char => (
                      <SelectItem key={char.id} value={char.id}>
                        {char.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>
          {prompt && (
            <div>
              <Label htmlFor="generated-prompt">{t('prompt_generator.generated_prompt_label')}</Label>
              <Textarea id="generated-prompt" value={prompt} readOnly rows={4} className="bg-muted" />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {t('prompt_generator.submit_button')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
