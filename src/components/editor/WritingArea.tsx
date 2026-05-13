// src/components/editor/WritingArea.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Focus from '@tiptap/extension-focus';
import TiptapLink from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Download, Trash2, Palette, Sun, Moon, Upload, Expand, Minimize, Play, Pause, RotateCcw, TimerIcon, Sparkles, Loader2, X, AlertTriangle, FileUp, FolderOpen, XCircle, Pilcrow, CaseSensitive, Type, History, Undo, Bold, Italic, Strikethrough, Link as LinkIcon } from 'lucide-react';
import useAutosave, { type VersionHistoryEntry } from '@/hooks/useAutosave';
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
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getWritingFeedback, type WritingFeedbackResult } from '@/lib/writing-feedback';
import { useSidebar } from '@/components/ui/sidebar';
import { format, formatDistanceToNow } from 'date-fns';
import { useStoryContext, getEditorContentKey, getDocumentsStorageKey, type DocumentItem } from '@/contexts/StoryContext';
import NextLink from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';
import { Toggle } from '@/components/ui/toggle';
import { Slider } from '@/components/ui/slider';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { generateDocxFromHtml } from '@/lib/docx-generator';
import mammoth from 'mammoth';
import { Separator } from '@/components/ui/separator';


const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';

function sanitiseHtml(dirty: string): string {
  const doc = new DOMParser().parseFromString(dirty, 'text/html');
  // Remove script and style elements
  doc.querySelectorAll('script, style, iframe, object, embed').forEach(el => el.remove());
  return doc.body.innerHTML;
}

interface EditorSettings {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  focusMode: boolean;
  editorWidth: number;
  fontFamily: 'sans' | 'serif';
}

const EDITOR_SETTINGS_KEY = 'openwritingkit-editor-settings-v3';

