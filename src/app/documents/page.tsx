
// src/app/documents/page.tsx
'use client';

import React, { useState, useRef, FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, FilePlus2, Search, Folder as FolderIcon, FileText as FileTextIcon, BookCopy, Edit, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';


type DocumentStatus = "Draft" | "Revised" | "Complete";
const documentStatuses: DocumentStatus[] = ["Draft", "Revised", "Complete"];
type DocumentTag = "Draft" | "WIP" | "Review" | "Published" | "Idea" | "Research" | "Key Scene" | "Needs Work" | "Outline" | "Character";


interface DocumentItem {
  id: string;
  name: string;
  type: "folder" | "chapter" | "scene" | "file";
  lastModified?: string;
  words?: number;
  itemCount?: number;
  status?: DocumentStatus;
  tags?: DocumentTag[];
  notes?: string; // For more detailed descriptions if needed
  children?: DocumentItem[];
}

const initialMockDocuments: DocumentItem[] = [
  {
    id: "folder1",
    name: "My Epic Novel",
    type: "folder",
    itemCount: 2,
    tags: ["WIP"],
    notes: "The main manuscript for the epic fantasy novel.",
    children: [
      {
        id: "chapter1",
        name: "Chapter 1: The Awakening",
        type: "chapter",
        itemCount: 2,
        notes: "Introduction to the protagonist and the initial conflict.",
        tags: ["Draft"],
        children: [
          { id: "scene1-1", name: "Scene 1: The Discovery", type: "scene", lastModified: "2 days ago", words: 1200, status: "Revised", tags: ["Key Scene"], notes: "Protagonist finds the ancient artifact." },
          { id: "scene1-2", name: "Scene 2: First Contact", type: "scene", lastModified: "1 day ago", words: 1500, status: "Draft", tags: ["Needs Work"], notes: "The first encounter with the antagonist." },
        ]
      },
      {
        id: "chapter2",
        name: "Chapter 2: The Journey Begins",
        type: "chapter",
        itemCount: 1,
        notes: "The protagonist decides to leave their home.",
        tags: ["Outline"],
        children: [
          { id: "scene2-1", name: "Scene 1: Leaving Home", type: "scene", lastModified: "In progress", words: 800, status: "Draft", notes: "Packing up and saying goodbyes." },
        ]
      }
    ]
  },
  {
    id: "folder2",
    name: "Short Stories",
    type: "folder",
    itemCount: 1,
    tags: ["Idea"],
    notes: "A collection of short story ideas and drafts.",
    children: [
      { id: "short1", name: "The Old Lighthouse", type: "file", lastModified: "5 days ago", words: 800, tags: ["Published"], notes: "A horror short story about a haunted lighthouse." },
    ]
  },
  { id: "doc1", name: "Character Bio: Anya", type: "file", lastModified: "1 week ago", words: 1500, tags: ["Research", "Character"], notes: "Detailed biography of the main character, Anya." },
  {
    id: "folder3",
    name: "Research Notes",
    type: "folder",
    itemCount: 0,
    tags: ["Research"],
    notes: "General research notes for various projects.",
    children: []
  },
];

interface DocumentListItemProps {
  item: DocumentItem;
  level?: number;
  onDragStart: (event: React.DragEvent, id: string) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent, targetId: string) => void;
  onOpenDetails: (item: DocumentItem) => void;
}

