// src/app/(app)/research/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Microscope, PlusCircle, Edit, Trash2, AlertTriangle, Badge } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, getResearchStorageKey } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  tags?: string[];
}

export default function ResearchPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeStoryId } = useStoryContext();
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const storageKey = getResearchStorageKey(activeStoryId, user?.uid);
      const storedNotes = localStorage.getItem(storageKey);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes([]);
      }
    } else if (!activeStoryId) {
      setNotes([]);
    }
  }, [activeStoryId, user]);

  const saveNotes = (updatedNotes: ResearchNote[]) => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const storageKey = getResearchStorageKey(activeStoryId, user?.uid);
      setNotes(updatedNotes);
      localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags('');
    setEditingNote(null);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (note: ResearchNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags?.join(', ') || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeStoryId) return;

    const newNoteData = {
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (editingNote) {
      const updatedNotes = notes.map(note =>
        note.id === editingNote.id ? { ...note, ...newNoteData } : note
      );
      saveNotes(updatedNotes);
    } else {
      const newNoteWithId = { ...newNoteData, id: Date.now().toString() };
      saveNotes([...notes, newNoteWithId]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
  };

  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('research.no_story.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('research.no_story.description_1')} <Link href="/stories" className="text-primary hover:underline">{t('research.no_story.description_2')}</Link> {t('research.no_story.description_3')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Microscope className="mr-3 h-8 w-8 text-primary" /> {t('research.title')}
          </h1>
          <p className="text-muted-foreground">{t('research.description')}</p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> {t('research.create_button')}
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Microscope className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('research.no_notes')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{note.title}</CardTitle>
                  <div className="flex gap-2">
                     <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(note)}>
                        <Edit className="h-4 w-4" />
                     </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                           <AlertDialogHeader>
                              <AlertDialogTitle>{t('research.delete_dialog.title')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('research.delete_dialog.description')}</AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteNote(note.id)}>{t('common.delete')}</AlertDialogAction>
                           </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                  </div>
                </div>
                 {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {note.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1 pr-3">
              <DialogHeader>
                <DialogTitle>{editingNote ? t('research.edit_dialog.title') : t('research.create_dialog.title')}</DialogTitle>
                <DialogDescription>
                  {editingNote ? t('research.edit_dialog.description') : t('research.create_dialog.description')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">{t('research.fields.title')}</Label>
                  <Input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-content">{t('research.fields.content')}</Label>
                  <Textarea id="note-content" value={content} onChange={(e) => setContent(e.target.value)} rows={10} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-tags">{t('research.fields.tags')}</Label>
                  <Input id="note-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t('research.fields.tags_placeholder')} />
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">{t('common.cancel')}</Button>
                  </DialogClose>
                  <Button type="submit">{editingNote ? t('common.save') : t('research.create_button')}</Button>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
