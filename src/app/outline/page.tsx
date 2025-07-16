// src/app/(app)/outline/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListTree, PlusCircle, Edit3, Trash2, Save, XCircle, GripVertical, AlertTriangle, Download } from 'lucide-react';
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
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useStoryContext, getOutlineStorageKey } from '@/contexts/StoryContext';
import Link from 'next/link';

type OutlineItemType = 'Chapter' | 'Scene' | 'Plot Point/Notes';

interface OutlineItem {
  id: string;
  title: string;
  notes?: string;
  type: OutlineItemType;
  children: OutlineItem[];
}

const itemTypes: OutlineItemType[] = ['Chapter', 'Scene', 'Plot Point/Notes'];

const createNewItem = (title: string, notes: string | undefined, type: OutlineItemType): OutlineItem => ({
  id: Date.now().toString(),
  title,
  notes,
  type,
  children: [],
});

const deleteItemRecursive = (items: OutlineItem[], itemId: string): OutlineItem[] => {
  return items.reduce((acc, item) => {
    if (item.id === itemId) {
      return acc;
    }
    const newChildren = item.children ? deleteItemRecursive(item.children, itemId) : [];
    acc.push({ ...item, children: newChildren });
    return acc;
  }, [] as OutlineItem[]);
};

const updateItemRecursive = (items: OutlineItem[], updatedItemData: Partial<OutlineItem> & { id: string }): OutlineItem[] => {
  return items.map(item => {
    if (item.id === updatedItemData.id) {
      return { ...item, ...updatedItemData, children: item.children || [] };
    }
    if (item.children) {
      return { ...item, children: updateItemRecursive(item.children, updatedItemData) };
    }
    return item;
  });
};

interface OutlineItemDisplayProps {
  item: OutlineItem;
  index: number;
  level: number;
  onEdit: (item: OutlineItem) => void;
  onDelete: (id: string) => void;
}

