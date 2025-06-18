
// src/app/outline/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListTree, PlusCircle, Edit3, Trash2, Save, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Badge } from '@/components/ui/badge';

type OutlineItemType = 'Chapter' | 'Scene' | 'Plot Point/Notes';

interface OutlineItem {
  id: string;
  title: string;
  notes?: string;
  type: OutlineItemType;
}

const OUTLINE_STORAGE_KEY = 'linguaflow-outline-items'; // Keep old key for compatibility
const itemTypes: OutlineItemType[] = ['Chapter', 'Scene', 'Plot Point/Notes'];

export default function OutlineBuilderPage() {
  const [items, setItems] = useState<OutlineItem[]>([]);
  
  // State for Add New Item Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [newItemType, setNewItemType] = useState<OutlineItemType>('Plot Point/Notes');

  // State for Edit Item Form (existing)
  const [editingItem, setEditingItem] = useState<OutlineItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  // Note: Editing item type is not part of this change, but could be added later.

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem(OUTLINE_STORAGE_KEY);
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems).map((item: any) => ({
            ...item,
            type: item.type || 'Plot Point/Notes' // Default type for old items
          }));
          setItems(parsedItems as OutlineItem[]);
        } catch (e) {
          console.error("Failed to parse outline items from localStorage", e);
          setItems([]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(OUTLINE_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const resetAddForm = () => {
    setNewItemTitle('');
    setNewItemNotes('');
    setNewItemType('Plot Point/Notes');
  };

  const handleOpenAddDialog = () => {
    resetAddForm();
    setIsAddDialogOpen(true);
  };

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const newItem: OutlineItem = {
      id: Date.now().toString(),
      title: newItemTitle.trim(),
      notes: newItemNotes.trim() || undefined,
      type: newItemType,
    };
    setItems([...items, newItem]);
    setIsAddDialogOpen(false);
    resetAddForm();
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
  
  const getTypeBadgeVariant = (type: OutlineItemType) => {
    switch (type) {
      case 'Chapter': return 'default';
      case 'Scene': return 'secondary';
      case 'Plot Point/Notes': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <ListTree className="mr-3 h-8 w-8 text-primary" /> Outline Builder
          </h1>
          <p className="text-muted-foreground">Structure your story with chapters, scenes, and key plot points.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Outline Item
        </Button>
      </div>

      {/* Add New Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
          setIsAddDialogOpen(isOpen);
          if (!isOpen) resetAddForm();
      }}>
        <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Outline Item</DialogTitle>
              <DialogDescription>
                Choose a type, add a title, and optional notes for your new outline item.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="itemType" className="text-right">Type</Label>
                <Select value={newItemType} onValueChange={(value: OutlineItemType) => setNewItemType(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newItemTitleDialog" className="text-right">Title</Label>
                <Input 
                  id="newItemTitleDialog" 
                  value={newItemTitle} 
                  onChange={(e) => setNewItemTitle(e.target.value)} 
                  className="col-span-3" 
                  placeholder="e.g., The Discovery"
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="newItemNotesDialog" className="text-right pt-2">Notes</Label>
                <Textarea 
                  id="newItemNotesDialog" 
                  value={newItemNotes} 
                  onChange={(e) => setNewItemNotes(e.target.value)} 
                  className="col-span-3" 
                  rows={4}
                  placeholder="Add brief notes or a summary..."
                />
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add Item</Button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Form (Existing - Rendered as a Card when editingItem is not null) */}
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
            <ScrollArea className="h-[400px] pr-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="p-4 border rounded-md hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={getTypeBadgeVariant(item.type)} className="text-xs">{item.type}</Badge>
                      <div className="flex gap-2 shrink-0">
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
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{item.notes}</p>
                      )}
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
