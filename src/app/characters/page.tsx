
// src/app/characters/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, PlusCircle, Edit, Trash2, FileImage } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CharacterProfile {
  id: string;
  name: string;
  description?: string;
  backstory?: string;
  imageUrl?: string;
  imageHint?: string; // For data-ai-hint
}

const CHARACTERS_STORAGE_KEY = 'openwritingkit-characters';

const initialCharacters: CharacterProfile[] = [
  {
    id: 'char1',
    name: 'Anya Sharma',
    description: 'A resourceful investigator with a mysterious past.',
    backstory: 'Orphaned at a young age, Anya honed her survival skills on the streets before being recruited by a clandestine organization. She is haunted by fragmented memories of her parents.',
    imageUrl: 'https://placehold.co/300x400.png',
    imageHint: 'female investigator'
  },
  {
    id: 'char2',
    name: 'Kaelen Vance',
    description: 'A charismatic but morally ambiguous sorcerer.',
    backstory: 'Once a promising student at the Grand Academy, Kaelen was exiled after dabbling in forbidden magic. He seeks power to prove his former masters wrong, often blurring the line between hero and villain.',
    imageUrl: 'https://placehold.co/300x400.png',
    imageHint: 'male sorcerer'
  },
];


export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterProfile | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backstory, setBackstory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageHint, setImageHint] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCharacters = localStorage.getItem(CHARACTERS_STORAGE_KEY);
      if (storedCharacters) {
        setCharacters(JSON.parse(storedCharacters));
      } else {
        setCharacters(initialCharacters); // Load initial if nothing in storage
        localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(initialCharacters));
      }
    }
  }, []);

  const saveCharacters = (updatedCharacters: CharacterProfile[]) => {
    setCharacters(updatedCharacters);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(updatedCharacters));
    }
  };

  const resetForm = () => {
    setName('');
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
    setDescription(character.description || '');
    setBackstory(character.backstory || '');
    setImageUrl(character.imageUrl || '');
    setImageHint(character.imageHint || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCharacterData = {
      name: name.trim(),
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" /> Character Development
          </h1>
          <p className="text-muted-foreground">Create, manage, and explore your story's characters.</p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Profile
        </Button>
      </div>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No character profiles yet. Start by creating one!</p>
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
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={character.imageHint || 'portrait character'}
                    />
                  </div>
                )}
                <CardTitle>{character.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {character.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{character.description}</p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(character)} className="flex-1">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the character profile for {character.name}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteCharacter(character.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                <DialogTitle>{editingCharacter ? 'Edit Character Profile' : 'Create New Character Profile'}</DialogTitle>
                <DialogDescription>
                  {editingCharacter ? 'Update the details for this character.' : 'Fill in the details for your new character.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="char-name" className="text-right">Name</Label>
                  <Input id="char-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="char-image-url" className="text-right">Image URL</Label>
                  <Input 
                    id="char-image-url" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    className="col-span-3" 
                    placeholder="https://placehold.co/300x400.png"
                  />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="char-image-hint" className="text-right">Image Hint</Label>
                  <Input 
                    id="char-image-hint" 
                    value={imageHint} 
                    onChange={(e) => setImageHint(e.target.value)} 
                    className="col-span-3" 
                    placeholder="Keywords for AI (e.g., male wizard)"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="char-description" className="text-right pt-2">Description</Label>
                  <Textarea id="char-description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={3} placeholder="A brief summary of the character."/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="char-backstory" className="text-right pt-2">Backstory</Label>
                  <Textarea id="char-backstory" value={backstory} onChange={(e) => setBackstory(e.target.value)} className="col-span-3" rows={5} placeholder="Detailed history and background."/>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">{editingCharacter ? 'Save Changes' : 'Create Profile'}</Button>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <div className="text-center mt-12 p-6 bg-card border rounded-md">
        <FileImage className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Visualize Your Characters</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Add image URLs (e.g., from <code className="text-xs p-1 bg-muted rounded-sm">https://placehold.co</code> or your own sources) to bring your characters to life.
          Future updates will include richer profile fields and relationship mapping.
        </p>
      </div>
    </div>
  );
}
