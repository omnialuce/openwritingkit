
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
import { Save, Download, Trash2, Palette, Sun, Moon, Upload, Expand, Minimize, Play, Pause, RotateCcw, TimerIcon, Sparkles, Loader2, X, AlertTriangle, FileUp } from 'lucide-react';
import useAutosave from '@/hooks/useAutosave';
import { EditorToolbar } from './EditorToolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

type EditorTheme = 'light' | 'dark';
const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';
const EDITOR_FONT_SIZE_KEY = 'openwritingkit-editor-font-size';
type EditorFontSize = "sm" | "base" | "lg";

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
  const { activeStoryId } = useStoryContext();
  const editorStorageKey = getEditorContentKey(activeStoryId);
  const documentsStorageKey = getDocumentsStorageKey(activeStoryId);

  const [savedContent, setSavedContent, isSaving, clearSavedContent, lastSavedTime] = useAutosave<string>(editorStorageKey, '<p></p>');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('light');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const sidebarContext = useSidebar();

  const [sessionTime, setSessionTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<GetWritingFeedbackOutput | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [feedbackTimestamp, setFeedbackTimestamp] = useState<number | null>(null);
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState<EditorFontSize>("base");
  
  const [isSaveToDocDialogOpen, setIsSaveToDocDialogOpen] = useState(false);
  const [newDocFilename, setNewDocFilename] = useState('');


  const getEditorClassNames = useCallback((size: EditorFontSize) => {
    const baseClasses = 'prose dark:prose-invert focus:outline-none w-full h-full p-6 leading-relaxed';
    const sizeMap: Record<EditorFontSize, string> = {
      sm: 'prose-sm',
      base: 'prose-base',
      lg: 'prose-lg',
    };
    return cn(baseClasses, sizeMap[size]);
  }, []);


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
        class: getEditorClassNames(editorFontSize),
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const storedAIPref = localStorage.getItem(AI_OPT_IN_KEY);
      setAiFeaturesEnabled(storedAIPref === 'true');
      
      const storedFontSize = localStorage.getItem(EDITOR_FONT_SIZE_KEY) as EditorFontSize | null;
      if (storedFontSize) {
        setEditorFontSize(storedFontSize);
      }

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === AI_OPT_IN_KEY) {
          setAiFeaturesEnabled(event.newValue === 'true');
        }
        if (event.key === EDITOR_FONT_SIZE_KEY) {
          setEditorFontSize((event.newValue as EditorFontSize) || "base");
        }
      };
      window.addEventListener('storage', handleStorageChange);
      
      const handleEditorSettingsChange = (event: Event) => {
        const detail = (event as CustomEvent).detail;
        if (detail.fontSize) {
          setEditorFontSize(detail.fontSize);
        }
      };
      window.addEventListener('editorSettingsChanged', handleEditorSettingsChange);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('editorSettingsChanged', handleEditorSettingsChange);
      };
    }
  }, []);

  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: getEditorClassNames(editorFontSize),
          },
        },
      });
    }
  }, [editorFontSize, editor, getEditorClassNames]);


  useEffect(() => {
    if (editor && activeStoryId) {
      if (savedContent !== editor.getHTML()) {
        editor.commands.setContent(savedContent, false);
      }
    } else if (editor && !activeStoryId) {
      editor.commands.setContent("<p>Please select a story to start writing.</p>", false);
      editor.setEditable(false);
    }
     if (editor && activeStoryId) {
      editor.setEditable(true);
    }
  }, [savedContent, editor, activeStoryId]);


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
      toast({ title: "No Active Story", description: "Please select a story before importing content.", variant: "destructive" });
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
          toast({ title: "Success", description: "File content imported." });
        };
        reader.onerror = () => {
          toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
        }
        reader.readAsText(file);
      } else {
        toast({ title: "Error", description: "Please select a .txt, .html, or .md file.", variant: "destructive" });
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
      toast({ title: "AI Features Disabled", description: "Please enable AI features in settings to use this."});
      return;
    }
    const textContent = editor.getText();
    if (!textContent.trim()) {
      toast({ title: "Empty Content", description: "Please write some text before requesting feedback." });
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
      toast({ title: "AI Feedback Error", description: (error as Error).message || "Could not retrieve feedback.", variant: "destructive" });
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
        
        toast({ title: 'Document Saved', description: `"${newDocFilename}" has been saved to your documents.` });
        setIsSaveToDocDialogOpen(false);
        setNewDocFilename('');
      } catch (error) {
        console.error("Failed to save to documents:", error);
        toast({ title: "Save Error", description: "Could not save file to documents.", variant: "destructive" });
      }
  }


  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading editor...</p>
      </div>
    );
  }

  if (!activeStoryId && isMounted) {
    return (
      <Card className="m-auto">
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> No Active Story</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">The editor is disabled until a story is selected.</p>
          <Link href="/stories" passHref>
            <Button variant="default">Go to Stories Page</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  if (!editor) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Initializing editor...</p>
      </div>
    );
  }
  
  const currentOverallTheme = editorTheme === 'dark' ? 'dark' : '';


  if (isFocusMode) {
    return (
      <div className={cn("fixed inset-0 z-50 flex flex-col p-2 md:p-4", currentOverallTheme, themeClasses[editorTheme])}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFocusMode}
          className="absolute top-4 right-4 z-10"
          title="Exit Focus Mode"
        >
          <Minimize className="h-5 w-5" />
        </Button>
        <EditorContent editor={editor} className={cn("flex-grow overflow-y-auto", editorContainerClasses[editorTheme], getEditorClassNames(editorFontSize))} />
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
                  <Button variant="ghost" size="icon" title="Save (auto-saved)" disabled={!activeStoryId}>
                    <Save className={cn("h-5 w-5", isSaving ? "animate-pulse text-primary" : "text-muted-foreground")} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsSaveToDocDialogOpen(true)} title="Save as Document" disabled={!activeStoryId}>
                    <FileUp className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".txt,.html,.md" style={{ display: 'none' }} />
                  <Button variant="ghost" size="icon" onClick={handleImportClick} title="Import File" disabled={!activeStoryId}>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" title="Export" disabled={!activeStoryId}>
                        <Download className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-none">
                      <DropdownMenuItem onClick={handleExportTXT} disabled={!activeStoryId}>Export as TXT</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportHTML} disabled={!activeStoryId}>Export as HTML</DropdownMenuItem>
                      <DropdownMenuItem disabled>Export as PDF (soon)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" onClick={() => { if(activeStoryId && confirm('Are you sure you want to clear all content and history for this story? This cannot be undone.')) { editor?.commands.clearContent(true); clearSavedContent();} }} title="Clear Content & History" disabled={!activeStoryId}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" onClick={handleGetFeedback} disabled={!activeStoryId || isFetchingFeedback || !aiFeaturesEnabled || !isMounted} aria-disabled={!activeStoryId || !aiFeaturesEnabled || !isMounted}>
                        {isFetchingFeedback ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className={cn("h-5 w-5", activeStoryId && aiFeaturesEnabled && isMounted ? "text-muted-foreground" : "text-muted-foreground/50")} />}
                      </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                      <p>{!activeStoryId ? "Select a story first" : (aiFeaturesEnabled && isMounted ? "Get Writing Feedback" : "AI features disabled in Settings")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 flex-wrap">
                  <Button variant="ghost" size="icon" onClick={handleTimerToggle} title={isTimerRunning ? "Pause Session" : "Start Session"} disabled={!activeStoryId}>
                    {isTimerRunning ? <Pause className="h-5 w-5 text-muted-foreground" /> : <Play className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleTimerReset} title="Reset Session Timer" disabled={!activeStoryId || (sessionTime === 0 && !isTimerRunning)}>
                    <RotateCcw className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <span className="text-xs md:text-sm text-muted-foreground min-w-[60px] md:min-w-[70px] text-center px-1"><TimerIcon className="inline h-4 w-4 mr-0.5 md:mr-1" />{formatTime(sessionTime)}</span>
                  <Button variant="ghost" size="icon" onClick={toggleFocusMode} title="Focus Mode" disabled={!activeStoryId}>
                    <Expand className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" title="Customize Theme">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none">
                      <DropdownMenuLabel>Editor Theme</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => applyEditorTheme('light')}>
                        <Sun className="mr-2 h-4 w-4" /> Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => applyEditorTheme('dark')}>
                        <Moon className="mr-2 h-4 w-4" /> Dark
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <EditorToolbar editor={editor} />
            </>
          )}
          <CardContent className={cn("flex-grow p-0 overflow-hidden", editorContainerClasses[editorTheme])}>
            <ScrollArea className="h-full w-full">
              <EditorContent editor={editor} className={cn("min-h-full", themeClasses[editorTheme], getEditorClassNames(editorFontSize))}/>
            </ScrollArea>
          </CardContent>
          {!isFocusMode && (
            <CardFooter className="p-2 md:p-3 border-t border-border text-xs md:text-sm text-muted-foreground flex justify-between items-center">
              <span>Words: {activeStoryId ? wordCount : '-'}</span>
              <span>Chars: {activeStoryId ? charCount : '-'}</span>
              <span>{activeStoryId ? (isSaving ? "Saving..." : lastSavedTime ? `Saved: ${lastSavedTime.toLocaleTimeString()}` : "Not yet saved") : "No active story"}</span>
            </CardFooter>
          )}
        </Card>

        {isFeedbackPanelOpen && feedbackResult && (
          <Card className={cn("hidden md:flex md:flex-col md:w-1/3 h-full border-l rounded-none shadow-lg", themeClasses[editorTheme], editorContainerClasses[editorTheme])}>
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
              <div>
                <CardTitle className="text-lg">AI Writing Feedback</CardTitle>
                {feedbackTimestamp && (
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(feedbackTimestamp, { addSuffix: true })}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsFeedbackPanelOpen(false)} title="Close Feedback Panel">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">Overall Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-sm whitespace-pre-wrap">{feedbackResult.overallAssessment}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">Readability</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-1">
                      <p className="text-sm"><strong>Score:</strong> {feedbackResult.readability.scoreDescription}</p>
                      <p className="text-sm whitespace-pre-wrap"><strong>Assessment:</strong> {feedbackResult.readability.assessment}</p>
                    </CardContent>
                  </Card>

                  {feedbackResult.grammarSpellingSuggestions && feedbackResult.grammarSpellingSuggestions.length > 0 && (
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-base">Grammar & Spelling Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-3">
                        {feedbackResult.grammarSpellingSuggestions.map((suggestion, index) => (
                          <div key={index} className="p-2 border rounded-md bg-muted/30">
                            <p className="text-xs text-muted-foreground uppercase">{suggestion.issueType}</p>
                            <p className="text-sm my-1">Original: <span className="line-through text-red-500 dark:text-red-400">{suggestion.originalText}</span></p>
                            <p className="text-sm my-1">Suggested: <span className="text-green-600 dark:text-green-400 font-medium">{suggestion.suggestedCorrection}</span></p>
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
                        <CardTitle className="text-base">Grammar & Spelling</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm">No specific grammar or spelling issues found by the AI.</p>
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
                <DialogTitle>Save to Documents</DialogTitle>
                <DialogDescription>
                    Enter a filename to save the current editor content as a new file in your documents.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveToDocuments}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="doc-filename" className="text-right">Filename</Label>
                        <Input 
                            id="doc-filename" 
                            value={newDocFilename} 
                            onChange={(e) => setNewDocFilename(e.target.value)} 
                            className="col-span-3" 
                            required 
                            placeholder="e.g., Chapter 1 Draft"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Save Document</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

    