function DocumentListItem({ item, level = 0, onDragStart, onDragOver, onDrop, onOpenDetails }: DocumentListItemProps) {
  const [isOpen, setIsOpen] = useState(level < 1);

  const Icon = item.type === "folder" ? FolderIcon :
               item.type === "chapter" ? BookCopy :
               FileTextIcon;

  const handleToggleOpen = () => {
    if (item.children && item.children.length > 0) {
      setIsOpen(!isOpen);
    }
  };

  const getStatusVariant = (status?: DocumentStatus) => {
    switch (status) {
      case "Draft": return "secondary";
      case "Revised": return "outline";
      case "Complete": return "default";
      default: return "secondary";
    }
  };

  const getTagVariant = (tag: DocumentTag): "default" | "secondary" | "destructive" | "outline" => {
     switch (tag) {
      case "Published": return "default";
      case "WIP": return "secondary";
      case "Review": return "outline";
      case "Draft": return "secondary";
      case "Idea": return "outline";
      case "Research": return "secondary";
      default: return "secondary";
    }
  }

  return (
    <>
      <li
        draggable="true"
        onDragStart={(e) => onDragStart(e, item.id)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, item.id)}
        className="flex flex-col p-3 border-b hover:bg-secondary/50 transition-colors cursor-grab"
        style={{ paddingLeft: `${1 + level * 1.5}rem` }}
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            {item.children && item.children.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleToggleOpen} className="p-1 h-auto">
                <Icon className="h-5 w-5 text-primary" />
              </Button>
            ) : (
              <Icon className="h-5 w-5 text-primary ml-1 mr-1" />
            )}
            <div className="truncate">
              <h3 className="font-semibold truncate">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {item.type === "folder" || item.type === "chapter" ?
                 `${item.children?.length || 0} item(s)` :
                 `${item.words || 0} words - Last modified: ${item.lastModified || 'N/A'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            {item.type === "scene" && item.status && (
              <Badge variant={getStatusVariant(item.status)} className="text-xs">{item.status}</Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => onOpenDetails(item)}>Details</Button>
          </div>
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 pl-8">
            {item.tags.map(tag => (
              <Badge key={tag} variant={getTagVariant(tag as DocumentTag)} className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
      </li>
      {isOpen && item.children && item.children.map(child => (
        <DocumentListItem
          key={child.id}
          item={child}
          level={level + 1}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </>
  );
}

const findItemRecursive = (
  nodes: DocumentItem[],
  itemId: string
): { parentList: DocumentItem[]; item: DocumentItem; index: number } | null => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === itemId) {
      return { parentList: nodes, item: node, index: i };
    }
    if (node.children) {
      const foundInChild = findItemRecursive(node.children, itemId);
      if (foundInChild) {
        return foundInChild;
      }
    }
  }
  return null;
};

const updateItemRecursive = (
  nodes: DocumentItem[],
  itemId: string,
  updates: Partial<DocumentItem>
): DocumentItem[] => {
  return nodes.map(node => {
    if (node.id === itemId) {
      return { ...node, ...updates, lastModified: new Date().toLocaleDateString() };
    }
    if (node.children) {
      return { ...node, children: updateItemRecursive(node.children, itemId, updates) };
    }
    return node;
  });
};


export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialMockDocuments);
  const draggedItemIdRef = useRef<string | null>(null);

  const [selectedItemForDialog, setSelectedItemForDialog] = useState<DocumentItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // State for edited values in the dialog
  const [editedName, setEditedName] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedWords, setEditedWords] = useState('');
  const [editedStatus, setEditedStatus] = useState<DocumentStatus | undefined>(undefined);
  const [editedTagsString, setEditedTagsString] = useState('');


  const handleDragStart = (event: React.DragEvent, id: string) => {
    event.dataTransfer.setData('text/plain', id);
    draggedItemIdRef.current = id;
    event.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: React.DragEvent, targetItemId: string) => {
    event.preventDefault();
    document.querySelectorAll('.opacity-50').forEach(el => el.classList.remove('opacity-50'));

    const sourceItemId = draggedItemIdRef.current;
    if (!sourceItemId || sourceItemId === targetItemId) {
      draggedItemIdRef.current = null;
      return;
    }

    setDocuments(prevDocs => {
      const newDocs = JSON.parse(JSON.stringify(prevDocs)) as DocumentItem[];
      const sourceLocation = findItemRecursive(newDocs, sourceItemId);
      const targetLocation = findItemRecursive(newDocs, targetItemId);

      if (sourceLocation && targetLocation && sourceLocation.parentList === targetLocation.parentList) {
        const [movedItem] = sourceLocation.parentList.splice(sourceLocation.index, 1);
        let targetIndex = targetLocation.parentList.findIndex(item => item.id === targetItemId);
        if (targetIndex === -1 && targetLocation.item.id === targetItemId) { // dropped ON the target item itself
            targetIndex = targetLocation.index;
        }
        
        if (targetIndex !== -1) {
             // If source was before target in the same list, and target is not the last item
            if (sourceLocation.index < targetIndex && sourceLocation.parentList === targetLocation.parentList) {
                 targetLocation.parentList.splice(targetIndex, 0, movedItem);
            } else {
                 targetLocation.parentList.splice(targetIndex, 0, movedItem);
            }
        } else {
             console.warn("Could not determine target index precisely. Appending to list.");
             targetLocation.parentList.push(movedItem);
        }


      } else {
        console.warn("Drag and drop between different levels or into folders is not yet implemented.");
        return prevDocs;
      }
      return newDocs;
    });
    draggedItemIdRef.current = null;
  };
  
  const handleDragEnd = (event: React.DragEvent) => {
    event.currentTarget.classList.remove('opacity-50');
    document.querySelectorAll('.opacity-50').forEach(el => el.classList.remove('opacity-50'));
    draggedItemIdRef.current = null;
  };

  const handleOpenDetailsDialog = (item: DocumentItem) => {
    setSelectedItemForDialog(item);
    setEditedName(item.name);
    setEditedNotes(item.notes || '');
    setEditedWords(item.words?.toString() || '');
    setEditedStatus(item.status);
    setEditedTagsString(item.tags?.join(', ') || '');
    setIsDetailDialogOpen(true);
  };

  const handleSaveDetails = () => {
    if (!selectedItemForDialog) return;

    const updates: Partial<DocumentItem> = {
      name: editedName,
      notes: editedNotes,
    };

    if (selectedItemForDialog.type === 'scene' || selectedItemForDialog.type === 'file') {
      const wordsNum = parseInt(editedWords, 10);
      updates.words = isNaN(wordsNum) ? selectedItemForDialog.words : wordsNum;
    }
    if (selectedItemForDialog.type === 'scene') {
      updates.status = editedStatus;
    }
    updates.tags = editedTagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) as DocumentTag[];

    setDocuments(prevDocs => updateItemRecursive(prevDocs, selectedItemForDialog.id, updates));
    setIsDetailDialogOpen(false);
    setSelectedItemForDialog(null);
  };


  return (
    <div className="space-y-8" onDragEnd={handleDragEnd}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Management</h1>
          <p className="text-muted-foreground">Organize, create, and manage all your writing projects. Basic drag & drop reordering within the same level is enabled. Full drag & drop and tag editing are planned.</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <FilePlus2 className="mr-2 h-5 w-5" /> Create File/Scene
          </Button>
          <Button variant="outline">
            <FolderPlus className="mr-2 h-5 w-5" /> Create Folder
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <CardTitle>Your Files & Folders</CardTitle>
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
          </div>
          <CardDescription>
            Browse and manage your work. Click on folders or chapters to expand/collapse. Drag items to reorder them. Click 'Details' to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <ul className="space-y-0 border-t">
              {documents.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  item={doc}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onOpenDetails={handleOpenDetailsDialog}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don&apos;t have any documents or folders yet.</p>
              <Button variant="link" className="mt-2">Start by creating something new</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedItemForDialog && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Edit Details: {selectedItemForDialog.name}</DialogTitle>
              <DialogDescription>
                Make changes to your {selectedItemForDialog.type}. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes</Label>
                <Textarea id="notes" value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} className="col-span-3" placeholder="Add notes or a brief description..." rows={3}/>
              </div>

              {(selectedItemForDialog.type === 'scene' || selectedItemForDialog.type === 'file') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="words" className="text-right">Word Count</Label>
                  <Input id="words" type="number" value={editedWords} onChange={(e) => setEditedWords(e.target.value)} className="col-span-3" />
                </div>
              )}

              {selectedItemForDialog.type === 'scene' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select value={editedStatus} onValueChange={(value: DocumentStatus) => setEditedStatus(value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentStatuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">Tags</Label>
                <Input id="tags" value={editedTagsString} onChange={(e) => setEditedTagsString(e.target.value)} className="col-span-3" placeholder="Comma-separated tags, e.g., Draft, Key Scene"/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveDetails}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


      <div className="text-center mt-12 p-6 bg-card border">
        <Image src="https://placehold.co/300x150.png" data-ai-hint="geometric abstract design" alt="Document organization illustration" width={300} height={150} className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Streamlined Organization</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Advanced tagging, filtering, and more robust drag-and-drop organization features are planned.
        </p>
      </div>
    </div>
  );
}
