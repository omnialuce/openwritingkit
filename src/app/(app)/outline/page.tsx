
// src/app/(app)/outline/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ListTree, PlusCircle, Edit3, Trash2, Save, GripVertical,
  AlertTriangle, Download, Loader2, ChevronDown, ChevronRight, Copy, ExternalLink, AlignJustify,
  Circle, Clock, CheckCircle2,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import {
  useStoryContext, getOutlineStorageKey, getCharactersStorageKey,
  getWorldBuildingStorageKey, getDocumentsStorageKey,
} from '@/contexts/StoryContext';
import type { Locale, DocumentItem } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import type { CharacterProfile } from '@/app/(app)/characters/page';

// ─── Types ────────────────────────────────────────────────────────────────────

type OutlineItemType = 'Chapter' | 'Scene' | 'Plot Point/Notes';
type OutlineItemStatus = 'Draft' | 'In Progress' | 'Complete';
type OutlineItemColor = 'none' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray';

interface OutlineItem {
  id: string;
  title: string;
  type: OutlineItemType;
  children: OutlineItem[];
  synopsis?: string;
  notes?: string;
  color?: OutlineItemColor;
  pov?: string;
  location?: string;
  storyDate?: string;
  status?: OutlineItemStatus;
  wordCountTarget?: number;
  linkedDocumentId?: string;
  isCollapsed?: boolean;
}

interface FlatDoc { id: string; name: string; }

const NO_DOC = '__none__';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_COLORS: OutlineItemColor[] = ['none', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];

const COLOR_SWATCH: Record<OutlineItemColor, string> = {
  none: 'bg-muted border-2 border-dashed',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-400',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-400',
};

const COLOR_BORDER_L: Record<OutlineItemColor, string> = {
  none: '',
  red: 'border-l-4 border-l-red-500',
  orange: 'border-l-4 border-l-orange-500',
  yellow: 'border-l-4 border-l-yellow-400',
  green: 'border-l-4 border-l-green-500',
  blue: 'border-l-4 border-l-blue-500',
  purple: 'border-l-4 border-l-purple-500',
  pink: 'border-l-4 border-l-pink-500',
  gray: 'border-l-4 border-l-gray-400',
};

const STATUS_CLASS: Record<OutlineItemStatus, string> = {
  'Draft': 'bg-muted text-muted-foreground',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Complete': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createNewItem = (
  title: string, type: OutlineItemType,
  synopsis?: string, notes?: string,
  color?: OutlineItemColor, pov?: string,
  location?: string, storyDate?: string,
  status?: OutlineItemStatus, wordCountTarget?: number,
  linkedDocumentId?: string,
): OutlineItem => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
  title, type, children: [], synopsis, notes, color, pov,
  location, storyDate, status, wordCountTarget, linkedDocumentId,
});

const deleteItemRecursive = (items: OutlineItem[], id: string): OutlineItem[] =>
  items.reduce<OutlineItem[]>((acc, item) => {
    if (item.id === id) return acc;
    acc.push({ ...item, children: deleteItemRecursive(item.children, id) });
    return acc;
  }, []);

const updateItemRecursive = (items: OutlineItem[], update: Partial<OutlineItem> & { id: string }): OutlineItem[] =>
  items.map(item => {
    if (item.id === update.id) return { ...item, ...update, children: item.children };
    return { ...item, children: updateItemRecursive(item.children, update) };
  });

const duplicateItemRecursive = (items: OutlineItem[], id: string): OutlineItem[] => {
  const result: OutlineItem[] = [];
  for (const item of items) {
    result.push({ ...item, children: duplicateItemRecursive(item.children, id) });
    if (item.id === id) {
      const deepClone = JSON.parse(JSON.stringify(item)) as OutlineItem;
      const reId = (i: OutlineItem): OutlineItem => ({
        ...i,
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        children: i.children.map(reId),
      });
      result.push(reId(deepClone));
    }
  }
  return result;
};

const flattenDocs = (items: DocumentItem[]): FlatDoc[] => {
  const out: FlatDoc[] = [];
  for (const item of items) {
    if (item.type !== 'folder') out.push({ id: item.id, name: item.name });
    if (item.children) out.push(...flattenDocs(item.children));
  }
  return out;
};

const countItems = (items: OutlineItem[]): { total: number; complete: number } => {
  let total = 0, complete = 0;
  for (const item of items) {
    if (item.type !== 'Plot Point/Notes') {
      total++;
      if (item.status === 'Complete') complete++;
    }
    const sub = countItems(item.children);
    total += sub.total;
    complete += sub.complete;
  }
  return { total, complete };
};

