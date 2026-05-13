// src/app/(app)/stories/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpenCheck, PlusCircle, Edit, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, type Story } from '@/contexts/StoryContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StoriesPage() {
  const { t } = useLanguage();
  const { stories, activeStoryId, setActiveStory, addStory: contextAddStory, updateStory: contextUpdateStory, deleteStory: contextDeleteStory, refreshStories } = useStoryContext();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    refreshStories();
  }, [refreshStories]);


  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingStory(null);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (story: Story) => {
    setEditingStory(story);
    setTitle(story.title);
    setDescription(story.description);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const storyData = {
        title: title.trim(),
        description: description.trim(),
        lastModified: now,
      };

      if (editingStory) {
        contextUpdateStory({ ...editingStory, ...storyData });
      } else {
        const newStoryWithId = { ...storyData, id: crypto.randomUUID() };
        contextAddStory(newStoryWithId);
      }
      setIsDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStory = (id: string) => {
    contextDeleteStory(id);
  };

  const handleSelectStory = (storyId: string) => {
    setActiveStory(storyId);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <BookOpenCheck className="mr-3 h-8 w-8 text-primary" /> {t('stories.title')}
          </h1>
          <p className="text-muted-foreground">{t('stories.description')}</p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> {t('stories.create_button')}
        </Button>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <BookOpenCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('stories.no_stories')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stories.map(story => (
            <Card 
              key={story.id} 
              className={cn(
                "flex flex-col transition-all",
                activeStoryId === story.id && "border-primary ring-2 ring-primary shadow-lg"
              )}
            >
              <CardHeader>
                <CardTitle className="truncate">{story.title}</CardTitle>
                <CardDescription>{t('stories.last_modified')}: {new Date(story.lastModified).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4">{story.description || t('stories.no_description')}</p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  variant={activeStoryId === story.id ? "default" : "outline"} 
                  size="sm" 
                  className="w-full" 
                  onClick={() => handleSelectStory(story.id)}
                  disabled={activeStoryId === story.id}
                >
                  {activeStoryId === story.id ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
                  {activeStoryId === story.id ? t('stories.active_story') : t('stories.select_story')}
                </Button>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(story)} className="flex-1">
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
                        <AlertDialogTitle>{t('stories.delete_dialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('stories.delete_dialog.description_1')} "{story.title}". 
                          {t('stories.delete_dialog.description_2')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteStory(story.id)}>
                          {t('stories.delete_dialog.confirm_button')}
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
                <DialogTitle>{editingStory ? t('stories.edit_dialog.title') : t('stories.create_dialog.title')}</DialogTitle>
                <DialogDescription>
                  {editingStory ? t('stories.edit_dialog.description') : t('stories.create_dialog.description')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="story-title" className="text-right">{t('stories.fields.title')}</Label>
                  <Input id="story-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required placeholder={t('stories.fields.title_placeholder')} />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="story-description" className="text-right pt-2">{t('stories.fields.description')}</Label>
                  <Textarea 
                    id="story-description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="col-span-3" 
                    rows={5} 
                    placeholder={t('stories.fields.description_placeholder')}
                  />
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">{t('common.cancel')}</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingStory ? t('common.save') : t('stories.create_button')}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
