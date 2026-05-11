'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Wand2 } from 'lucide-react';
import { generateWritingPrompt, type PromptGeneratorInput } from '@/lib/prompt-templates';
import { useStoryContext, getDocumentsStorageKey, getCharactersStorageKey } from '@/contexts/StoryContext';
import type { CharacterProfile } from '@/app/(app)/characters/page';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  content?: string;
  children?: DocumentItem[];
}

function flattenDocuments(items: DocumentItem[]): DocumentItem[] {
  let flat: DocumentItem[] = [];
  for (const item of items) {
    flat.push(item);
    if (item.children) {
      flat = flat.concat(flattenDocuments(item.children));
    }
  }
  return flat;
}

export function PromptGeneratorCard() {
  const { t } = useLanguage();
  const { activeStoryId } = useStoryContext();
  const { user } = useAuth();

  const [genre, setGenre] = useState('');
  const [style, setStyle] = useState('');
  const [notes, setNotes] = useState('');
  const [prompt, setPrompt] = useState('');

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [selectedCharacterId, setSelectedCharacterId] = useState('');

  useEffect(() => {
    if (activeStoryId && user) {
      const docKey = getDocumentsStorageKey(activeStoryId, user.uid);
      storage.getItem<DocumentItem[]>(docKey).then(parsed => {
        setDocuments(parsed ? flattenDocuments(parsed) : []);
      });

      const charKey = getCharactersStorageKey(activeStoryId, user.uid);
      storage.getItem<CharacterProfile[]>(charKey).then(parsed => {
        setCharacters(parsed ?? []);
      });
    } else {
      setDocuments([]);
      setCharacters([]);
    }
  }, [activeStoryId, user]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setPrompt('');

    const selectedDoc = documents.find(d => d.id === selectedDocumentId);
    const selectedChar = characters.find(c => c.id === selectedCharacterId);

    const input: PromptGeneratorInput = {
      genre,
      style,
      notes: notes || undefined,
      characterName: selectedChar?.name,
      characterRole: selectedChar?.role || undefined,
      documentHint: selectedDoc?.content
        ? selectedDoc.content.replace(/<[^>]+>/g, ' ').slice(0, 300)
        : undefined,
    };

    setPrompt(generateWritingPrompt(input));
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

      <form onSubmit={handleGenerate}>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="genre">{t('prompt_generator.genre_label')}</Label>
              <Input
                id="genre"
                value={genre}
                onChange={e => setGenre(e.target.value)}
                placeholder={t('prompt_generator.genre_placeholder')}
                required
              />
            </div>
            <div>
              <Label htmlFor="style">{t('prompt_generator.style_label')}</Label>
              <Input
                id="style"
                value={style}
                onChange={e => setStyle(e.target.value)}
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
              onChange={e => setNotes(e.target.value)}
              placeholder={t('prompt_generator.notes_placeholder')}
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="link-doc">{t('prompt_generator.link_doc_label')}</Label>
              <Select
                value={selectedDocumentId}
                onValueChange={setSelectedDocumentId}
                disabled={!activeStoryId || documents.length === 0}
              >
                <SelectTrigger id="link-doc">
                  <SelectValue
                    placeholder={
                      !activeStoryId
                        ? t('prompt_generator.no_story_placeholder')
                        : t('prompt_generator.doc_placeholder')
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

            <div>
              <Label htmlFor="link-char">{t('prompt_generator.link_char_label')}</Label>
              <Select
                value={selectedCharacterId}
                onValueChange={setSelectedCharacterId}
                disabled={!activeStoryId || characters.length === 0}
              >
                <SelectTrigger id="link-char">
                  <SelectValue
                    placeholder={
                      !activeStoryId
                        ? t('prompt_generator.no_story_placeholder')
                        : t('prompt_generator.char_placeholder')
                    }
                  />
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
              <Textarea
                id="generated-prompt"
                value={prompt}
                readOnly
                rows={5}
                className="bg-muted"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="gap-2">
          <Button type="submit" className="flex-1">
            <Wand2 className="mr-2 h-4 w-4" />
            {prompt ? t('prompt_generator.regenerate_button') : t('prompt_generator.submit_button')}
          </Button>
          {prompt && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setPrompt('')}
              title={t('prompt_generator.clear_button_title')}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
