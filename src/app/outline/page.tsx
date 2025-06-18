
// src/app/outline/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListTree, PlusCircle, Edit3, Trash2, Save, XCircle, GripVertical } from 'lucide-react';
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
import { cn } from '@/lib/utils';

type OutlineItemType = 'Chapter' | 'Scene' | 'Plot Point/Notes';

interface OutlineItem {
  id: string;
  title: string;
  notes?: string;
  type: OutlineItemType;
  children?: OutlineItem[];
}

const OUTLINE_STORAGE_KEY = 'openwritingkit-outline-items-v2'; // New key for nested structure
const itemTypes: OutlineItemType[] = ['Chapter', 'Scene', 'Plot Point/Notes'];


// Recursive helper to delete an item
const deleteItemRecursive = (items: OutlineItem[], itemId: string): OutlineItem[] => {
  return items.filter(item => {
    if (item.id === itemId) {
      return false;
    }
    if (item.children) {
      item.children = deleteItemRecursive(item.children, itemId);
    }
    return true;
  });
};

// Recursive helper to update an item
const updateItemRecursive = (items: OutlineItem[], updatedItem: OutlineItem): OutlineItem[] => {
  return items.map(item => {
    if (item.id === updatedItem.id) {
      return { ...item, ...updatedItem, children: item.children ? updateItemRecursive(item.children, updatedItem) : undefined };
    }
    if (item.children) {
      return { ...item, children: updateItemRecursive(item.children, updatedItem) };
    }
    return item;
  });
};


interface OutlineItemDisplayProps {
  item: OutlineItem;
  level: number;
  onEdit: (item: OutlineItem) => void;
  onDelete: (id: string) => void;
  onDragStart: (event: React.DragEvent<HTMLLIElement>, item: OutlineItem) => void;
  onDragOver: (event: React.DragEvent<HTMLLIElement>, item: OutlineItem) => void;
  onDragEnd: (event: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (event: React.DragEvent<HTMLLIElement>, targetItem: OutlineItem) => void;
  isDraggedOver: boolean;
}

function OutlineItemDisplay({ 
  item, level, onEdit, onDelete, 
  onDragStart, onDragOver, onDragEnd, onDrop, 
  isDraggedOver 
}: OutlineItemDisplayProps) {
  const getTypeBadgeVariant = (type: OutlineItemType) => {
    switch (type) {
      case 'Chapter': return 'default';
      case 'Scene': return 'secondary';
      case 'Plot Point/Notes': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragOver={(e) => onDragOver(e, item)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, item)}
      className={cn(
        "p-3 border rounded-md hover:shadow-sm transition-shadow bg-card",
        isDraggedOver && "outline outline-2 outline-primary",
        level > 0 && "ml-6" // Indentation for nested items
      )}
      style={{ marginLeft: `${level * 1.5}rem`}}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          <Badge variant={getTypeBadgeVariant(item.type)} className="text-xs">{item.type}</Badge>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)} title="Edit Item">
            <Edit3 className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Delete Item">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the outline item: "{item.title}" and all its sub-items.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
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
      {item.children && item.children.length > 0 && (
        <ul className="mt-3 space-y-3 pl-4 border-l">
          {item.children.map(child => (
            <OutlineItemDisplay
              key={child.id}
              item={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              isDraggedOver={false} // Placeholder, real drag over state needed if deep nesting drag is implemented
            />
          ))}
        </ul>
      )}
    </li>
  );
}


