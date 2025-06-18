// src/app/outline/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ListTree, PlusCircle, Edit3, Trash2, Save, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image'; // Added this import
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OutlineItem {
  id: string;
  title: string;
  notes?: string;
}

const OUTLINE_STORAGE_KEY = 'linguaflow-outline-items';

export default function OutlineBuilderPage() {
  const [items, setItems] = useState<OutlineItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [editingItem, setEditingItem] = useState<OutlineItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem(OUTLINE_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OUTLINE_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const newItem: OutlineItem = {
      id: Date.now().toString(),
      title: newItemTitle.trim(),
      notes: newItemNotes.trim() || undefined,
    };
    setItems([...items, newItem]);
    setNewItemTitle('');
    setNewItemNotes('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleStartEdit = (item: OutlineItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditNotes(item.notes || '');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditTitle('');
    setEditNotes('');
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;
    setItems(items.map(item =>
      item.id === editingItem.id
        ? { ...item, title: editTitle.trim(), notes: editNotes.trim() || undefined }
        : item
    ));
    handleCancelEdit();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <ListTree className="mr-3 h-8 w-8 text-primary" /> Outline Builder
        </h1>
        <p className="text-muted-foreground">Structure your story with chapters, scenes, and key plot points.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Outline Item</CardTitle>
        </CardHeader>
        <form onSubmit={handleAddItem}>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="newItemTitle" className="block text-sm font-medium mb-1">Title</label>
              <Input
                id="newItemTitle"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="e.g., Chapter 1: The Discovery, Scene: The Confrontation"
                required
              />
            </div>
            <div>
              <label htmlFor="newItemNotes" className="block text-sm font-medium mb-1">Notes (Optional)</label>
              <Textarea
                id="newItemNotes"
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                placeholder="Add brief notes or a summary for this item..."
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Item
            </Button>
          </CardFooter>
        </form>
      </Card>

      {editingItem && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Edit Item: {editingItem.title}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSaveEdit}>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="editItemTitle" className="block text-sm font-medium mb-1">Title</label>
                <Input
                  id="editItemTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="editItemNotes" className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <Textarea
                  id="editItemNotes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                <XCircle className="mr-2 h-5 w-5" /> Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-5 w-5" /> Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Outline</CardTitle>
          <CardDescription>
            {items.length > 0 ? "Manage your outline items below." : "Your outline is currently empty. Add some items to get started!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4"> {/* Added ScrollArea */}
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="p-4 border rounded-md hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{item.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0 ml-4">
                        <Button variant="ghost" size="icon" onClick={() => handleStartEdit(item)} title="Edit Item">
                          <Edit3 className="h-5 w-5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete Item">
                              <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the outline item: "{item.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-6">No outline items yet.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="text-center mt-12 p-6 bg-card border">
        <Image src="https://placehold.co/300x150.png" data-ai-hint="abstract structure blueprint" alt="Outline structure illustration" width={300} height={150} className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Structure Your Narrative</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Drag-and-drop reordering and nesting features are coming soon to further enhance your outlining experience.
        </p>
      </div>

    </div>
  );
}

