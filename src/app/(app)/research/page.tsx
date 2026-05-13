
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
import { Microscope, PlusCircle, Edit, Trash2, AlertTriangle, CheckSquare, Square, ListTodo } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, getResearchStorageKey, getResearchTodosStorageKey } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  tags?: string[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function ResearchPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeStoryId } = useStoryContext();

  // Research Notes State
  const [notes, setNotes] = useState<ResearchNote[]>([]);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  
  // To-Do List State
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  

  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      const notesKey = getResearchStorageKey(activeStoryId, user.uid);
      const storedNotes = localStorage.getItem(notesKey);
      if (storedNotes) {
        try {
          setNotes(JSON.parse(storedNotes));
        } catch {
          setNotes([]);
        }
      } else setNotes([]);

      const todosKey = getResearchTodosStorageKey(activeStoryId, user.uid);
      const storedTodos = localStorage.getItem(todosKey);
      if (storedTodos) {
        try {
          setTodos(JSON.parse(storedTodos));
        } catch {
          setTodos([]);
        }
      } else setTodos([]);
    } else if (!activeStoryId) {
      setNotes([]);
      setTodos([]);
    }
  }, [activeStoryId, user]);

  const saveNotes = (updatedNotes: ResearchNote[]) => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      const storageKey = getResearchStorageKey(activeStoryId, user.uid);
      setNotes(updatedNotes);
      localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    }
  };
  
  const saveTodos = (updatedTodos: TodoItem[]) => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      const storageKey = getResearchTodosStorageKey(activeStoryId, user.uid);
      setTodos(updatedTodos);
      localStorage.setItem(storageKey, JSON.stringify(updatedTodos));
    }
  };

  const resetNoteForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setEditingNote(null);
  };

  const handleOpenCreateNoteDialog = () => {
    resetNoteForm();
    setIsNoteDialogOpen(true);
  };

  const handleOpenEditNoteDialog = (note: ResearchNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags?.join(', ') || '');
    setIsNoteDialogOpen(true);
  };

  const handleNoteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !activeStoryId) return;

    const newNoteData = {
      title: noteTitle.trim(),
      content: noteContent.trim(),
      tags: noteTags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (editingNote) {
      const updatedNotes = notes.map(note =>
        note.id === editingNote.id ? { ...note, ...newNoteData } : note
      );
      saveNotes(updatedNotes);
    } else {
      const newNoteWithId = { ...newNoteData, id: crypto.randomUUID() };
      saveNotes([...notes, newNoteWithId]);
    }
    setIsNoteDialogOpen(false);
    resetNoteForm();
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
  };

  const handleAddTodo = (e: FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim() || !activeStoryId) return;
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: newTodoText.trim(),
      completed: false,
    };
    saveTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  const handleToggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updatedTodos);
  };
  
  const handleDeleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
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
        <Button onClick={handleOpenCreateNoteDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> {t('research.create_button')}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold">{t('research.notes.title')}</h2>
          {notes.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Microscope className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('research.no_notes')}</p>
              </CardContent>
            </Card>
          ) : (
            notes.map(note => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{note.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEditNoteDialog(note)}>
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
            ))
          )}
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListTodo /> {t('research.todo.title')}</CardTitle>
              <CardDescription>{t('research.todo.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                <Input 
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder={t('research.todo.placeholder')}
                />
                <Button type="submit" size="icon"><PlusCircle className="h-4 w-4" /></Button>
              </form>
              <Separator />
              <ScrollArea className="h-96 mt-4">
                <div className="space-y-3 pr-4">
                  {todos.length > 0 ? (
                    todos.map(todo => (
                      <div key={todo.id} className="flex items-center gap-3">
                        <Checkbox 
                          id={`todo-${todo.id}`}
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleTodo(todo.id)}
                        />
                        <label 
                           htmlFor={`todo-${todo.id}`}
                           className={cn("flex-grow text-sm cursor-pointer", todo.completed && "line-through text-muted-foreground")}
                        >
                          {todo.text}
                        </label>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteTodo(todo.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('research.todo.empty')}</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isNoteDialogOpen} onOpenChange={(isOpen) => {
          setIsNoteDialogOpen(isOpen);
          if (!isOpen) resetNoteForm();
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
              <form onSubmit={handleNoteSubmit} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">{t('research.fields.title')}</Label>
                  <Input id="note-title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-content">{t('research.fields.content')}</Label>
                  <Textarea id="note-content" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={10} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note-tags">{t('research.fields.tags')}</Label>
                  <Input id="note-tags" value={noteTags} onChange={(e) => setNoteTags(e.target.value)} placeholder={t('research.fields.tags_placeholder')} />
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
