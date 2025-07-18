// src/app/(app)/documents/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, FilePlus2, Search, Folder as FolderIcon, FileText as FileTextIcon, BookCopy, AlertTriangle, Upload, Download, Trash2 } from "lucide-react";
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
  AlertDialogTrigger,
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
import { useStoryContext, getDocumentsStorageKey } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { useLanguage } from '@/contexts/LanguageContext';

type DocumentType = "folder" | "chapter" | "scene" | "file";
type DocumentStatus = "Draft" | "Revised" | "Complete";
const documentStatuses: DocumentStatus[] = ["Draft", "Revised", "Complete"];
type DocumentTag = "Draft" | "WIP" | "Review" | "Published" | "Idea" | "Research" | "Key Scene" | "Needs Work" | "Outline" | "Character";

interface DocumentItem {
  id: string;
  name: string;
  type: DocumentType;
  lastModified?: string;
  words?: number;
  itemCount?: number;
  status?: DocumentStatus;
  tags?: DocumentTag[];
  notes?: string; // For more detailed descriptions if needed
  content?: string; // For file/scene content
  children?: DocumentItem[];
}

interface DocumentListItemProps {
  item: DocumentItem;
  level?: number;
  onOpenDetails: (item: DocumentItem) => void;
  onDelete: (id: string) => void;
}

