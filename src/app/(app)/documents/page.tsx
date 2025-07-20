// src/app/(app)/documents/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, FilePlus2, Search, Folder as FolderIcon, FileText as FileTextIcon, BookCopy, AlertTriangle, Upload, Download, Trash2, Edit, History } from "lucide-react";
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
import { useStoryContext, getDocumentsStorageKey, type DocumentItem } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getEditorContentKey } from '@/contexts/StoryContext';
import { storage } from '@/lib/storage';
import { ScrollArea } from '@/components/ui/scroll-area';


interface DocumentListItemProps {
  item: DocumentItem;
  level?: number;
  onOpenDetails: (item: DocumentItem) => void;
  onDelete: (id: string) => void;
  onEditInEditor: (id: string) => void;
}

function DocumentListItem({ item, level = 0, onOpenDetails, onDelete, onEditInEditor }: DocumentListItemProps) {
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

  const getStatusVariant = (status?: DocumentItem['status']) => {
    switch (status) {
      case "Draft": return "secondary";
      case "Revised": return "outline";
      case "Complete": return "default";
      default: return "secondary";
    }
  };
  
  const getTranslatedStatus = (status: DocumentItem['status']): string => {
    switch (status) {
        case 'Draft': return t('documents.status.draft');
        case 'Revised': return t('documents.status.revised');
        case 'Complete': return t('documents.status.complete');
        default: return status || '';
    }
  };

  const getTagVariant = (tag: DocumentItem['tags'][number]): "default" | "secondary" | "destructive" | "outline" => {
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

  const isEditable = item.type === 'file' || item.type === 'scene';

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
                 t('documents.item_count', {count: (item.children?.length || 0).toString()}) :
                 `${item.words || 0} ${t('documents.words')} - ${t('documents.last_modified') ? new Date(item.lastModified).toLocaleDateString() : 'N/A'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2 shrink-0">
            {(item.type === "scene" || item.type === 'file') && item.status && (
              <Badge variant={getStatusVariant(item.status)} className="text-xs">{getTranslatedStatus(item.status)}</Badge>
            )}
            {isEditable && (
                <Button variant="default" size="sm" onClick={() => onEditInEditor(item.id)}>
                    <Edit className="h-4 w-4 mr-1" />
                    {t('common.edit')}
                </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onOpenDetails(item)}>{t('documents.details_button')}</Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('documents.delete_dialog.title', { name: item.name })}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('documents.delete_dialog.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(item.id)}>{t('common.delete')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 pl-8">
            {item.tags.map(tag => (
              <Badge key={tag} variant={getTagVariant(tag as DocumentItem['tags'][number])} className="text-xs">{tag}</Badge>
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
          onEditInEditor={onEditInEditor}
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
  const { activeStoryId, setDocumentToOpen, setHistoryDocumentId } = useStoryContext();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  // For managing dialogs
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // State for Create dialog
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<DocumentItem['type']>('file');

  // State for Details dialog
  const [selectedItemForDialog, setSelectedItemForDialog] = useState<DocumentItem | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedWords, setEditedWords] = useState('');
  const [editedStatus, setEditedStatus] = useState<DocumentItem['status'] | undefined>(undefined);
  const [editedTagsString, setEditedTagsString] = useState('');

  const documentsStorageKey = getDocumentsStorageKey(activeStoryId, user?.uid);

  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      setIsLoading(true);
      const storedData = localStorage.getItem(documentsStorageKey);
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
  }, [activeStoryId, user, documentsStorageKey]);

  const saveDocuments = (updatedDocuments: DocumentItem[]) => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      setDocuments(updatedDocuments);
      localStorage.setItem(documentsStorageKey, JSON.stringify(updatedDocuments));
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
    
    // For file types, create an empty storage entry for the editor
    if (newItem.type === 'file' || newItem.type === 'scene') {
        const editorKey = getEditorContentKey(activeStoryId, newItem.id, user?.uid);
        storage.setItem(editorKey, { current: '<p></p>', history: [], lastSaved: null });
    }

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
  
  const handleEditInEditor = (docId: string) => {
    setDocumentToOpen(docId);
    router.push('/editor');
  };

  const handleViewHistory = (docId: string) => {
    setHistoryDocumentId(docId);
    router.push('/editor');
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
    
    updates.tags = editedTagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) as DocumentItem['tags'];

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
        toast({ title: t('documents.toast.invalid_file_type_title'), description: t('documents.toast.invalid_file_type_desc'), variant: "destructive" });
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        toast({ title: t('documents.toast.error_reading_file'), variant: "destructive" });
        return;
      }
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const htmlContent = result.value;
        const wordCount = htmlContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

        const newDoc: DocumentItem = {
          id: Date.now().toString(),
          name: file.name.replace(/\.docx$/, ''),
          type: 'file',
          lastModified: new Date().toISOString(),
          status: 'Draft',
          tags: ['Imported', 'Draft'],
          words: wordCount,
        };
        
        // Save the content separately
        const editorKey = getEditorContentKey(activeStoryId, newDoc.id, user?.uid);
        storage.setItem(editorKey, { current: htmlContent, history: [], lastSaved: null });

        saveDocuments([...documents, newDoc]);
        toast({ title: t('documents.toast.import_success_title'), description: t('documents.toast.import_success_desc', { name: newDoc.name }) });

      } catch (error) {
        console.error("Mammoth conversion error:", error);
        toast({ title: t('documents.toast.import_failed_title'), description: t('documents.toast.import_failed_desc'), variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
  };

  const handleExportZip = async () => {
    if (!activeStoryId || documents.length === 0 || !user) return;
    const zip = new JSZip();

    const addDocsToZip = async (docs: DocumentItem[], currentPath: string) => {
        for (const doc of docs) {
            const newPath = currentPath ? `${currentPath}/${doc.name}` : doc.name;
            if ((doc.type === 'file' || doc.type === 'scene')) {
                const editorKey = getEditorContentKey(activeStoryId, doc.id, user.uid);
                const editorData = await storage.getItem<{current: string}>(editorKey);
                if (editorData?.current) {
                    zip.file(`${newPath}.html`, editorData.current);
                }
            } else if ((doc.type === 'folder' || doc.type === 'chapter') && doc.children) {
                zip.folder(newPath);
                await addDocsToZip(doc.children, newPath);
            }
        }
    };

    await addDocsToZip(documents, '');

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
        toast({ title: t('documents.toast.export_started_title'), description: t('documents.toast.export_started_desc') });
    } catch (error) {
        console.error("ZIP generation error:", error);
        toast({ title: t('documents.toast.export_failed_title'), description: t('documents.toast.export_failed_desc'), variant: "destructive" });
    }
  };


  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('documents.no_story.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('documents.no_story.description_1')} <Link href="/stories" className="text-primary hover:underline">{t('documents.no_story.description_2')}</Link> {t('documents.no_story.description_3')}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
      return <div>{t('documents.loading')}</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('documents.title')}</h1>
          <p className="text-muted-foreground">{t('documents.description')}</p>
        </div>
        <div className="flex gap-2">
           <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".docx" className="hidden" />
           <Button variant="outline" onClick={handleImportClick}><Upload className="mr-2 h-5 w-5" /> {t('documents.import_button')}</Button>
           <Button variant="outline" onClick={handleExportZip} disabled={documents.length === 0}><Download className="mr-2 h-5 w-5" /> {t('documents.export_button')}</Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <FilePlus2 className="mr-2 h-5 w-5" /> {t('documents.create_button')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <CardTitle>{t('documents.list_title')}</CardTitle>
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('common.search_placeholder')} className="pl-8" />
            </div>
          </div>
          <CardDescription>
            {t('documents.list_description')}
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
                  onEditInEditor={handleEditInEditor}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('documents.empty_state.message')}</p>
              <Button variant="link" className="mt-2" onClick={() => setIsCreateDialogOpen(true)}>{t('documents.empty_state.cta')}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE ITEM DIALOG */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1 pr-3">
              <DialogHeader>
                  <DialogTitle>{t('documents.create_dialog.title')}</DialogTitle>
                  <DialogDescription>
                      {t('documents.create_dialog.description')}
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateItem}>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="create-name" className="text-right">{t('documents.fields.name')}</Label>
                          <Input id="create-name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="col-span-3" required />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="create-type" className="text-right">{t('documents.fields.type')}</Label>
                          <Select value={newItemType} onValueChange={(v) => setNewItemType(v as DocumentItem['type'])}>
                              <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder={t('documents.fields.select_type_placeholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="file">{t('documents.types.file')}</SelectItem>
                                  <SelectItem value="scene">{t('documents.types.scene')}</SelectItem>
                                  <SelectItem value="chapter">{t('documents.types.chapter')}</SelectItem>
                                  <SelectItem value="folder">{t('documents.types.folder')}</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </div>
                  <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline">{t('common.cancel')}</Button></DialogClose>
                      <Button type="submit">{t('documents.create_dialog.create_button')}</Button>
                  </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* DETAILS DIALOG */}
      {selectedItemForDialog && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <ScrollArea className="max-h-[80vh]">
              <div className="p-1 pr-3">
                <DialogHeader>
                  <DialogTitle>{t('documents.details_dialog.title', { name: selectedItemForDialog.name })}</DialogTitle>
                  <DialogDescription>
                    {t('documents.details_dialog.description', { type: selectedItemForDialog.type })}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">{t('documents.fields.name')}</Label>
                    <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="notes" className="text-right pt-2">{t('documents.fields.notes')}</Label>
                    <Textarea id="notes" value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} className="col-span-3" placeholder={t('documents.fields.notes_placeholder')} rows={3}/>
                  </div>

                  {(selectedItemForDialog.type === 'scene' || selectedItemForDialog.type === 'file') && (
                    <>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="words" className="text-right">{t('documents.fields.word_count')}</Label>
                        <Input id="words" type="number" value={editedWords} onChange={(e) => setEditedWords(e.target.value)} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">{t('documents.fields.status')}</Label>
                        <Select value={editedStatus} onValueChange={(value: DocumentItem['status']) => setEditedStatus(value)}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder={t('documents.fields.select_status_placeholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {['Draft', 'Revised', 'Complete'].map((status) => (
                              <SelectItem key={status} value={status}>{t(`documents.status.${status.toLowerCase()}` as any)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Button variant="outline" className="col-start-2 col-span-3" onClick={() => handleViewHistory(selectedItemForDialog.id)}>
                          <History className="mr-2 h-4 w-4" /> {t('documents.history_button')}
                        </Button>
                      </div>
                    </>
                  )}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tags" className="text-right">{t('documents.fields.tags')}</Label>
                    <Input id="tags" value={editedTagsString} onChange={(e) => setEditedTagsString(e.target.value)} className="col-span-3" placeholder={t('documents.fields.tags_placeholder')}/>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">{t('common.cancel')}</Button>
                  </DialogClose>
                  <Button type="button" onClick={handleSaveDetails}>{t('documents.details_dialog.save_button')}</Button>
                </DialogFooter>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      <div className="text-center mt-12 p-6 bg-card border">
        <Image src="/comingsoon.svg" alt={t('documents.coming_soon.alt_text')} width={300} height={150} className="mx-auto mb-4 dark:invert w-full max-w-xs" />
        <h3 className="text-xl font-semibold mb-2">{t('documents.coming_soon.title')}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('documents.coming_soon.description')}
        </p>
      </div>
    </div>
  );
}
