
// src/components/editor/WritingArea.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download, Trash2, Palette, Sun, Moon, Upload, Expand, Minimize, Play, Pause, RotateCcw, TimerIcon, Sparkles, Loader2, X, AlertTriangle, FileUp, FolderOpen, XCircle, Pilcrow, CaseSensitive, Type } from 'lucide-react';
import useAutosave from '@/hooks/useAutosave';
import { EditorToolbar } from './EditorToolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getWritingFeedback, type GetWritingFeedbackOutput } from '@/ai/flows/get-writing-feedback';
import { useSidebar } from '@/components/ui/sidebar';
import { formatDistanceToNow } from 'date-fns';
import { useStoryContext, getEditorContentKey, getDocumentsStorageKey } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

type EditorTheme = 'light' | 'dark';
const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';

interface EditorSettings {
  fontFamily: 'sans' | 'serif';
  fontSize: 'sm' | 'base' | 'lg';
  lineHeight: 'tight' | 'normal' | 'loose';
  paragraphSpacing: 'sm' | 'base' | 'lg';
}

const EDITOR_SETTINGS_KEY = 'openwritingkit-editor-settings';

type DocumentType = "folder" | "chapter" | "scene" | "file";
type DocumentStatus = "Draft" | "Revised" | "Complete";
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
  notes?: string; 
  content?: string;
  children?: DocumentItem[];
}