export function WritingArea() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { activeStoryId, documentToOpen, consumeDocumentToOpen, historyDocumentId, consumeHistoryDocumentId, updateDocumentMetadata } = useStoryContext();
  const { toast } = useToast();
  const sidebarContext = useSidebar();
  const isMobile = useIsMobile();
  
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeDocumentName, setActiveDocumentName] = useState<string | null>(null);
  
  const editorStorageKey = getEditorContentKey(activeStoryId, activeDocumentId, user?.uid);

  const [savedContent, setSavedContent, isSaving, clearSavedContent, lastSavedTime, versionHistory] = useAutosave<string>(
    editorStorageKey,
    '<p></p>',
    2000
  );
  
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);


  const [sessionTime, setSessionTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<WritingFeedbackResult | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [feedbackTimestamp, setFeedbackTimestamp] = useState<number | null>(null);
  
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [selectedHistoryVersion, setSelectedHistoryVersion] = useState<VersionHistoryEntry<string> | null>(null);

  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    fontSize: 16,
    lineHeight: 1.7,
    paragraphSpacing: 1,
    focusMode: false,
    editorWidth: 800,
    fontFamily: 'sans',
  });
  
  const [isSaveToDocDialogOpen, setIsSaveToDocDialogOpen] = useState(false);
  const [newDocFilename, setNewDocFilename] = useState('');

  // Find & Replace
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findMatchCount, setFindMatchCount] = useState<number | null>(null);
  
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>([]);
  
  const documentsStorageKey = getDocumentsStorageKey(activeStoryId, user?.uid);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      CharacterCount,
      Typography,
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
        class: cn('prose dark:prose-invert focus:outline-none w-full h-full p-6', 
                   editorSettings.focusMode && 'focus-mode'
                   )
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
    if (activeStoryId && user?.uid && documentsStorageKey) {
        storage.getItem<DocumentItem[]>(documentsStorageKey).then(stored => {
          setAllDocuments(stored || []);
        });
    } else {
        setAllDocuments([]);
    }
  }, [activeStoryId, user?.uid, documentsStorageKey]);

  useEffect(() => {
      loadAllDocuments();
      const handleCustomStorageChange = ((event: CustomEvent) => {
        if (event.detail?.key === documentsStorageKey) loadAllDocuments();
      }) as EventListener;
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === documentsStorageKey) loadAllDocuments();
      };
      window.addEventListener('storage-change', handleCustomStorageChange);
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage-change', handleCustomStorageChange);
        window.removeEventListener('storage', handleStorageChange);
      };
  }, [loadAllDocuments, documentsStorageKey]);


  const openDocument = useCallback((docId: string) => {
      const doc = findDocumentRecursive(allDocuments, docId);
      if (doc) {
        setActiveDocumentId(doc.id);
        setActiveDocumentName(doc.name);
        setIsHistoryPanelOpen(false);
        setSelectedHistoryVersion(null);
      }
  }, [allDocuments]);


  useEffect(() => {
    if (documentToOpen) {
      const docToLoadId = consumeDocumentToOpen();
      if (docToLoadId && docToLoadId !== activeDocumentId) {
         setActiveDocumentId(docToLoadId); // this triggers the editor reload
         const doc = findDocumentRecursive(allDocuments, docToLoadId);
         if (doc) {
            setActiveDocumentName(doc.name);
         }
      }
    }
  }, [documentToOpen, consumeDocumentToOpen, activeDocumentId, allDocuments]);
  
  useEffect(() => {
    if (historyDocumentId) {
        const docId = consumeHistoryDocumentId();
        if (docId) {
            openDocument(docId);
            setIsHistoryPanelOpen(true);
        }
    }
  }, [historyDocumentId, consumeHistoryDocumentId, openDocument]);

  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    isFirstLoadRef.current = true;
  }, [editorStorageKey]);

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    const isEmpty = currentHtml === '' || currentHtml === '<p></p>';
    if (isFirstLoadRef.current && isEmpty && savedContent && savedContent !== '<p></p>') {
      editor.commands.setContent(savedContent, false);
      isFirstLoadRef.current = false;
    } else if (isFirstLoadRef.current && !isEmpty) {
      // Editor already has content (e.g. initial value set by useEditor); mark load done.
      isFirstLoadRef.current = false;
    }
  }, [savedContent, editor]);


  const closeDocument = () => {
    setActiveDocumentId(null);
    setActiveDocumentName(null);
    setIsHistoryPanelOpen(false);
  }

  useEffect(() => {
    setIsMounted(true);
    storage.getItem<string>(AI_OPT_IN_KEY).then(val => {
      setAiFeaturesEnabled(val === 'true');
    });
    storage.getItem<EditorSettings | string>(EDITOR_SETTINGS_KEY).then(val => {
      if (val) {
        try {
          // val may be an EditorSettings object (new storage) or a JSON string (old double-encoded data)
          const parsed = typeof val === 'string' ? JSON.parse(val) : val;
          setEditorSettings(prev => ({ ...prev, ...parsed }));
        } catch { /* use default */ }
      }
    });

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AI_OPT_IN_KEY) {
        setAiFeaturesEnabled(event.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateEditorSettings = (newSettings: Partial<EditorSettings>) => {
    setEditorSettings(prev => {
        const updated = { ...prev, ...newSettings };
        storage.setItem(EDITOR_SETTINGS_KEY, updated);
        return updated;
    });
  };
  
  useEffect(() => {
    if (!editor) return;
    const editorElement = editor.view.dom;
    if (!editorElement) return;

    const root = editorElement.closest('.ProseMirror') as HTMLElement | null;
    if (!root) return;
    
    // Update class names for focus mode
    editor?.setOptions({
        editorProps: {
            attributes: {
                class: cn('prose dark:prose-invert focus:outline-none w-full p-6', 
                   editorSettings.focusMode && 'focus-mode'
                )
            }
        }
    })

    root.style.setProperty('--editor-font-size', `${editorSettings.fontSize}px`);
    root.style.setProperty('--editor-line-height', String(editorSettings.lineHeight));
    root.style.setProperty('--editor-paragraph-spacing', `${editorSettings.paragraphSpacing}rem`);
    root.style.setProperty('--editor-font-family', `var(--editor-font-family-${editorSettings.fontFamily})`);
    root.style.maxWidth = `${editorSettings.editorWidth}px`;
    root.style.margin = '0 auto';

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
      // Use CharacterCount extension if available, fall back to manual count
      const cc = editor.storage.characterCount;
      if (cc) {
        setWordCount(cc.words());
        setCharCount(cc.characters());
      } else {
        const text = editor.getText();
        setWordCount(text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0);
        setCharCount(text.length);
      }
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
    link.download = `${activeDocumentName || 'document'}.txt`;
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
    link.download = `${activeDocumentName || 'document'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportDOCX = async () => {
    if (!editor || !activeStoryId) return;
    const htmlContent = editor.getHTML();
    try {
      const doc = generateDocxFromHtml(htmlContent);
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${activeDocumentName || 'document'}.docx`);
    } catch (error) {
       console.error("DOCX generation error:", error);
       toast({ title: t('common.error'), description: t('editor.toast.docx_error'), variant: "destructive" });
    }
  };

  const handleExportMarkdown = () => {
    if (!editor || !activeStoryId) return;
    // Convert basic TipTap HTML to Markdown
    let md = editor.getHTML()
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '_$1_')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '_$1_')
      .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeDocumentName || 'document'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };


  const handleImportClick = () => {
     if (!activeStoryId) {
      toast({ title: t('editor.toast.no_story_title'), description: t('editor.toast.no_story_import'), variant: "destructive" });
      return;
    }
    fileInputRef.current?.click();
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor || !activeStoryId) return;

    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            if (!arrayBuffer) {
                toast({ title: t('documents.toast.error_reading_file'), variant: "destructive" });
                return;
            }
            try {
                const result = await mammoth.convertToHtml({ arrayBuffer });
                editor.commands.setContent(result.value, true);
                toast({ title: t('documents.toast.import_success_title'), description: t('documents.toast.import_success_desc', { name: file.name }) });
            } catch (error) {
                console.error("Mammoth conversion error:", error);
                toast({ title: t('documents.toast.import_failed_title'), description: t('documents.toast.import_failed_desc'), variant: "destructive" });
            }
        };
        reader.readAsArrayBuffer(file);
    } else if (file.type === "text/plain" || file.type === "text/html" || file.type === "text/markdown") {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target?.result as string;
            editor.commands.setContent(fileContent, true); 
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
  };
  
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

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

    if (isFullScreen) {
      toggleFullScreen(); 
    }
    
    setIsHistoryPanelOpen(false);
    setIsFetchingFeedback(true);
    setFeedbackResult(null);
    
    if (sidebarContext.open && !sidebarContext.isMobile) {
      sidebarContext.setOpen(false); 
    }

    try {
      const result = await getWritingFeedback({ text: textContent, language: language });
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
  
  const handleFindCount = () => {
    if (!editor || !findText.trim()) { setFindMatchCount(null); return; }
    const text = editor.getText();
    const matches = text.match(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'));
    setFindMatchCount(matches ? matches.length : 0);
  };

  const handleReplaceAll = () => {
    if (!editor || !findText.trim()) return;
    const html = editor.getHTML();
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replaced = html.replace(new RegExp(escaped, 'gi'), replaceText);
    editor.commands.setContent(replaced, true);
    setFindMatchCount(0);
    toast({ title: t('editor.find_replace.replaced_title'), description: t('editor.find_replace.replaced_desc') });
  };

  const handleSaveToDocuments = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editor || !activeStoryId || !newDocFilename.trim() || !user) return;

      const contentToSave = editor.getHTML();
      
      const newFile: DocumentItem = {
          id: Date.now().toString(),
          name: newDocFilename,
          type: 'file',
          lastModified: new Date().toISOString(),
          status: 'Draft',
          tags: ['Draft'],
          words: wordCount,
      };

      try {
        if (!documentsStorageKey) return;
        storage.getItem<DocumentItem[]>(documentsStorageKey).then(storedData => {
            const documents: DocumentItem[] = storedData || [];
            documents.push(newFile);
            storage.setItem(documentsStorageKey, documents);

            // Create the content entry for the new document
            const newEditorKey = getEditorContentKey(activeStoryId, newFile.id, user.uid);
            storage.setItem(newEditorKey, {
                current: contentToSave,
                history: [{ timestamp: new Date().toISOString(), text: contentToSave }],
                lastSaved: new Date().toISOString(),
            });

            // Switch active document to the new one
            setActiveDocumentId(newFile.id);
            setActiveDocumentName(newFile.name);

            toast({ title: t('editor.toast.doc_saved_title'), description: t('editor.toast.doc_saved_desc', { name: newDocFilename }) });
            setIsSaveToDocDialogOpen(false);
            setNewDocFilename('');
        })
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
            <DropdownMenuItem key={item.id} onClick={() => openDocument(item.id)}>
              {item.name}
            </DropdownMenuItem>
          );
        }
        return null;
      });
    };

    const handleRevertVersion = (version: VersionHistoryEntry<string>) => {
      if (editor && confirm(t('editor.history.revert_confirm'))) {
        setSavedContent(version.text);
        editor.commands.setContent(version.text, true);
        toast({ title: t('editor.history.revert_success_title'), description: t('editor.history.revert_success_desc') });
        setSelectedHistoryVersion(null);
      }
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
          <NextLink href="/stories" passHref>
            <Button variant="default">{t('editor.go_to_stories')}</Button>
          </NextLink>
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
  
  const isSidePanelOpen = (isFeedbackPanelOpen || isHistoryPanelOpen) && !isMobile;

  const renderFeedbackContent = () => feedbackResult && (
    <div className="space-y-4 p-4">
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
            <p className="text-sm text-muted-foreground">{t('editor.feedback.grammar_none_found')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderHistoryContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto">
        <ul className="p-2 space-y-2">
          {versionHistory.map((version, index) => (
            <li key={version.timestamp}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start text-left h-auto py-2", selectedHistoryVersion?.timestamp === version.timestamp && "bg-accent")}
                onClick={() => setSelectedHistoryVersion(version)}
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(version.timestamp), 'MMM d, yyyy, h:mm a')}
                  </span>
                </div>
              </Button>
            </li>
          ))}
          {versionHistory.length === 0 && <p className="p-4 text-sm text-muted-foreground">{t('editor.history.no_history')}</p>}
        </ul>
      </div>
      {selectedHistoryVersion && (
        <div className="p-4 border-t">
          <h4 className="font-semibold mb-2">{t('editor.history.preview_title')}</h4>
          <ScrollArea className="h-32 border rounded-md p-2 bg-muted text-sm">
            <div dangerouslySetInnerHTML={{ __html: sanitiseHtml(selectedHistoryVersion.text) }} className="prose dark:prose-invert prose-sm" />
          </ScrollArea>
          <Button className="w-full mt-3" onClick={() => handleRevertVersion(selectedHistoryVersion)}>
            <Undo className="mr-2 h-4 w-4" /> {t('editor.history.revert_button')}
          </Button>
        </div>
      )}
    </div>
  );


  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col p-2 md:p-4 bg-background">
         <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            title={t('editor.exit_focus_mode')}
            >
            <Minimize className="h-5 w-5" />
            </Button>
        </div>
        <div className="flex-grow overflow-y-auto" ref={editorRef}>
            <EditorContent editor={editor} className="min-h-full"/>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full bg-background">
        <Card className={cn("flex flex-col flex-grow shadow-none border-0 rounded-none transition-all duration-300", isSidePanelOpen ? "md:w-2/3 lg:w-3/4" : "w-full")}>
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex gap-1 bg-background border rounded-md p-1 shadow-md">
            <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Toggle>
            <Toggle size="sm" pressed={editor.isActive('link')} onPressedChange={() => { const url = window.prompt('URL'); if(url) {editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()}}}><LinkIcon className="h-4 w-4" /></Toggle>
          </BubbleMenu>
          
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
                  <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".txt,.html,.md,.docx" style={{ display: 'none' }} />
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
                      <DropdownMenuItem onClick={handleExportMarkdown} disabled={!activeStoryId}>{t('editor.export_md')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportHTML} disabled={!activeStoryId}>{t('editor.export_html')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportDOCX} disabled={!activeStoryId}>{t('editor.export_docx')}</DropdownMenuItem>
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
                  <Button variant="ghost" size="icon" onClick={() => setIsFindReplaceOpen(v => !v)} title={t('editor.find_replace.title')} disabled={!activeStoryId}>
                    <CaseSensitive className={cn("h-5 w-5", !activeStoryId ? "text-muted-foreground/50" : "text-muted-foreground")} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setIsHistoryPanelOpen(!isHistoryPanelOpen); setIsFeedbackPanelOpen(false); }} title={t('editor.history.title')} disabled={!activeDocumentId}>
                      <History className={cn("h-5 w-5", !activeDocumentId ? "text-muted-foreground/50" : "text-muted-foreground")}/>
                  </Button>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" title={t('editor.customize_view_title')}>
                        <Palette className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-none p-2 space-y-4">
                      <DropdownMenuLabel>{t('editor.customize_view.view_options')}</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem checked={editorSettings.focusMode} onCheckedChange={(checked) => updateEditorSettings({ focusMode: checked as boolean })}>
                        {t('editor.customize_view.focus_mode')}
                      </DropdownMenuCheckboxItem>
                      <Separator />
                       <div className="px-2 space-y-2">
                        <Label>{t('editor.customize_view.font_family')}</Label>
                        <DropdownMenuRadioGroup value={editorSettings.fontFamily} onValueChange={(value) => updateEditorSettings({ fontFamily: value as 'sans' | 'serif' })}>
                            <div className="flex justify-around">
                            <DropdownMenuRadioItem value="sans" className="w-full justify-center">{t('editor.customize_view.font_sans')}</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="serif" className="w-full justify-center">{t('editor.customize_view.font_serif')}</DropdownMenuRadioItem>
                            </div>
                        </DropdownMenuRadioGroup>
                       </div>
                       <Separator />
                      <div className='px-2 space-y-2'>
                        <Label>{t('editor.customize_view.font_size')} ({editorSettings.fontSize}px)</Label>
                        <Slider value={[editorSettings.fontSize]} onValueChange={([val]) => updateEditorSettings({ fontSize: val })} min={12} max={24} step={1} />
                      </div>
                      <div className='px-2 space-y-2'>
                        <Label>{t('editor.customize_view.line_height')} ({editorSettings.lineHeight})</Label>
                        <Slider value={[editorSettings.lineHeight]} onValueChange={([val]) => updateEditorSettings({ lineHeight: val })} min={1.2} max={2.2} step={0.1} />
                      </div>
                       <div className='px-2 space-y-2'>
                        <Label>{t('editor.customize_view.paragraph_spacing')} ({editorSettings.paragraphSpacing}rem)</Label>
                        <Slider value={[editorSettings.paragraphSpacing]} onValueChange={([val]) => updateEditorSettings({ paragraphSpacing: val })} min={0.5} max={2} step={0.1} />
                      </div>
                      <div className='px-2 space-y-2'>
                        <Label>{t('editor.customize_view.text_area_width')} ({editorSettings.editorWidth}px)</Label>
                        <Slider value={[editorSettings.editorWidth]} onValueChange={([val]) => updateEditorSettings({ editorWidth: val })} min={500} max={1200} step={50} />
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
                  <Button variant="ghost" size="icon" onClick={toggleFullScreen} title={t('editor.full_screen_mode')} disabled={!activeStoryId}>
                    <Expand className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  
                </div>
              </div>
              <EditorToolbar editor={editor} />

              {/* Find & Replace bar */}
              {isFindReplaceOpen && (
                <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/30 text-sm">
                  <Input
                    value={findText}
                    onChange={e => { setFindText(e.target.value); setFindMatchCount(null); }}
                    placeholder={t('editor.find_replace.find_placeholder')}
                    className="h-7 text-xs w-40"
                    onKeyDown={e => e.key === 'Enter' && handleFindCount()}
                  />
                  <Input
                    value={replaceText}
                    onChange={e => setReplaceText(e.target.value)}
                    placeholder={t('editor.find_replace.replace_placeholder')}
                    className="h-7 text-xs w-40"
                  />
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleFindCount}>
                    {t('editor.find_replace.count_button')}
                    {findMatchCount !== null && ` (${findMatchCount})`}
                  </Button>
                  <Button size="sm" variant="default" className="h-7 text-xs" onClick={handleReplaceAll} disabled={!findText.trim()}>
                    {t('editor.find_replace.replace_all')}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setIsFindReplaceOpen(false); setFindText(''); setReplaceText(''); setFindMatchCount(null); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

          <CardHeader className="p-2 border-b">
             <h2 className="text-lg font-semibold text-center text-muted-foreground">
                {activeDocumentId ? `${t('editor.editing', { name: activeDocumentName || '' })}` : t('editor.editing_scratchpad')}
            </h2>
          </CardHeader>
          <CardContent className="flex-grow p-0 overflow-y-auto bg-background">
             <div ref={editorRef} className="min-h-full">
                <EditorContent editor={editor} />
             </div>
          </CardContent>
          
            <CardFooter className="p-2 md:p-3 border-t border-border text-xs md:text-sm text-muted-foreground flex justify-between items-center">
              <div className="flex-1 truncate">
                <span>{activeStoryId ? (isSaving ? t('common.saving') : lastSavedTime ? `${t('common.saved')} ${formatDistanceToNow(lastSavedTime, { addSuffix: true })}` : t('editor.not_yet_saved')) : t('editor.no_active_story_footer')}</span>
              </div>
              <div className="flex-1 text-center">
                <span>{t('editor.words')}: {activeStoryId ? wordCount : '-'} | {t('editor.chars')}: {activeStoryId ? charCount : '-'}</span>
              </div>
              <div className="flex-1 text-right">
              </div>
            </CardFooter>
          
        </Card>

        {isSidePanelOpen && (
          <Card className="hidden md:flex md:flex-col md:w-1/3 lg:w-1/4 h-full border-l rounded-none shadow-lg">
            {isFeedbackPanelOpen && feedbackResult && (
              <>
                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
                  <div>
                    <CardTitle className="text-lg">{t('editor.feedback.title')}</CardTitle>
                    {feedbackTimestamp && (<p className="text-xs text-muted-foreground">{formatDistanceToNow(feedbackTimestamp, { addSuffix: true })}</p>)}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsFeedbackPanelOpen(false)} title={t('editor.feedback.close_button_title')}><X className="h-5 w-5" /></Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-0"><ScrollArea className="h-full">{renderFeedbackContent()}</ScrollArea></CardContent>
              </>
            )}
            {isHistoryPanelOpen && (
               <>
                <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
                  <div>
                    <CardTitle className="text-lg">{t('editor.history.title')}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t('editor.history.description')}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsHistoryPanelOpen(false)} title={t('editor.history.close_button')}><X className="h-5 w-5" /></Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-0">{renderHistoryContent()}</CardContent>
              </>
            )}
          </Card>
        )}
      </div>

       <Dialog open={isFeedbackPanelOpen && isMobile} onOpenChange={setIsFeedbackPanelOpen}>
        <DialogContent className="max-h-[90vh] flex flex-col p-0">
           <DialogHeader className="p-4 border-b">
              <DialogTitle>{t('editor.feedback.title')}</DialogTitle>
              {feedbackTimestamp && (<DialogDescription>{formatDistanceToNow(feedbackTimestamp, { addSuffix: true })}</DialogDescription>)}
            </DialogHeader>
          <ScrollArea className="flex-grow">{renderFeedbackContent()}</ScrollArea>
           <DialogFooter className="p-4 border-t"><DialogClose asChild><Button type="button" variant="secondary">{t('common.close')}</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isHistoryPanelOpen && isMobile} onOpenChange={setIsHistoryPanelOpen}>
        <DialogContent className="max-h-[90vh] flex flex-col p-0">
           <DialogHeader className="p-4 border-b">
              <DialogTitle>{t('editor.history.title')}</DialogTitle>
              <DialogDescription>{t('editor.history.description')}</DialogDescription>
            </DialogHeader>
          <div className="flex-grow overflow-hidden">{renderHistoryContent()}</div>
           <DialogFooter className="p-4 border-t"><DialogClose asChild><Button type="button" variant="secondary">{t('common.close')}</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>


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
