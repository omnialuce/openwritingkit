// src/app/(app)/characters/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, PlusCircle, Edit, Trash2, FileImage, AlertTriangle, FileText, Network, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, getCharactersStorageKey } from '@/contexts/StoryContext';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export interface CharacterProfile {
  id: string;
  name: string;
  role?: string;
  description?: string;
  backstory?: string;
  imageUrl?: string;
  imageHint?: string;
}

export default function CharactersPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeStoryId } = useStoryContext();
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterProfile | null>(null);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [backstory, setBackstory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageHint, setImageHint] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      const storageKey = getCharactersStorageKey(activeStoryId, user.uid);
      const storedCharacters = localStorage.getItem(storageKey);
      if (storedCharacters) {
        setCharacters(JSON.parse(storedCharacters));
      } else {
        setCharacters([]);
      }
    } else if (!activeStoryId) {
      setCharacters([]);
    }
  }, [activeStoryId, user]);

  const saveCharacters = (updatedCharacters: CharacterProfile[]) => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      const storageKey = getCharactersStorageKey(activeStoryId, user.uid);
      setCharacters(updatedCharacters);
      localStorage.setItem(storageKey, JSON.stringify(updatedCharacters));
    }
  };

  const resetForm = () => {
    setName('');
    setRole('');
    setDescription('');
    setBackstory('');
    setImageUrl('');
    setImageHint('');
    setEditingCharacter(null);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (character: CharacterProfile) => {
    setEditingCharacter(character);
    setName(character.name);
    setRole(character.role || '');
    setDescription(character.description || '');
    setBackstory(character.backstory || '');
    setImageUrl(character.imageUrl || '');
    setImageHint(character.imageHint || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeStoryId) return;

    const newCharacterData = {
      name: name.trim(),
      role: role.trim() || undefined,
      description: description.trim() || undefined,
      backstory: backstory.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      imageHint: imageHint.trim() || undefined,
    };

    if (editingCharacter) {
      const updatedCharacters = characters.map(char =>
        char.id === editingCharacter.id ? { ...char, ...newCharacterData } : char
      );
      saveCharacters(updatedCharacters);
    } else {
      const newCharacterWithId = { ...newCharacterData, id: Date.now().toString() };
      saveCharacters([...characters, newCharacterWithId]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteCharacter = (id: string) => {
    const updatedCharacters = characters.filter(char => char.id !== id);
    saveCharacters(updatedCharacters);
  };
  
  const handleExport = (format: 'json' | 'txt') => {
    if (!activeStoryId) return;

    let data, filename, mimeType;

    if (format === 'json') {
      data = JSON.stringify(characters, null, 2);
      filename = 'characters.json';
      mimeType = 'application/json';
    } else { // txt format
      data = characters.map(c => 
        `${t('characters.export.name')}: ${c.name}\n` +
        `${t('characters.export.role')}: ${c.role || 'N/A'}\n` +
        `${t('characters.export.description')}: ${c.description || 'N/A'}\n` +
        `${t('characters.export.backstory')}: ${c.backstory || 'N/A'}\n` +
        `${t('characters.export.image_url')}: ${c.imageUrl || 'N/A'}\n` +
        '-----------------------------------\n'
      ).join('\n');
      filename = 'characters.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('characters.no_active_story_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('characters.no_active_story_desc_1')} <Link href="/stories" className="text-primary hover:underline">{t('characters.no_active_story_desc_2')}</Link> {t('characters.no_active_story_desc_3')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" /> {t('characters.title')}
          </h1>
          <p className="text-muted-foreground">{t('characters.description')}</p>
        </div>
        <div className="flex gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Download className="mr-2 h-5 w-5" /> {t('characters.export_button')}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport('json')}>{t('characters.export_as_json')}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('txt')}>{t('characters.export_as_text')}</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleOpenCreateDialog}>
              <PlusCircle className="mr-2 h-5 w-5" /> {t('characters.create_button')}
            </Button>
        </div>
      </div>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('characters.no_characters')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {characters.map(character => (
            <Card key={character.id} className="flex flex-col">
              <CardHeader>
                {character.imageUrl && (
                  <div className="relative aspect-[3/4] w-full mb-4 rounded-md overflow-hidden">
                    <Image
                      src={character.imageUrl}
                      alt={`Image of ${character.name}`}
                      fill
                      objectFit="cover"
                      data-ai-hint={character.imageHint || 'portrait character'}
                    />
                  </div>
                )}
                <CardTitle>{character.name}</CardTitle>
                {character.role && <Badge variant="secondary">{character.role}</Badge>}
              </CardHeader>
              <CardContent className="flex-grow">
                {character.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{character.description}</p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button asChild variant="default" className="w-full">
                  <Link href={`/characters/${character.id}`}>
                    <FileText className="mr-2 h-4 w-4" /> {t('characters.view_sheet_button')}
                  </Link>
                </Button>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(character)} className="flex-1">
                    <Edit className="mr-2 h-4 w-4" /> {t('common.edit')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('characters.delete_dialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('characters.delete_dialog.description_1')} {character.name}.
                          {t('characters.delete_dialog.description_2')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCharacter(character.id)}>
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1 pr-3">
              <DialogHeader>
                <DialogTitle>{editingCharacter ? t('characters.edit_dialog.title') : t('characters.create_dialog.title')}</DialogTitle>
                <DialogDescription>
                  {editingCharacter ? t('characters.edit_dialog.description') : t('characters.create_dialog.description')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="char-name" className="text-right">{t('characters.fields.name')}</Label>
                  <Input id="char-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="char-role" className="text-right">{t('characters.fields.role')}</Label>
                  <Input id="char-role" value={role} onChange={(e) => setRole(e.target.value)} className="col-span-3" placeholder={t('characters.fields.role_placeholder')}/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="char-image-url" className="text-right">{t('characters.fields.image_url')}</Label>
                  <Input 
                    id="char-image-url" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    className="col-span-3" 
                    placeholder="https://placehold.co/300x400.png"
                  />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="char-image-hint" className="text-right">{t('characters.fields.image_hint')}</Label>
                  <Input 
                    id="char-image-hint" 
                    value={imageHint} 
                    onChange={(e) => setImageHint(e.target.value)} 
                    className="col-span-3" 
                    placeholder={t('characters.fields.image_hint_placeholder')}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="char-description" className="text-right pt-2">{t('characters.fields.description')}</Label>
                  <Textarea id="char-description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} placeholder={t('characters.fields.description_placeholder')}/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="char-backstory" className="text-right pt-2">{t('characters.fields.backstory')}</Label>
                  <Textarea id="char-backstory" value={backstory} onChange={(e) => setBackstory(e.target.value)} className="col-span-3" rows={5} placeholder={t('characters.fields.backstory_placeholder')}/>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">{t('common.cancel')}</Button>
                  </DialogClose>
                  <Button type="submit">{editingCharacter ? t('common.save') : t('characters.create_button')}</Button>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <Card className="text-center mt-12 p-6 border">
        <Network className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('characters.relationship_map.title')}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('characters.relationship_map.description')}
        </p>
         <p className="text-sm text-primary mt-2">{t('common.coming_soon')}</p>
      </Card>
    </div>
  );
}