// ─── OutlineItemDisplay ───────────────────────────────────────────────────────

interface OutlineItemDisplayProps {
  item: OutlineItem;
  index: number;
  level: number;
  compact: boolean;
  docs: FlatDoc[];
  onEdit: (item: OutlineItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onOpenDocument: (docId: string) => void;
}

function OutlineItemDisplay({
  item, index, level, compact, docs,
  onEdit, onDelete, onDuplicate, onToggleCollapse, onOpenDocument,
}: OutlineItemDisplayProps) {
  const { t } = useLanguage();
  const color = item.color ?? 'none';
  const hasChildren = item.children.length > 0;
  const canNestChildren = item.type === 'Chapter';
  const linkedDoc = item.linkedDocumentId ? docs.find(d => d.id === item.linkedDocumentId) : null;

  const typeBadgeVariant = item.type === 'Chapter' ? 'default' : item.type === 'Scene' ? 'secondary' : 'outline';
  const typeLabel = item.type === 'Chapter' ? t('outline.types.chapter')
    : item.type === 'Scene' ? t('outline.types.scene')
    : t('outline.types.plot_point');

  const statusLabel = item.status === 'Draft' ? t('outline.status.draft')
    : item.status === 'In Progress' ? t('outline.status.in_progress')
    : item.status === 'Complete' ? t('outline.status.complete')
    : null;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "border rounded-md hover:shadow-sm transition-shadow bg-card mb-2",
            snapshot.isDragging && "shadow-lg bg-primary/10",
            color !== 'none' && COLOR_BORDER_L[color],
          )}
          style={{ ...provided.draggableProps.style, marginLeft: `${level * 1.5}rem` }}
        >
          {/* Header row */}
          <div className={cn("flex justify-between items-start gap-2", compact ? "p-2" : "p-3")}>
            <div className="flex items-center gap-2 min-w-0">
              <div {...provided.dragHandleProps} title={t('outline.drag_handle_title')}>
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab shrink-0" />
              </div>
              <Badge variant={typeBadgeVariant} className="text-xs shrink-0">{typeLabel}</Badge>
              {statusLabel && item.status && (
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0 flex items-center", STATUS_CLASS[item.status])}>
                  {item.status === 'Draft' && <Circle className="h-3 w-3 mr-1 inline" />}
                  {item.status === 'In Progress' && <Clock className="h-3 w-3 mr-1 inline" />}
                  {item.status === 'Complete' && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                  {statusLabel}
                </span>
              )}
              {hasChildren && (
                <Button
                  variant="ghost" size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => onToggleCollapse(item.id)}
                  title={item.isCollapsed ? t('outline.item.expand_children') : t('outline.item.collapse_children')}
                >
                  {item.isCollapsed
                    ? <ChevronRight className="h-4 w-4" />
                    : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDuplicate(item.id)} title={t('outline.item.duplicate')}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)} title={t('outline.edit_item_title')}>
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title={t('outline.delete_item_title')}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('outline.delete_dialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('outline.delete_dialog.description_1')} &ldquo;{item.title}&rdquo; {t('outline.delete_dialog.description_2')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive hover:bg-destructive/90">
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Body */}
          <div className={cn("px-3 pb-3", compact && "pb-2")}>
            <h3 className={cn("font-semibold leading-tight", compact ? "text-sm" : "text-base")}>{item.title}</h3>

            {!compact && (
              <>
                {item.synopsis && (
                  <p className="text-sm italic text-muted-foreground mt-1">{item.synopsis}</p>
                )}

                {/* Meta chips */}
                {(item.pov || item.location || item.storyDate || item.wordCountTarget) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.pov && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        {t('outline.fields.pov')}: {item.pov}
                      </span>
                    )}
                    {item.location && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        {t('outline.fields.location')}: {item.location}
                      </span>
                    )}
                    {item.storyDate && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        {item.storyDate}
                      </span>
                    )}
                    {item.wordCountTarget && (
                      <span className="text-xs text-muted-foreground">
                        {t('outline.fields.word_count_target')}: {item.wordCountTarget.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {item.notes && (
                  <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap border-t pt-2">{item.notes}</p>
                )}

                {linkedDoc && (
                  <button
                    onClick={() => onOpenDocument(linkedDoc.id)}
                    className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {linkedDoc.name}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Children */}
          {!item.isCollapsed && (
            <>
              {canNestChildren ? (
                <Droppable droppableId={item.id} type="outline-item">
                  {(dp, ds) => (
                    <ul
                      ref={dp.innerRef}
                      {...dp.droppableProps}
                      className={cn("mx-3 mb-3 pl-3 border-l min-h-[16px] space-y-0", ds.isDraggingOver && "bg-accent/40 rounded")}
                    >
                      {item.children.map((child, ci) => (
                        <OutlineItemDisplay
                          key={child.id} item={child} index={ci} level={level + 1}
                          compact={compact} docs={docs}
                          onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate}
                          onToggleCollapse={onToggleCollapse} onOpenDocument={onOpenDocument}
                        />
                      ))}
                      {dp.placeholder}
                    </ul>
                  )}
                </Droppable>
              ) : (
                item.children.length > 0 && (
                  <ul className="mx-3 mb-3 pl-3 border-l space-y-0">
                    {item.children.map((child, ci) => (
                      <OutlineItemDisplay
                        key={child.id} item={child} index={ci} level={level + 1}
                        compact={compact} docs={docs}
                        onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate}
                        onToggleCollapse={onToggleCollapse} onOpenDocument={onOpenDocument}
                      />
                    ))}
                  </ul>
                )
              )}
            </>
          )}

          {item.isCollapsed && hasChildren && (
            <p className="px-3 pb-2 text-xs text-muted-foreground">
              {t('outline.item.sub_items', { count: String(item.children.length) })}
            </p>
          )}
        </li>
      )}
    </Draggable>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OutlineBuilderPage() {
  const { user } = useAuth();
  const { activeStoryId, setDocumentToOpen } = useStoryContext();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();

  const [items, setItems] = useState<OutlineItem[]>([]);
  const [compact, setCompact] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Side data
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [locales, setLocales] = useState<Locale[]>([]);
  const [docs, setDocs] = useState<FlatDoc[]>([]);

  // Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OutlineItem | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<OutlineItemType>('Scene');
  const [formSynopsis, setFormSynopsis] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formColor, setFormColor] = useState<OutlineItemColor>('none');
  const [formPov, setFormPov] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStoryDate, setFormStoryDate] = useState('');
  const [formStatus, setFormStatus] = useState<OutlineItemStatus | ''>('');
  const [formWordTarget, setFormWordTarget] = useState('');
  const [formLinkedDocId, setFormLinkedDocId] = useState(NO_DOC);

  useEffect(() => {
    if (!activeStoryId || !user) { setItems([]); return; }
    const key = getOutlineStorageKey(activeStoryId, user.uid);
    storage.getItem<OutlineItem[]>(key).then(stored => {
      if (stored) {
        setItems(stored.map((item: OutlineItem) => ({
          ...item, type: item.type || 'Plot Point/Notes', children: item.children || [],
        })));
      } else {
        setItems([]);
      }
    });

    const charsKey = getCharactersStorageKey(activeStoryId, user.uid);
    storage.getItem<CharacterProfile[]>(charsKey).then(c => setCharacters(c ?? []));

    const localesKey = getWorldBuildingStorageKey(activeStoryId, user.uid);
    storage.getItem<Locale[]>(localesKey).then(l => setLocales(l ?? []));

    const docsKey = getDocumentsStorageKey(activeStoryId, user.uid);
    storage.getItem<DocumentItem[]>(docsKey).then(d => setDocs(d ? flattenDocs(d) : []));
  }, [activeStoryId, user]);

  const persistItems = (newItems: OutlineItem[]) => {
    if (!activeStoryId || !user) return;
    storage.setItem(getOutlineStorageKey(activeStoryId, user.uid), newItems);
  };

  const handleSave = async () => {
    if (!activeStoryId || !user) return;
    setIsLoading(true);
    try {
      await storage.setItem(getOutlineStorageKey(activeStoryId, user.uid), items);
      toast({ title: t('common.save'), description: t('outline.toast_save_success') });
    } catch {
      toast({ title: t('common.error'), description: t('outline.toast_save_error'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle(''); setFormType('Scene'); setFormSynopsis(''); setFormNotes('');
    setFormColor('none'); setFormPov(''); setFormLocation(''); setFormStoryDate('');
    setFormStatus(''); setFormWordTarget(''); setFormLinkedDocId(NO_DOC);
    setEditingItem(null);
  };

  const openEdit = (item: OutlineItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormType(item.type);
    setFormSynopsis(item.synopsis ?? '');
    setFormNotes(item.notes ?? '');
    setFormColor(item.color ?? 'none');
    setFormPov(item.pov ?? '');
    setFormLocation(item.location ?? '');
    setFormStoryDate(item.storyDate ?? '');
    setFormStatus(item.status ?? '');
    setFormWordTarget(item.wordCountTarget ? String(item.wordCountTarget) : '');
    setFormLinkedDocId(item.linkedDocumentId ?? NO_DOC);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const wt = formWordTarget ? parseInt(formWordTarget, 10) : undefined;
      const fields = {
        title: formTitle.trim(),
        type: formType,
        synopsis: formSynopsis.trim() || undefined,
        notes: formNotes.trim() || undefined,
        color: formColor,
        pov: formPov.trim() || undefined,
        location: formLocation.trim() || undefined,
        storyDate: formStoryDate.trim() || undefined,
        status: (formStatus || undefined) as OutlineItemStatus | undefined,
        wordCountTarget: wt && !isNaN(wt) ? wt : undefined,
        linkedDocumentId: formLinkedDocId === NO_DOC ? undefined : formLinkedDocId,
      };
      if (editingItem) {
        const newItems = updateItemRecursive(items, { id: editingItem.id, ...fields });
        setItems(newItems);
        persistItems(newItems);
      } else {
        const newItems = [...items, createNewItem(
          fields.title, fields.type, fields.synopsis, fields.notes, fields.color,
          fields.pov, fields.location, fields.storyDate, fields.status,
          fields.wordCountTarget, fields.linkedDocumentId,
        )];
        setItems(newItems);
        persistItems(newItems);
      }
      setIsDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = useCallback((id: string) => {
    setItems(prev => {
      const newItems = deleteItemRecursive(prev, id);
      persistItems(newItems);
      return newItems;
    });
  }, [activeStoryId, user]);

  const handleDuplicate = useCallback((id: string) => {
    setItems(prev => {
      const newItems = duplicateItemRecursive(prev, id);
      persistItems(newItems);
      return newItems;
    });
  }, [activeStoryId, user]);

  const handleToggleCollapse = useCallback((id: string) => {
    setItems(prev => {
      const newItems = updateItemRecursive(prev, { id, isCollapsed: !findById(prev, id)?.isCollapsed });
      persistItems(newItems);
      return newItems;
    });
  }, [activeStoryId, user]);

  const findById = (items: OutlineItem[], id: string): OutlineItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      const found = findById(item.children, id);
      if (found) return found;
    }
    return null;
  };

  const handleOpenDocument = useCallback((docId: string) => {
    setDocumentToOpen(docId);
    router.push('/documents');
  }, [setDocumentToOpen, router]);

  // Drag & drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const newItems = JSON.parse(JSON.stringify(items)) as OutlineItem[];

    const findAndRemove = (
      list: OutlineItem[], droppableId: string, idx: number, dId: string
    ): OutlineItem | null => {
      if (droppableId === 'root') {
        if (list[idx]?.id === dId) { const [r] = list.splice(idx, 1); return r; }
        return null;
      }
      for (const item of list) {
        if (item.id === droppableId) {
          if (item.children[idx]?.id === dId) { const [r] = item.children.splice(idx, 1); return r; }
          return null;
        }
        const r = findAndRemove(item.children, droppableId, idx, dId);
        if (r) return r;
      }
      return null;
    };

    const insertInto = (list: OutlineItem[], droppableId: string, idx: number, toInsert: OutlineItem): boolean => {
      if (droppableId === 'root') { list.splice(idx, 0, toInsert); return true; }
      for (const item of list) {
        if (item.id === droppableId) { item.children.splice(idx, 0, toInsert); return true; }
        if (insertInto(item.children, droppableId, idx, toInsert)) return true;
      }
      return false;
    };

    const removed = findAndRemove(newItems, source.droppableId, source.index, draggableId);
    if (!removed) return;
    insertInto(newItems, destination.droppableId, destination.index, removed);
    setItems(newItems);
    persistItems(newItems);
  };

  // Export
  const formatItemAsText = (item: OutlineItem, indent = 0): string => {
    const pad = '  '.repeat(indent);
    const typeLabel = item.type === 'Chapter' ? t('outline.types.chapter')
      : item.type === 'Scene' ? t('outline.types.scene')
      : t('outline.types.plot_point');
    let text = `${pad}- [${typeLabel}] ${item.title}\n`;
    if (item.status) text += `${pad}  ${t('outline.export.status')}: ${item.status}\n`;
    if (item.synopsis) text += `${pad}  ${t('outline.export.synopsis')}: ${item.synopsis}\n`;
    if (item.pov) text += `${pad}  ${t('outline.export.pov')}: ${item.pov}\n`;
    if (item.location) text += `${pad}  ${t('outline.export.location')}: ${item.location}\n`;
    if (item.storyDate) text += `${pad}  ${t('outline.export.story_date')}: ${item.storyDate}\n`;
    if (item.wordCountTarget) text += `${pad}  ${t('outline.export.word_target')}: ${item.wordCountTarget}\n`;
    if (item.notes) text += `${pad}  ${t('outline.export.notes')}: ${item.notes.replace(/\n/g, `\n${pad}  `)}\n`;
    if (item.children.length) text += item.children.map(c => formatItemAsText(c, indent + 1)).join('');
    return text;
  };

  const handleExportTxt = () => {
    if (!items.length) return;
    const blob = new Blob([items.map(i => formatItemAsText(i)).join('')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'outline.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!items.length) return;
    const rows: string[][] = [['Type', 'Title', 'Status', 'Synopsis', 'POV', 'Location', 'Story Date', 'Word Target', 'Notes']];
    const collect = (list: OutlineItem[]) => {
      for (const item of list) {
        rows.push([
          item.type, item.title, item.status ?? '',
          item.synopsis ?? '', item.pov ?? '', item.location ?? '',
          item.storyDate ?? '', item.wordCountTarget ? String(item.wordCountTarget) : '',
          (item.notes ?? '').replace(/\n/g, ' '),
        ]);
        collect(item.children);
      }
    };
    collect(items);
    const csv = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'outline.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Progress
  const { total, complete } = countItems(items);
  const progressPct = total > 0 ? Math.round((complete / total) * 100) : 0;

  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('outline.no_active_story.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('outline.no_active_story.description_1')}{' '}
            <Link href="/stories" className="text-primary hover:underline">{t('outline.no_active_story.description_2')}</Link>{' '}
            {t('outline.no_active_story.description_3')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center">
              <ListTree className="mr-3 h-8 w-8 text-primary" /> {t('outline.title')}
            </h1>
            <p className="text-muted-foreground text-sm">{t('outline.description')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setCompact(c => !c)} title={compact ? t('outline.expanded_mode') : t('outline.compact_mode')}>
              <AlignJustify className="h-4 w-4 mr-1" />
              {compact ? t('outline.expanded_mode') : t('outline.compact_mode')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportTxt} disabled={items.length === 0}>
              <Download className="h-4 w-4 mr-1" /> TXT
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={items.length === 0}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <PlusCircle className="h-4 w-4 mr-1" /> {t('outline.add_button')}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              {t('common.save')}
            </Button>
          </div>
        </div>

        {/* Progress */}
        {total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('outline.progress', { complete: String(complete), total: String(total) })}</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        )}

        {/* Outline list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('outline.structure.title')}</CardTitle>
            <CardDescription className="text-xs">
              {items.length > 0 ? t('outline.structure.description_items') : t('outline.structure.description_no_items')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <ScrollArea className="h-[65vh] pr-2">
                <Droppable droppableId="root" type="outline-item">
                  {(provided, snapshot) => (
                    <ul
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn("space-y-0", snapshot.isDraggingOver && "bg-accent/20 rounded")}
                    >
                      {items.map((item, index) => (
                        <OutlineItemDisplay
                          key={item.id} item={item} index={index} level={0}
                          compact={compact} docs={docs}
                          onEdit={openEdit} onDelete={handleDelete}
                          onDuplicate={handleDuplicate} onToggleCollapse={handleToggleCollapse}
                          onOpenDocument={handleOpenDocument}
                        />
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-10">{t('outline.structure.empty')}</p>
            )}
          </CardContent>
        </Card>

        {/* Add / Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={open => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-[560px]">
            <ScrollArea className="max-h-[85vh]">
              <div className="p-1 pr-3">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? `${t('outline.edit_form.title')}: ${editingItem.title}` : t('outline.add_dialog.title')}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem ? t('outline.edit_form.description') : t('outline.add_dialog.description')}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                  {/* Type */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">{t('outline.fields.type')}</Label>
                    <Select value={formType} onValueChange={v => setFormType(v as OutlineItemType)}>
                      <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chapter">{t('outline.types.chapter')}</SelectItem>
                        <SelectItem value="Scene">{t('outline.types.scene')}</SelectItem>
                        <SelectItem value="Plot Point/Notes">{t('outline.types.plot_point')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label htmlFor="item-title" className="text-right text-sm">{t('outline.fields.title')}</Label>
                    <Input
                      id="item-title" value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      className="col-span-3" placeholder={t('outline.fields.title_placeholder')} required
                    />
                  </div>

                  {/* Color */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">{t('outline.fields.color')}</Label>
                    <div className="col-span-3 flex gap-2 flex-wrap">
                      {ITEM_COLORS.map(c => (
                        <button
                          key={c} type="button"
                          onClick={() => setFormColor(c)}
                          className={cn(
                            "w-6 h-6 rounded-full transition-transform",
                            COLOR_SWATCH[c],
                            formColor === c && "ring-2 ring-offset-2 ring-foreground scale-110",
                          )}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status + Word target */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label className="text-right text-sm">{t('outline.fields.status')}</Label>
                    <Select value={formStatus} onValueChange={v => setFormStatus(v as OutlineItemStatus | '')}>
                      <SelectTrigger className="col-span-1"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">{t('outline.status.draft')}</SelectItem>
                        <SelectItem value="In Progress">{t('outline.status.in_progress')}</SelectItem>
                        <SelectItem value="Complete">{t('outline.status.complete')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label htmlFor="word-target" className="text-right text-sm">{t('outline.fields.word_count_target')}</Label>
                    <Input
                      id="word-target" type="number" min={0} value={formWordTarget}
                      onChange={e => setFormWordTarget(e.target.value)}
                      placeholder="e.g. 2000"
                    />
                  </div>

                  {/* Synopsis */}
                  <div className="grid grid-cols-4 items-start gap-3">
                    <Label htmlFor="item-synopsis" className="text-right text-sm pt-2">{t('outline.fields.synopsis')}</Label>
                    <Textarea
                      id="item-synopsis" value={formSynopsis}
                      onChange={e => setFormSynopsis(e.target.value)}
                      className="col-span-3" rows={2}
                      placeholder={t('outline.fields.synopsis_placeholder')}
                    />
                  </div>

                  {/* POV */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label htmlFor="item-pov" className="text-right text-sm">{t('outline.fields.pov')}</Label>
                    <div className="col-span-3">
                      <Input
                        id="item-pov" list="pov-suggestions" value={formPov}
                        onChange={e => setFormPov(e.target.value)}
                        placeholder={t('outline.fields.pov_placeholder')}
                      />
                      <datalist id="pov-suggestions">
                        {characters.map(c => <option key={c.id} value={c.name} />)}
                      </datalist>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label htmlFor="item-location" className="text-right text-sm">{t('outline.fields.location')}</Label>
                    <div className="col-span-3">
                      <Input
                        id="item-location" list="location-suggestions" value={formLocation}
                        onChange={e => setFormLocation(e.target.value)}
                        placeholder={t('outline.fields.location_placeholder')}
                      />
                      <datalist id="location-suggestions">
                        {locales.map(l => <option key={l.id} value={l.name} />)}
                      </datalist>
                    </div>
                  </div>

                  {/* Story Date */}
                  <div className="grid grid-cols-4 items-center gap-3">
                    <Label htmlFor="item-date" className="text-right text-sm">{t('outline.fields.story_date')}</Label>
                    <Input
                      id="item-date" value={formStoryDate}
                      onChange={e => setFormStoryDate(e.target.value)}
                      className="col-span-3"
                      placeholder={t('outline.fields.story_date_placeholder')}
                    />
                  </div>

                  {/* Link to document */}
                  {docs.length > 0 && (
                    <div className="grid grid-cols-4 items-center gap-3">
                      <Label className="text-right text-sm">{t('outline.fields.linked_document')}</Label>
                      <Select value={formLinkedDocId} onValueChange={setFormLinkedDocId}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder={t('outline.fields.linked_document_none')} /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_DOC}>{t('outline.fields.linked_document_none')}</SelectItem>
                          {docs.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="grid grid-cols-4 items-start gap-3">
                    <Label htmlFor="item-notes" className="text-right text-sm pt-2">{t('outline.fields.notes')}</Label>
                    <Textarea
                      id="item-notes" value={formNotes}
                      onChange={e => setFormNotes(e.target.value)}
                      className="col-span-3" rows={3}
                      placeholder={t('outline.fields.notes_placeholder')}
                    />
                  </div>

                  <DialogFooter className="mt-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                      {editingItem ? t('common.save') : t('outline.add_dialog.add_button')}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </DragDropContext>
  );
}
