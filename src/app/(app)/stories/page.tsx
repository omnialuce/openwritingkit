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
import { BookOpenCheck, PlusCircle, Edit, Trash2, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, type Story } from '@/contexts/StoryContext';
import { cn } from '@/lib/utils';

export default function StoriesPage() {
  const { stories, activeStoryId, setActiveStory, addStory: contextAddStory, updateStory: contextUpdateStory, deleteStory: contextDeleteStory, refreshStories } = useStoryContext();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    refreshStories(); // Ensure stories are up-to-date on mount
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date().toISOString();
    const storyData = {
      title: title.trim(),
      description: description.trim(),
      lastModified: now,
    };

    if (editingStory) {
      contextUpdateStory({ ...editingStory, ...storyData });
    } else {
      const newStoryWithId = { ...storyData, id: Date.now().toString() };
      contextAddStory(newStoryWithId);
    }
    setIsDialogOpen(false);
    resetForm();
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
            <BookOpenCheck className="mr-3 h-8 w-8 text-primary" /> Your Stories
          </h1>
          <p className="text-muted-foreground">Manage your different writing projects and narratives. Select a story to make it active.</p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Story
        </Button>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <BookOpenCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No stories yet. Start by creating one!</p>
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
                <CardDescription>Last modified: {new Date(story.lastModified).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4">{story.description || "No description provided."}</p>
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
                  {activeStoryId === story.id ? 'Active Story' : 'Select Story'}
                </Button>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(story)} className="flex-1">
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
                          This action cannot be undone. This will permanently delete the story: "{story.title}".
                          Associated data (characters, outlines, etc.) for this story will become inaccessible if not re-associated.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteStory(story.id)}>
                          Delete Story
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
                <DialogTitle>{editingStory ? 'Edit Story Details' : 'Create New Story'}</DialogTitle>
                <DialogDescription>
                  {editingStory ? 'Update the title and description for this story.' : 'Provide a title and description for your new story.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="story-title" className="text-right">Title</Label>
                  <Input id="story-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required placeholder="e.g., The Dragon's Prophecy" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="story-description" className="text-right pt-2">Description</Label>
                  <Textarea 
                    id="story-description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="col-span-3" 
                    rows={5} 
                    placeholder="A brief summary or logline for your story..."
                  />
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">{editingStory ? 'Save Changes' : 'Create Story'}</Button>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
