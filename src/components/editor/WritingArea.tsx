
// src/components/editor/WritingArea.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Download, Trash2, Palette, Sun, Moon, Upload, Expand, Minimize, Play, Pause, RotateCcw, TimerIcon, Sparkles, Loader2 } from 'lucide-react';
import useAutosave from '@/hooks/useAutosave';
import { EditorToolbar } from './EditorToolbar'; // New Toolbar
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"; // Aliased DialogTitle to avoid conflict
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getWritingFeedback, type GetWritingFeedbackOutput } from '@/ai/flows/get-writing-feedback';

type EditorTheme = 'light' | 'dark';
const EDITOR_CONTENT_KEY = 'openwritingkit-active-document-content';
const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';

export function WritingArea() {
  const [savedContent, setSavedContent, isSaving, clearSavedContent, lastSavedTime] = useAutosave<string>(EDITOR_CONTENT_KEY, '<p></p>');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('light');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [sessionTime, setSessionTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<GetWritingFeedbackOutput | null>(null);
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: savedContent,
    onUpdate: ({ editor: currentEditor }) => {
      setSavedContent(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none w-full h-full p-6 leading-relaxed',
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const storedAIPref = localStorage.getItem(AI_OPT_IN_KEY);
      setAiFeaturesEnabled(storedAIPref === 'true');

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

  useEffect(() => {
    if (editor && savedContent !== editor.getHTML()) {
      editor.commands.setContent(savedContent, false);
    }
  }, [savedContent, editor]);


  useEffect(() => {
    if (editor) {
      const textContent = editor.getText();
      const words = textContent.trim() ? textContent.trim().split(/\s+/).filter(word => word.length > 0) : [];
      setWordCount(words.length);
      setCharCount(textContent.length);
    }
  }, [savedContent, editor]); // Re-calculate on savedContent change (which happens on editor update)

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
    if (!editor) return;
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
    if (!editor) return;
    const htmlContent = editor.getHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      if (file.type === "text/plain" || file.type === "text/html" || file.type === "text/markdown") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileContent = e.target?.result as string;
          // For TXT, it's fine. For HTML/MD, TipTap might need specific extensions
          // or a conversion step for perfect import. For now, setting as HTML.
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
    dark: 'dark bg-neutral-900', // Apply 'dark' class for ProseMirror dark theme
  }

  const applyEditorTheme = (selectedTheme: EditorTheme) => {
    setEditorTheme(selectedTheme);
    // The .prose-dark class is handled by globals.css via Tailwind typography plugin
  };

  const toggleFocusMode = () => setIsFocusMode(!isFocusMode);

  const handleGetFeedback = async () => {
    if (!editor) return;
    if (!aiFeaturesEnabled) {
      toast({ title: "AI Features Disabled", description: "Please enable AI features in settings to use this."});
      return;
    }
    const textContent = editor.getText();
    if (!textContent.trim()) {
      toast({ title: "Empty Content", description: "Please write some text before requesting feedback." });
      return;
    }
    setIsFetchingFeedback(true);
    setFeedbackResult(null);
    try {
      const result = await getWritingFeedback({ text: textContent });
      setFeedbackResult(result);
      setIsFeedbackDialogOpen(true);
    } catch (error) {
      console.error("Error getting writing feedback:", error);
      toast({ title: "AI Feedback Error", description: (error as Error).message || "Could not retrieve feedback.", variant: "destructive" });
    } finally {
      setIsFetchingFeedback(false);
    }
  };

  if (!editor) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading editor...</p>
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
        <EditorContent editor={editor} className={cn("flex-grow overflow-y-auto", editorContainerClasses[editorTheme])} />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full rounded-none shadow-lg", currentOverallTheme, themeClasses[editorTheme], isFocusMode ? 'fixed inset-0 z-50' : '')}>
        <Card className={cn("flex flex-col flex-grow shadow-none border-0 rounded-none", themeClasses[editorTheme])}>
          {!isFocusMode && (
            <>
              <div className="flex items-center justify-between p-1 border-b border-border flex-wrap">
                <div className="flex items-center gap-0.5 md:gap-1 flex-wrap">
                  <Button variant="ghost" size="icon" title="Save (auto-saved)">
                    <Save className={cn("h-5 w-5", isSaving ? "animate-pulse text-primary" : "text-muted-foreground")} />
                  </Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".txt,.html,.md" style={{ display: 'none' }} />
                  <Button variant="ghost" size="icon" onClick={handleImportClick} title="Import File">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" title="Export">
                        <Download className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-none">
                      <DropdownMenuItem onClick={handleExportTXT}>Export as TXT</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportHTML}>Export as HTML</DropdownMenuItem>
                      <DropdownMenuItem disabled>Export as PDF (soon)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" onClick={() => { if(confirm('Are you sure you want to clear all content and history? This cannot be undone.')) { editor.commands.clearContent(true); clearSavedContent();} }} title="Clear Content & History">
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button variant="ghost" size="icon" onClick={handleGetFeedback} disabled={isFetchingFeedback || !aiFeaturesEnabled || !isMounted} aria-disabled={!aiFeaturesEnabled || !isMounted}>
                        {isFetchingFeedback ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className={cn("h-5 w-5", aiFeaturesEnabled && isMounted ? "text-muted-foreground" : "text-muted-foreground/50")} />}
                      </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                      <p>{aiFeaturesEnabled && isMounted ? "Get Writing Feedback" : "AI features disabled in Settings"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 flex-wrap">
                  <Button variant="ghost" size="icon" onClick={handleTimerToggle} title={isTimerRunning ? "Pause Session" : "Start Session"}>
                    {isTimerRunning ? <Pause className="h-5 w-5 text-muted-foreground" /> : <Play className="h-5 w-5 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleTimerReset} title="Reset Session Timer" disabled={sessionTime === 0 && !isTimerRunning}>
                    <RotateCcw className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <span className="text-xs md:text-sm text-muted-foreground min-w-[60px] md:min-w-[70px] text-center px-1"><TimerIcon className="inline h-4 w-4 mr-0.5 md:mr-1" />{formatTime(sessionTime)}</span>
                  <Button variant="ghost" size="icon" onClick={toggleFocusMode} title="Focus Mode">
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
            <ScrollArea className="h-full w-full"> {/* Added ScrollArea */}
              <EditorContent editor={editor} className={cn("min-h-full", themeClasses[editorTheme])}/>
            </ScrollArea>
          </CardContent>
          {!isFocusMode && (
            <div className="p-2 md:p-3 border-t border-border text-xs md:text-sm text-muted-foreground flex justify-between items-center">
              <span>Words: {wordCount}</span>
              <span>Chars: {charCount}</span>
              <span>{isSaving ? "Saving..." : lastSavedTime ? `Saved: ${lastSavedTime.toLocaleTimeString()}` : "Not yet saved"}</span>
            </div>
          )}
        </Card>
      </div>

      {isFeedbackDialogOpen && feedbackResult && (
         <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitleComponent>AI Writing Feedback</DialogTitleComponent>
              <DialogDescription>
                Here's an analysis of your text.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] p-1 pr-3">
              <div className="space-y-6 pr-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{feedbackResult.overallAssessment}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Readability</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm"><strong>Score:</strong> {feedbackResult.readability.scoreDescription}</p>
                    <p className="text-sm whitespace-pre-wrap"><strong>Assessment:</strong> {feedbackResult.readability.assessment}</p>
                  </CardContent>
                </Card>

                {feedbackResult.grammarSpellingSuggestions && feedbackResult.grammarSpellingSuggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Grammar & Spelling Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {feedbackResult.grammarSpellingSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 border rounded-md bg-muted/50">
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
                    <CardHeader>
                      <CardTitle className="text-lg">Grammar & Spelling</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">No specific grammar or spelling issues found by the AI.</p>
                    </CardContent>
                  </Card>
                 )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
}