function OutlineItemDisplay({ 
  item, index, level, onEdit, onDelete 
}: OutlineItemDisplayProps) {
  const getTypeBadgeVariant = (type: OutlineItemType) => {
    switch (type) {
      case 'Chapter': return 'default';
      case 'Scene': return 'secondary';
      case 'Plot Point/Notes': return 'outline';
      default: return 'outline';
    }
  };

  const canHaveChildren = item.type === 'Chapter';

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "p-3 border rounded-md hover:shadow-sm transition-shadow bg-card mb-2",
            snapshot.isDragging && "shadow-lg bg-primary/10",
            level > 0 && "ml-6" 
          )}
          style={{ 
            ...provided.draggableProps.style,
            marginLeft: `${level * 1.5}rem`
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div {...provided.dragHandleProps} title="Drag to reorder/nest">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              </div>
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
          {canHaveChildren && (
            <Droppable droppableId={item.id} type="outline-item">
              {(dropProvided, dropSnapshot) => (
                <ul
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                  className={cn(
                    "mt-3 space-y-2 pl-4 border-l min-h-[20px]",
                    dropSnapshot.isDraggingOver && "bg-accent/50 rounded"
                  )}
                >
                  {item.children.map((child, childIndex) => (
                    <OutlineItemDisplay
                      key={child.id}
                      item={child}
                      index={childIndex}
                      level={level + 1}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                  {dropProvided.placeholder}
                </ul>
              )}
            </Droppable>
          )}
           {!canHaveChildren && item.children && item.children.length > 0 && (
              <ul className="mt-3 space-y-3 pl-4 border-l">
                  {item.children.map((child, childIndex) => (
                    <OutlineItemDisplay
                      key={child.id}
                      item={child}
                      index={childIndex}
                      level={level + 1}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
              </ul>
           )}
        </li>
      )}
    </Draggable>
  );
}


export default function OutlineBuilderPage() {
  const { activeStoryId } = useStoryContext();
  const [items, setItems] = useState<OutlineItem[]>([]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [newItemType, setNewItemType] = useState<OutlineItemType>('Plot Point/Notes');

  const [editingItem, setEditingItem] = useState<OutlineItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const outlineStorageKey = getOutlineStorageKey(activeStoryId);
      const storedItems = localStorage.getItem(outlineStorageKey);
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems).map((item: any): OutlineItem => ({
            ...item,
            type: item.type || 'Plot Point/Notes',
            children: item.children || [] 
          }));
          setItems(parsedItems);
        } catch (e) {
          console.error("Failed to parse outline items from localStorage", e);
          setItems([]);
        }
      } else {
        setItems([]); // No items for this story yet
      }
    } else if (!activeStoryId) {
      setItems([]); // Clear items if no story is active
    }
  }, [activeStoryId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const outlineStorageKey = getOutlineStorageKey(activeStoryId);
      localStorage.setItem(outlineStorageKey, JSON.stringify(items));
    }
  }, [items, activeStoryId]);

  const resetAddForm = () => {
    setNewItemTitle('');
    setNewItemNotes('');
    setNewItemType('Plot Point/Notes');
  };

  const handleOpenAddDialog = () => {
    if (!activeStoryId) return;
    resetAddForm();
    setEditingItem(null); 
    setIsAddDialogOpen(true);
  };

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !activeStoryId) return;
    const newItem = createNewItem(newItemTitle.trim(), newItemNotes.trim() || undefined, newItemType);
    setItems(prevItems => [...prevItems, newItem]);
    setIsAddDialogOpen(false);
    resetAddForm();
  };

  const handleDeleteItem = useCallback((id: string) => {
    if (!activeStoryId) return;
    setItems(prevItems => deleteItemRecursive(prevItems, id));
  }, [activeStoryId]);

  const handleStartEdit = useCallback((item: OutlineItem) => {
    if (!activeStoryId) return;
    setEditingItem(item);
    setEditTitle(item.title);
    setEditNotes(item.notes || '');
    setIsAddDialogOpen(false); 
  }, [activeStoryId]);

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditTitle('');
    setEditNotes('');
  };

  const handleSaveEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editTitle.trim() || !activeStoryId) return;
    const updatedDetails: Partial<OutlineItem> & { id: string } = { 
      id: editingItem.id,
      title: editTitle.trim(), 
      notes: editNotes.trim() || undefined 
    };
    setItems(prevItems => updateItemRecursive(prevItems, updatedDetails));
    handleCancelEdit();
  };
  
  const findItemAndParentList = (
    itemId: string,
    currentItems: OutlineItem[]
  ): { item: OutlineItem; list: OutlineItem[]; index: number } | null => {
    for (let i = 0; i < currentItems.length; i++) {
      if (currentItems[i].id === itemId) {
        return { item: currentItems[i], list: currentItems, index: i };
      }
      if (currentItems[i].children) {
        const foundInChildren = findItemAndParentList(itemId, currentItems[i].children);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }
    return null;
  };

  const handleDragEnd = (result: DropResult) => {
    if (!activeStoryId) return;
    const { source, destination, draggableId } = result;

    if (!destination) return; 

    let newItems = JSON.parse(JSON.stringify(items)) as OutlineItem[];

    const findAndRemove = (
      currentList: OutlineItem[],
      sDroppableId: string,
      sIndex: number,
      dId: string
    ): { updatedList: OutlineItem[]; removed: OutlineItem | null } => {
      let removedItem: OutlineItem | null = null;
      if (sDroppableId === "root") {
        if (currentList[sIndex]?.id === dId) {
          [removedItem] = currentList.splice(sIndex, 1);
        }
        return { updatedList: currentList, removed: removedItem };
      }

      for (let i = 0; i < currentList.length; i++) {
        if (currentList[i].id === sDroppableId) {
          if (currentList[i].children[sIndex]?.id === dId) {
            [removedItem] = currentList[i].children.splice(sIndex, 1);
          }
          return { updatedList: currentList, removed: removedItem };
        }
        if (currentList[i].children) {
          const recursionResult = findAndRemove(currentList[i].children, sDroppableId, sIndex, dId);
          if (recursionResult.removed) {
            return { updatedList: currentList, removed: recursionResult.removed };
          }
        }
      }
      return { updatedList: currentList, removed: null };
    };
    
    const { updatedList: listAfterRemoval, removed: draggedItem } = findAndRemove(
      newItems,
      source.droppableId,
      source.index,
      draggableId
    );

    if (!draggedItem) {
      console.error("Dragged item not found for removal");
      return;
    }
    newItems = listAfterRemoval;

    const insertIntoList = (
      currentList: OutlineItem[],
      dDroppableId: string,
      dIndex: number,
      itemToInsert: OutlineItem
    ): boolean => {
      if (dDroppableId === "root") {
        currentList.splice(dIndex, 0, itemToInsert);
        return true;
      }
      for (let i = 0; i < currentList.length; i++) {
        if (currentList[i].id === dDroppableId) {
          currentList[i].children = currentList[i].children || [];
          currentList[i].children.splice(dIndex, 0, itemToInsert);
          return true;
        }
        if (currentList[i].children) {
          if (insertIntoList(currentList[i].children, dDroppableId, dIndex, itemToInsert)) {
            return true;
          }
        }
      }
      return false;
    };

    insertIntoList(newItems, destination.droppableId, destination.index, draggedItem);
    setItems(newItems);
  };
  
  const formatItemsAsText = (itemsToFormat: OutlineItem[], indentLevel = 0): string => {
    let text = '';
    const indent = '  '.repeat(indentLevel);
    for (const item of itemsToFormat) {
      text += `${indent}- [${item.type}] ${item.title}\n`;
      if (item.notes) {
        text += `${indent}  Notes: ${item.notes.replace(/\n/g, `\n${indent}  `)}\n`;
      }
      if (item.children && item.children.length > 0) {
        text += formatItemsAsText(item.children, indentLevel + 1);
      }
    }
    return text;
  };

  const handleExport = () => {
    if (!activeStoryId || items.length === 0) return;
    const textContent = formatItemsAsText(items);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'outline.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> No Active Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select or create a story from the <Link href="/stories" className="text-primary hover:underline">Stories page</Link> to build an outline.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <ListTree className="mr-3 h-8 w-8 text-primary" /> Outline Builder
            </h1>
            <p className="text-muted-foreground">Structure your story. Drag items to reorder or nest them within 'Chapter' type items.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!activeStoryId || items.length === 0}>
                <Download className="mr-2 h-5 w-5" /> Export Outline
            </Button>
            <Button onClick={handleOpenAddDialog} disabled={!activeStoryId}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Outline Item
            </Button>
          </div>
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
              {items.length > 0 ? "Drag and drop to reorder items or nest them under 'Chapter' type items." : "Your outline is empty for this story."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <ScrollArea className="h-auto max-h-[60vh] pr-4">
                <Droppable droppableId="root" type="outline-item">
                  {(provided, snapshot) => (
                    <ul 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={cn(
                        "space-y-0", 
                        snapshot.isDraggingOver && "bg-accent/30 rounded"
                      )}
                    >
                      {items.map((item, index) => (
                        <OutlineItemDisplay
                          key={item.id}
                          item={item}
                          index={index}
                          level={0}
                          onEdit={handleStartEdit}
                          onDelete={handleDeleteItem}
                        />
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
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
            You can now drag items to reorder them or nest them inside 'Chapter' type items.
          </p>
        </div>

      </div>
    </DragDropContext>
  );
}