export default function OutlineBuilderPage() {
  const [items, setItems] = useState<OutlineItem[]>([]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [newItemType, setNewItemType] = useState<OutlineItemType>('Plot Point/Notes');

  const [editingItem, setEditingItem] = useState<OutlineItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Drag and Drop State
  const draggedItemRef = useRef<OutlineItem | null>(null);
  const [draggedOverItemId, setDraggedOverItemId] = useState<string | null>(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedItems = localStorage.getItem(OUTLINE_STORAGE_KEY);
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems).map((item: any) => ({
            ...item,
            type: item.type || 'Plot Point/Notes',
            children: item.children || [] // Ensure children array exists
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
    setEditingItem(null); // Ensure not in edit mode
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
      children: [],
    };
    setItems(prevItems => [...prevItems, newItem]); // Add to top level
    setIsAddDialogOpen(false);
    resetAddForm();
  };

  const handleDeleteItem = useCallback((id: string) => {
    setItems(prevItems => deleteItemRecursive(prevItems, id));
  }, []);

  const handleStartEdit = useCallback((item: OutlineItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditNotes(item.notes || '');
    setIsAddDialogOpen(false); // Close add dialog if open
  }, []);

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditTitle('');
    setEditNotes('');
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim()) return;
    const updatedDetails = { title: editTitle.trim(), notes: editNotes.trim() || undefined };
    setItems(prevItems => updateItemRecursive(prevItems, { ...editingItem, ...updatedDetails }));
    handleCancelEdit();
  };

  // Drag and Drop Handlers
  const handleDragStart = (event: React.DragEvent<HTMLLIElement>, item: OutlineItem) => {
    draggedItemRef.current = item;
    event.dataTransfer.effectAllowed = "move";
    event.currentTarget.style.opacity = '0.5';
  };

  const handleDragOver = (event: React.DragEvent<HTMLLIElement>, item: OutlineItem) => {
    event.preventDefault();
    if (draggedItemRef.current?.id !== item.id) {
      setDraggedOverItemId(item.id);
    }
  };
  
  const handleDragLeave = () => {
    setDraggedOverItemId(null);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLLIElement>) => {
    event.currentTarget.style.opacity = '1';
    draggedItemRef.current = null;
    setDraggedOverItemId(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLLIElement>, targetItem: OutlineItem) => {
    event.preventDefault();
    const sourceItem = draggedItemRef.current;
    if (!sourceItem || sourceItem.id === targetItem.id) {
      setDraggedOverItemId(null);
      return;
    }

    // For now, only allow reordering at the top level
    // More complex nesting/moving between levels is deferred
    const sourceIndex = items.findIndex(item => item.id === sourceItem.id);
    const targetIndex = items.findIndex(item => item.id === targetItem.id);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newItems = [...items];
      const [removed] = newItems.splice(sourceIndex, 1);
      newItems.splice(targetIndex, 0, removed);
      setItems(newItems);
    }
    setDraggedOverItemId(null);
  };


  return (
    <div className="space-y-8" onDragLeave={handleDragLeave}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <ListTree className="mr-3 h-8 w-8 text-primary" /> Outline Builder
          </h1>
          <p className="text-muted-foreground">Structure your story. Drag top-level items to reorder. Full nesting drag-and-drop coming soon.</p>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Outline Item
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
          setIsAddDialogOpen(isOpen);
          if (!isOpen) resetAddForm();
      }}>
        <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Outline Item</DialogTitle>
              <DialogDescription>
                Choose a type, add a title, and optional notes. New items are added to the top level.
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

      {editingItem && (
        <Card className="mt-6 border-primary border-2">
          <CardHeader>
            <CardTitle>Edit Item: <span className="font-normal">{editingItem.title}</span></CardTitle>
            <CardDescription>Modifying <Badge variant="outline">{editingItem.type}</Badge></CardDescription>
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
                  className="text-base"
                />
              </div>
              <div>
                <label htmlFor="editItemNotes" className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <Textarea
                  id="editItemNotes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="text-base"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                <XCircle className="mr-2 h-5 w-5" /> Cancel Edit
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
          <CardTitle>Your Outline Structure</CardTitle>
          <CardDescription>
            {items.length > 0 ? "Manage and reorder your top-level outline items below." : "Your outline is empty."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <ScrollArea className="h-auto max-h-[60vh] pr-4">
              <ul className="space-y-3">
                {items.map((item) => (
                  <OutlineItemDisplay
                    key={item.id}
                    item={item}
                    level={0}
                    onEdit={handleStartEdit}
                    onDelete={handleDeleteItem}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={handleDrop}
                    isDraggedOver={draggedOverItemId === item.id}
                  />
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-6">No outline items yet. Click "Add New Outline Item" to begin.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="text-center mt-12 p-6 bg-card border rounded-md">
        <Image src="https://placehold.co/300x150.png" data-ai-hint="abstract structure blueprint" alt="Outline structure illustration" width={300} height={150} className="mx-auto mb-4 rounded-md" />
        <h3 className="text-xl font-semibold mb-2">Advanced Outlining</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Full drag-and-drop nesting and moving items between different levels are planned for future updates.
        </p>
      </div>

    </div>
  );
}