function DocumentListItem({ item, level = 0, onOpenDetails, onDelete }: DocumentListItemProps) {
  const [isOpen, setIsOpen] = useState(level < 1);
  const { t } = useLanguage();

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
        className="flex flex-col p-3 border-b hover:bg-secondary/50 transition-colors"
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
                 `${item.words || 0} words - Last modified: ${item.lastModified ? new Date(item.lastModified).toLocaleDateString() : 'N/A'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            {(item.type === "scene" || item.type === 'file') && item.status && (
              <Badge variant={getStatusVariant(item.status)} className="text-xs">{item.status}</Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => onOpenDetails(item)}>Details</Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone and will permanently delete this item.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(item.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
          onOpenDetails={onOpenDetails}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

const updateItemRecursive = (
  nodes: DocumentItem[],
  itemId: string,
  updates: Partial<DocumentItem>
): DocumentItem[] => {
  return nodes.map(node => {
    if (node.id === itemId) {
      return { ...node, ...updates, lastModified: new Date().toISOString() };
    }
    if (node.children) {
      return { ...node, children: updateItemRecursive(node.children, itemId, updates) };
    }
    return node;
  });
};

const deleteItemRecursive = (nodes: DocumentItem[], itemId: string): DocumentItem[] => {
  const filteredNodes = nodes.filter(node => node.id !== itemId);
  return filteredNodes.map(node => {
    if (node.children) {
      return { ...node, children: deleteItemRecursive(node.children, itemId) };
    }
    return node;
  });
};


export default function DocumentsPage() {
  const { activeStoryId } = useStoryContext();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  // For managing dialogs
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // State for Create dialog
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<DocumentType>('file');

  // State for Details dialog
  const [selectedItemForDialog, setSelectedItemForDialog] = useState<DocumentItem | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedWords, setEditedWords] = useState('');
  const [editedStatus, setEditedStatus] = useState<DocumentStatus | undefined>(undefined);
  const [editedTagsString, setEditedTagsString] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId) {
      setIsLoading(true);
      const storageKey = getDocumentsStorageKey(activeStoryId);
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        setDocuments(JSON.parse(storedData));
      } else {
        setDocuments([]); // Start with empty array for a new story
      }
      setIsLoading(false);
    } else if (!activeStoryId) {
      setDocuments([]); // Clear if no story is active
      setIsLoading(false);
    }
  }, [activeStoryId]);

  const saveDocuments = (updatedDocuments: DocumentItem[]) => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const storageKey = getDocumentsStorageKey(activeStoryId);
      setDocuments(updatedDocuments);
      localStorage.setItem(storageKey, JSON.stringify(updatedDocuments));
    }
  };

  const handleCreateItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeStoryId) return;

    const newItem: DocumentItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      type: newItemType,
      lastModified: new Date().toISOString(),
      words: 0,
      tags: ["Draft"],
      status: "Draft",
      children: newItemType === 'folder' || newItemType === 'chapter' ? [] : undefined,
    };

    saveDocuments([...documents, newItem]);
    setIsCreateDialogOpen(false);
    setNewItemName('');
    setNewItemType('file');
  };

  const handleDeleteItem = (id: string) => {
    setDocuments(prevDocs => {
      const updatedDocs = deleteItemRecursive(prevDocs, id);
      saveDocuments(updatedDocs);
      return updatedDocs;
    });
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
      updates.status = editedStatus;
    }
    
    updates.tags = editedTagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) as DocumentTag[];

    setDocuments(prevDocs => {
        const updatedDocs = updateItemRecursive(prevDocs, selectedItemForDialog.id, updates);
        saveDocuments(updatedDocs);
        return updatedDocs;
    });
    
    setIsDetailDialogOpen(false);
    setSelectedItemForDialog(null);
  };
  
  const handleImportClick = () => {
    if (!activeStoryId) return;
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeStoryId) return;

    if (file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        toast({ title: "Invalid File Type", description: "Please select a .docx file to import.", variant: "destructive" });
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        toast({ title: "Error Reading File", variant: "destructive" });
        return;
      }
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const htmlContent = result.value;
        const wordCount = htmlContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length;

        const newDoc: DocumentItem = {
          id: Date.now().toString(),
          name: file.name.replace(/\.docx$/, ''),
          type: 'file',
          content: htmlContent,
          words: wordCount,
          lastModified: new Date().toISOString(),
          status: 'Draft',
          tags: ['Imported', 'Draft'],
        };
        
        saveDocuments([...documents, newDoc]);
        toast({ title: "Import Successful", description: `"${newDoc.name}" has been imported.` });

      } catch (error) {
        console.error("Mammoth conversion error:", error);
        toast({ title: "Import Failed", description: "Could not convert the .docx file.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const handleExportZip = async () => {
    if (!activeStoryId || documents.length === 0) return;
    const zip = new JSZip();

    const addDocsToZip = (docs: DocumentItem[], currentPath: string) => {
        docs.forEach(doc => {
            const newPath = currentPath ? `${currentPath}/${doc.name}` : doc.name;
            if ((doc.type === 'file' || doc.type === 'scene') && doc.content) {
                zip.file(`${newPath}.html`, doc.content);
            } else if ((doc.type === 'folder' || doc.type === 'chapter') && doc.children) {
                zip.folder(newPath);
                addDocsToZip(doc.children, newPath);
            }
        });
    };

    addDocsToZip(documents, '');

    try {
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documents_export_${activeStoryId}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Export Started", description: "Your documents are being zipped for download." });
    } catch (error) {
        console.error("ZIP generation error:", error);
        toast({ title: "Export Failed", description: "Could not generate the zip file.", variant: "destructive" });
    }
  };


  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> No Active Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please select or create a story from the <Link href="/stories" className="text-primary hover:underline">Stories page</Link> to manage documents.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
      return <div>Loading documents...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Management</h1>
          <p className="text-muted-foreground">Organize, create, and manage all your writing projects.</p>
        </div>
        <div className="flex gap-2">
           <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".docx" className="hidden" />
           <Button variant="outline" onClick={handleImportClick}><Upload className="mr-2 h-5 w-5" /> Import DOCX</Button>
           <Button variant="outline" onClick={handleExportZip} disabled={documents.length === 0}><Download className="mr-2 h-5 w-5" /> Export All as ZIP</Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <FilePlus2 className="mr-2 h-5 w-5" /> Create Item
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
            Browse and manage your work. Click on folders or chapters to expand/collapse. Click 'Details' to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <ul className="space-y-0 border-t">
              {documents.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  item={doc}
                  onOpenDetails={handleOpenDetailsDialog}
                  onDelete={handleDeleteItem}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You don&apos;t have any documents or folders yet.</p>
              <Button variant="link" className="mt-2" onClick={() => setIsCreateDialogOpen(true)}>Start by creating something new</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE ITEM DIALOG */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
                <DialogDescription>
                    Create a new folder, chapter, scene, or file at the top level.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateItem}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="create-name" className="text-right">Name</Label>
                        <Input id="create-name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="create-type" className="text-right">Type</Label>
                        <Select value={newItemType} onValueChange={(v) => setNewItemType(v as DocumentType)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="file">File</SelectItem>
                                <SelectItem value="scene">Scene</SelectItem>
                                <SelectItem value="chapter">Chapter</SelectItem>
                                <SelectItem value="folder">Folder</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Create</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* DETAILS DIALOG */}
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
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">Notes</Label>
                <Textarea id="notes" value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} className="col-span-3" placeholder="Add notes or a brief description..." rows={3}/>
              </div>

              {(selectedItemForDialog.type === 'scene' || selectedItemForDialog.type === 'file') && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="words" className="text-right">Word Count</Label>
                    <Input id="words" type="number" value={editedWords} onChange={(e) => setEditedWords(e.target.value)} className="col-span-3" />
                  </div>
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
                </>
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
        <Image src="/comingsoon.svg" alt="Illustration of a building site with the words 'coming soon'." width={300} height={150} className="mx-auto mb-4 dark:invert" />
        <h3 className="text-xl font-semibold mb-2">Streamlined Organization</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Drag-and-drop reordering is planned for a future update.
        </p>
      </div>
    </div>
  );
}