export function WritingArea() {
  const { t } = useLanguage();
  const { activeStoryId, documentToOpen, consumeDocumentToOpen } = useStoryContext();
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  
  const editorStorageKey = getEditorContentKey(activeStoryId, activeDocumentId);

  const [savedContent, setSavedContent, isSaving, clearSavedContent, lastSavedTime] = useAutosave<string>(
    editorStorageKey,
    '<p></p>',
    2000,
    !!documentToOpen // Prevent autoload when a document is about to be opened
  );
  
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('light');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const sidebarContext = useSidebar();
  const editorRef = useRef<HTMLDivElement>(null);

  const [sessionTime, setSessionTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<GetWritingFeedbackOutput | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [feedbackTimestamp, setFeedbackTimestamp] = useState<number | null>(null);
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontFamily: 'sans',
    fontSize: 'base',
    lineHeight: 'normal',
    paragraphSpacing: 'base',
  });
  
  const [isSaveToDocDialogOpen, setIsSaveToDocDialogOpen] = useState(false);
  const [newDocFilename, setNewDocFilename] = useState('');
  
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>([]);
  const [activeDocumentName, setActiveDocumentName] = useState<string | null>(null);

  const documentsStorageKey = getDocumentsStorageKey(activeStoryId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: savedContent,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      if (activeStoryId) {
        setSavedContent(currentEditor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none w-full h-full p-6'
      },
    },
  });

  const findDocumentRecursive = (items: DocumentItem[], docId: string): DocumentItem | null => {
    for (const item of items) {
      if (item.id === docId) {
        return item;
      }
      if (item.children) {
        const found = findDocumentRecursive(item.children, docId);
        if (found) return found;
      }
    }
    return null;
  };

  const loadAllDocuments = useCallback(() => {
    if (activeStoryId) {
        const stored = localStorage.getItem(documentsStorageKey);
        setAllDocuments(stored ? JSON.parse(stored) : []);
    } else {
        setAllDocuments([]);
    }
  }, [activeStoryId, documentsStorageKey]);

  useEffect(() => {
      loadAllDocuments();
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === documentsStorageKey) {
          loadAllDocuments();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
  }, [loadAllDocuments, documentsStorageKey]);


  const openDocument = useCallback((doc: DocumentItem) => {
    if (editor) {
      const content = doc.content || '<p></p>';
      setActiveDocumentId(doc.id);
      setActiveDocumentName(doc.name);
      // Directly set editor content without triggering autosave's load
      setSavedContent(content); 
      editor.commands.setContent(content, false);
    }
  }, [editor, setSavedContent]);


  useEffect(() => {
    if (editor && documentToOpen) {
      const docToLoadId = consumeDocumentToOpen();
      if (docToLoadId) {
        const docToLoad = findDocumentRecursive(allDocuments, docToLoadId);
        if (docToLoad) {
          openDocument(docToLoad);
        }
      }
    }
  }, [documentToOpen, editor, allDocuments, consumeDocumentToOpen, openDocument]);
  

  useEffect(() => {
    if (editor && savedContent !== editor.getHTML()) {
      editor.commands.setContent(savedContent, false);
    }
  }, [savedContent, editor]);


  const saveCurrentContentToDocument = useCallback((content: string, docId: string) => {
    if (!activeStoryId) return;

    const storedData = localStorage.getItem(documentsStorageKey);
    let documents: DocumentItem[] = storedData ? JSON.parse(storedData) : [];
    
    const updateRecursive = (items: DocumentItem[]): DocumentItem[] => {
        return items.map(item => {
            if (item.id === docId) {
                const textContent = content.replace(/<[^>]*>/g, '').trim();
                const wordCount = textContent.split(/\s+/).filter(Boolean).length;
                return { ...item, content, words: wordCount, lastModified: new Date().toISOString() };
            }
            if (item.children) {
                return { ...item, children: updateRecursive(item.children) };
            }
            return item;
        });
    };

    const updatedDocuments = updateRecursive(documents);
    localStorage.setItem(documentsStorageKey, JSON.stringify(updatedDocuments));
    
  }, [activeStoryId, documentsStorageKey]);


  useEffect(() => {
    if(activeDocumentId && savedContent) {
        saveCurrentContentToDocument(savedContent, activeDocumentId);
    }
  }, [savedContent, activeDocumentId, saveCurrentContentToDocument]);

  const closeDocument = () => {
    if(editor && activeDocumentId) {
        saveCurrentContentToDocument(editor.getHTML(), activeDocumentId);
        setActiveDocumentId(null);
        setActiveDocumentName(null);
        if (editor) {
            editor.commands.setContent('', false);
            setSavedContent('');
        }
    }
  }

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const storedAIPref = localStorage.getItem(AI_OPT_IN_KEY);
      setAiFeaturesEnabled(storedAIPref === 'true');
      
      const storedSettings = localStorage.getItem(EDITOR_SETTINGS_KEY);
      if (storedSettings) {
        try {
          setEditorSettings(JSON.parse(storedSettings));
        } catch(e) { /* use default */ }
      }

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === AI_OPT_IN_KEY) {
          setAiFeaturesEnabled(event.newValue === 'true');
        }
      };
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  const updateEditorSettings = (newSettings: Partial<EditorSettings>) => {
    setEditorSettings(prev => {
        const updated = { ...prev, ...newSettings };
        localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(updated));
        return updated;
    });
  };
  
  useEffect(() => {
    const editorElement = editor?.view.dom;
    if (!editorElement) return;

    const root = editorElement.closest('.ProseMirror') as HTMLElement | null;
    if (!root) return;

    const fontMap = {
        sans: "'PT Sans', sans-serif",
        serif: "Georgia, 'Times New Roman', Times, serif",
    };
    const sizeMap = { sm: '0.9rem', base: '1rem', lg: '1.1rem' };
    const lineHeightMap = { tight: '1.5', normal: '1.7', loose: '1.9' };
    const paraSpacingMap = { sm: '0.75rem', base: '1rem', lg: '1.5rem' };

    root.style.setProperty('--editor-font-family', fontMap[editorSettings.fontFamily]);
    root.style.setProperty('--editor-font-size', sizeMap[editorSettings.fontSize]);
    root.style.setProperty('--editor-line-height', lineHeightMap[editorSettings.lineHeight]);
    root.style.setProperty('--editor-paragraph-spacing', paraSpacingMap[editorSettings.paragraphSpacing]);

  }, [editorSettings, editor]);


  useEffect(() => {
    if (editor) {
      if (!activeStoryId) {
        editor.commands.setContent(`<p>${t('editor.no_story_message')}</p>`, false);
        editor.setEditable(false);
      } else {
        editor.setEditable(true);
      }
    }
  }, [activeStoryId, editor, t]);

  useEffect(() => {
    if (editor) {
      const textContent = editor.getText();
      const words = textContent.trim() ? textContent.trim().split(/\s+/).filter(word => word.length > 0) : [];
      setWordCount(words.length);
      setCharCount(textContent.length);
    }
  }, [savedContent, editor]);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setSessionTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimerToggle = () => setIsTimerRunning(!isTimerRunning);
  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setSessionTime(0);
  };

  const handleExportTXT = () => {
    if (!editor || !activeStoryId) return;
    const textContent = editor.getText();
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportHTML = () => {
    if (!editor || !activeStoryId) return;
    const htmlContent = editor.getHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleImportClick = () => {
     if (!activeStoryId) {
      toast({ title: t('editor.toast.no_story_title'), description: t('editor.toast.no_story_import'), variant: "destructive" });
      return;
    }
    fileInputRef.current?.click();
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor && activeStoryId) {
      if (file.type === "text/plain" || file.type === "text/html" || file.type === "text/markdown") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileContent = e.target?.result as string;
          editor.commands.setContent(fileContent); 
          toast({ title: t('editor.toast.import_success_title'), description: t('editor.toast.import_success_desc') });
        };
        reader.onerror = () => {
          toast({ title: t('common.error'), description: t('editor.toast.import_error_read'), variant: "destructive" });
        }
        reader.readAsText(file);
      } else {
        toast({ title: t('common.error'), description: t('editor.toast.import_error_type'), variant: "destructive" });
      }
      event.target.value = ''; 
    }
  };
  
  const themeClasses = {
    light: 'bg-background text-foreground',
    dark: 'bg-neutral-900 text-neutral-100',
  };
  
  const editorContainerClasses = {
    light: 'bg-background',
    dark: 'dark bg-neutral-900',
  }

  const applyEditorTheme = (selectedTheme: EditorTheme) => {
    setEditorTheme(selectedTheme);
  };

  const toggleFocusMode = () => setIsFocusMode(!isFocusMode);

  const handleGetFeedback = async () => {
    if (!editor || !activeStoryId) return;
    if (!aiFeaturesEnabled) {
      toast({ title: t('editor.toast.ai_disabled_title'), description: t('editor.toast.ai_disabled_desc')});
      return;
    }
    const textContent = editor.getText();
    if (!textContent.trim()) {
      toast({ title: t('editor.toast.empty_content_title'), description: t('editor.toast.empty_content_desc') });
      return;
    }

    if (isFocusMode) {
      toggleFocusMode(); 
    }

    setIsFetchingFeedback(true);
    setFeedbackResult(null);
    
    if (sidebarContext.open && !sidebarContext.isMobile) {
      sidebarContext.setOpen(false); 
    }

    try {
      const result = await getWritingFeedback({ text: textContent });
      setFeedbackResult(result);
      setFeedbackTimestamp(Date.now());
      setIsFeedbackPanelOpen(true);
    } catch (error) {
      console.error("Error getting writing feedback:", error);
      toast({ title: t('editor.toast.feedback_error_title'), description: (error as Error).message || t('editor.toast.feedback_error_desc'), variant: "destructive" });
      setIsFeedbackPanelOpen(false);
    } finally {
      setIsFetchingFeedback(false);
    }
  };
  
  const handleSaveToDocuments = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editor || !activeStoryId || !newDocFilename.trim()) return;

      const contentToSave = editor.getHTML();
      const textContent = editor.getText();
      const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
      
      const newFile: DocumentItem = {
          id: Date.now().toString(),
          name: newDocFilename,
          type: 'file',
          content: contentToSave,
          words: wordCount,
          lastModified: new Date().toISOString(),
          status: 'Draft',
          tags: ['Draft'],
      };

      try {
        const storedData = localStorage.getItem(documentsStorageKey);
        const documents: DocumentItem[] = storedData ? JSON.parse(storedData) : [];
        documents.push(newFile);
        localStorage.setItem(documentsStorageKey, JSON.stringify(documents));
        
        toast({ title: t('editor.toast.doc_saved_title'), description: t('editor.toast.doc_saved_desc', { name: newDocFilename }) });
        setIsSaveToDocDialogOpen(false);
        setNewDocFilename('');
      } catch (error) {
        console.error("Failed to save to documents:", error);
        toast({ title: t('common.error'), description: t('editor.toast.doc_save_error'), variant: "destructive" });
      }
  }

    const renderDocumentMenuItems = (items: DocumentItem[]) => {
      return items.map(item => {
        if (item.type === 'folder' || item.type === 'chapter') {
          return (
            <DropdownMenuSub key={item.id}>
              <DropdownMenuSubTrigger>{item.name}</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {item.children && item.children.length > 0
                    ? renderDocumentMenuItems(item.children)
                    : <DropdownMenuItem disabled>{t('editor.no_documents_in_folder')}</DropdownMenuItem>
                  }
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          );
        }
        if (item.type === 'file' || item.type === 'scene') {
          return (
            <DropdownMenuItem key={item.id} onClick={() => openDocument(item)}>
              {item.name}
            </DropdownMenuItem>
          );
        }
        return null;
      });
    };


  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('editor.loading')}</p>
      </div>
    );
  }

  if (!activeStoryId && isMounted) {
    return (
      <Card className="m-auto">
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('editor.no_story_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t('editor.no_story_description')}</p>
          <Link href="/stories" passHref>
            <Button variant="default">{t('editor.go_to_stories')}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  if (!editor) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('editor.initializing')}</p>
      </div>
    );
  }
  
  const currentOverallTheme = editorTheme === 'dark' ? 'dark' : '';


  if (isFocusMode) {
    return (
      <div className={cn("fixed inset-0 z-50 flex flex-col p-2 md:p-4", currentOverallTheme, themeClasses[editorTheme])} ref={editorRef}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFocusMode}
          className="absolute top-4 right-4 z-10"
          title={t('editor.exit_focus_mode')}
        >
          <Minimize className="h-5 w-5" />
        </Button>
        <EditorContent editor={editor} className={cn("flex-grow overflow-y-auto", editorContainerClasses[editorTheme])} />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex h-full", currentOverallTheme, themeClasses[editorTheme])}>
        <Card className={cn("flex flex-col flex-grow shadow-none border-0 rounded-none", isFeedbackPanelOpen ? "md:w-2/3" : "w-full", themeClasses[editorTheme], editorContainerClasses[editorTheme])}>
          {!isFocusMode && (
            <>
              <div className="flex items-center justify-between p-1 border-b border-border flex-wrap">
                <div className="flex items-center gap-0.5 md:gap-1 flex-wrap">
                  
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="px-2" title={t('editor.open_doc_button_title')} disabled={!activeStoryId}>
                        <FolderOpen className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground">{t('editor.open_doc_button')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-none">
                       {allDocuments.length > 0 ? renderDocumentMenuItems(allDocuments) : <DropdownMenuItem disabled>{t('editor.no_documents_found')}</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {activeDocumentId && (
                     <Button variant="ghost" size="sm" className="px-2" title={t('editor.close_doc_button_title')} onClick={closeDocument}>
                       <XCircle className="h-5 w-5 mr-2 text-destructive" />
                       <span className="text-destructive">{t('common.close')}</span>
                     </Button>
                  )}

                  <Button variant="ghost" size="icon" title={t('editor.save_button_title')} disabled={!activeStoryId}>
                    <Save className={cn("h-5 w-5", isSaving ? "animate-pulse text-primary" : "text-muted-foreground")} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsSaveToDocDialogOpen(true)} title={t('editor.save_as_new_button_title')} disabled={!activeStoryId || activeDocumentId !== null}>
                    <FileUp className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".txt,.html,.md" style={{ display: 'none' }} />
                  <Button variant="ghost" size="icon" onClick={handleImportClick} title={t('editor.import_button_title')} disabled={!activeStoryId}>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" title={t('editor.export_button_title')} disabled={!activeStoryId}>
                        <Download className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-none">
                      <DropdownMenuItem onClick={handleExportTXT} disabled={!activeStoryId}>{t('editor.export_txt')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportHTML} disabled={!activeStoryId}>{t('editor.export_html')}</DropdownMenuItem>
                      <DropdownMenuItem disabled>{t('editor.export_pdf')}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" onClick={() => { if(activeStoryId && confirm(t('editor.clear_content_confirm'))) { editor?.commands.clearContent(true); if(!activeDocumentId) clearSavedContent();} }} title={t('editor.clear_content_button_title')} disabled={!activeStoryId}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" onClick={handleGetFeedback} disabled={!activeStoryId || isFetchingFeedback || !aiFeaturesEnabled || !isMounted} aria-disabled={!activeStoryId || !aiFeaturesEnabled || !isMounted}>
                        {isFetchingFeedback ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className={cn("h-5 w-5", activeStoryId && aiFeaturesEnabled && isMounted ? "text-muted-foreground" : "text-muted-foreground/50")} />}
                      </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                      <p>{!activeStoryId ? t('editor.tooltip_no_story') : (aiFeaturesEnabled && isMounted ? t('editor.tooltip_get_feedback') : t('editor.tooltip_ai_disabled'))}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" title={t('editor.customize_view_title')}>
                        <Palette className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-none p-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <DropdownMenuLabel>{t('editor.customize_view.editor_theme')}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={editorTheme} onValueChange={(v) => applyEditorTheme(v as EditorTheme)}>
                              <DropdownMenuRadioItem value="light"><Sun className="mr-2 h-4 w-4" />{t('editor.customize_view.theme_light')}</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="dark"><Moon className="mr-2 h-4 w-4" />{t('editor.customize_view.theme_dark')}</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </div>
                          <div>
                            <DropdownMenuLabel>{t('editor.customize_view.font_family')}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={editorSettings.fontFamily} onValueChange={(v) => updateEditorSettings({ fontFamily: v as EditorSettings['fontFamily'] })}>
                              <DropdownMenuRadioItem value="sans"><Type className="mr-2 h-4 w-4" />{t('editor.customize_view.font_sans')}</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="serif"><CaseSensitive className="mr-2 h-4 w-4" />{t('editor.customize_view.font_serif')}</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </div>
                          <div>
                            <DropdownMenuLabel>{t('editor.customize_view.font_size')}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={editorSettings.fontSize} onValueChange={(v) => updateEditorSettings({ fontSize: v as EditorSettings['fontSize'] })}>
                              <DropdownMenuRadioItem value="sm">{t('settings.editor.font_size_small')}</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="base">{t('settings.editor.font_size_medium')}</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="lg">{t('settings.editor.font_size_large')}</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </div>
                           <div>
                            <DropdownMenuLabel>{t('editor.customize_view.line_height')}</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={editorSettings.lineHeight} onValueChange={(v) => updateEditorSettings({ lineHeight: v as EditorSettings['lineHeight'] })}>
                              <DropdownMenuRadioItem value="tight">{t('editor.customize_view.line_height_tight')}</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="normal">{t('editor.customize_view.line_height_normal')}</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="loose">{t('editor.customize_view.line_height_loose')}</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </div>
                           <div className="col-span-2">
                             <DropdownMenuLabel>{t('editor.customize_view.paragraph_spacing')}</DropdownMenuLabel>
                              <DropdownMenuRadioGroup value={editorSettings.paragraphSpacing} onValueChange={(v) => updateEditorSettings({ paragraphSpacing: v as EditorSettings['paragraphSpacing'] })}>
                                <div className="flex justify-around">
                                  <DropdownMenuRadioItem value="sm">{t('settings.editor.font_size_small')}</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="base">{t('settings.editor.font_size_medium')}</DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="lg">{t('settings.editor.font_size_large')}</DropdownMenuRadioItem>
                                </div>
                            </DropdownMenuRadioGroup>
                          </div>
                       </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="ghost" size="icon" onClick={handleTimerToggle} title={isTimerRunning ? t('editor.pause_session') : t('editor.start_session')} disabled={!activeStoryId}>
                    {isTimerRunning ? <Pause className="h-5 w-5 text-muted-foreground" /> : <Play className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleTimerReset} title={t('editor.reset_session')} disabled={!activeStoryId || (sessionTime === 0 && !isTimerRunning)}>
                    <RotateCcw className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <span className="text-xs md:text-sm text-muted-foreground min-w-[60px] md:min-w-[70px] text-center px-1"><TimerIcon className="inline h-4 w-4 mr-0.5 md:mr-1" />{formatTime(sessionTime)}</span>
                  <Button variant="ghost" size="icon" onClick={toggleFocusMode} title={t('editor.focus_mode')} disabled={!activeStoryId}>
                    <Expand className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  
                </div>
              </div>
              <EditorToolbar editor={editor} />
            </>
          )}
          <CardContent className={cn("flex-grow p-0 overflow-hidden", editorContainerClasses[editorTheme])}>
            <ScrollArea className="h-full w-full">
               <div ref={editorRef} className="min-h-full">
                    <EditorContent editor={editor} className={cn("min-h-full", themeClasses[editorTheme])}/>
                </div>
            </ScrollArea>
          </CardContent>
          {!isFocusMode && (
            <CardFooter className="p-2 md:p-3 border-t border-border text-xs md:text-sm text-muted-foreground flex justify-between items-center">
              <div className="flex-1 truncate">
                <span>{activeDocumentId ? t('editor.editing', { name: activeDocumentName }) : t('editor.editing_scratchpad')}</span>
              </div>
              <div className="flex-1 text-center">
                <span>{t('editor.words')}: {activeStoryId ? wordCount : '-'} | {t('editor.chars')}: {activeStoryId ? charCount : '-'}</span>
              </div>
              <div className="flex-1 text-right">
                <span>{activeStoryId ? (isSaving ? t('common.saving') : lastSavedTime ? `${t('common.saved')}: ${lastSavedTime.toLocaleTimeString()}` : t('editor.not_yet_saved')) : t('editor.no_active_story_footer')}</span>
              </div>
            </CardFooter>
          )}
        </Card>

        {isFeedbackPanelOpen && feedbackResult && (
          <Card className={cn("hidden md:flex md:flex-col md:w-1/3 h-full border-l rounded-none shadow-lg", themeClasses[editorTheme], editorContainerClasses[editorTheme])}>
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
              <div>
                <CardTitle className="text-lg">{t('editor.feedback.title')}</CardTitle>
                {feedbackTimestamp && (
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(feedbackTimestamp, { addSuffix: true })}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsFeedbackPanelOpen(false)} title={t('editor.feedback.close_button_title')}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">{t('editor.feedback.overall_assessment_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-sm whitespace-pre-wrap">{feedbackResult.overallAssessment}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">{t('editor.feedback.readability_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-1">
                      <p className="text-sm"><strong>{t('editor.feedback.readability_score')}:</strong> {feedbackResult.readability.scoreDescription}</p>
                      <p className="text-sm whitespace-pre-wrap"><strong>{t('editor.feedback.readability_assessment')}:</strong> {feedbackResult.readability.assessment}</p>
                    </CardContent>
                  </Card>

                  {feedbackResult.grammarSpellingSuggestions && feedbackResult.grammarSpellingSuggestions.length > 0 && (
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-base">{t('editor.feedback.grammar_title')}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-3">
                        {feedbackResult.grammarSpellingSuggestions.map((suggestion, index) => (
                          <div key={index} className="p-2 border rounded-md bg-muted/30">
                            <p className="text-xs text-muted-foreground uppercase">{suggestion.issueType}</p>
                            <p className="text-sm my-1">{t('editor.feedback.grammar_original')}: <span className="line-through text-red-500 dark:text-red-400">{suggestion.originalText}</span></p>
                            <p className="text-sm my-1">{t('editor.feedback.grammar_suggested')}: <span className="text-green-600 dark:text-green-400 font-medium">{suggestion.suggestedCorrection}</span></p>
                            {suggestion.explanation && (
                              <p className="text-xs text-muted-foreground italic mt-1">{suggestion.explanation}</p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {feedbackResult.grammarSpellingSuggestions && feedbackResult.grammarSpellingSuggestions.length === 0 && (
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-base">{t('editor.feedback.grammar_title')}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm">{t('editor.feedback.grammar_none_found')}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

       <Dialog open={isSaveToDocDialogOpen} onOpenChange={setIsSaveToDocDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('editor.save_as_dialog.title')}</DialogTitle>
                <DialogDescription>
                    {t('editor.save_as_dialog.description')}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveToDocuments}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="doc-filename" className="text-right">{t('editor.save_as_dialog.filename_label')}</Label>
                        <Input 
                            id="doc-filename" 
                            value={newDocFilename} 
                            onChange={(e) => setNewDocFilename(e.target.value)} 
                            className="col-span-3" 
                            required 
                            placeholder={t('editor.save_as_dialog.filename_placeholder')}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">{t('common.cancel')}</Button></DialogClose>
                    <Button type="submit">{t('editor.save_as_dialog.save_button')}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
