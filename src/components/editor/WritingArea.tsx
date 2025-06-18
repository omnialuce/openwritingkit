// src/components/editor/WritingArea.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Download, Trash2, Palette, Sun, Moon, Upload, Expand, Minimize, Play, Pause, RotateCcw, TimerIcon } from 'lucide-react';
import useAutosave from '@/hooks/useAutosave';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Theme = 'light' | 'dark';

export function WritingArea() {
  const [content, setContent, isSaving, clearSavedContent, lastSavedTime] = useAutosave<string>('linguaflow-editor-content', '');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [theme, setTheme] = useState<Theme>('light');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Session Timer State
  const [sessionTime, setSessionTime] = useState(0); // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).filter(word => word.length > 0) : [];
    setWordCount(words.length);
    setCharCount(content.length);

    // Update last active date for streak counter whenever content changes
    if (typeof window !== 'undefined' && content !== '') { // only update if there's content
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('linguaflow-last-active-date', today);
    }

  }, [content]);

  // Session Timer Effects
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

  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setSessionTime(0);
  };


  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleExportTXT = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContent(text);
          toast({ title: "Success", description: "File content imported." });
        };
        reader.onerror = () => {
          toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
        }
        reader.readAsText(file);
      } else {
        toast({ title: "Error", description: "Please select a .txt file.", variant: "destructive" });
      }
      event.target.value = '';
    }
  };

  const applyTheme = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
  };
  
  const themeClasses = {
    light: 'bg-background text-foreground',
    dark: 'bg-neutral-900 text-neutral-100', // Specific dark for editor content area
  };

  const toggleFocusMode = () => setIsFocusMode(!isFocusMode);

  if (isFocusMode) {
    return (
      <div className={cn("fixed inset-0 z-50 flex flex-col p-2 md:p-4", themeClasses[theme])}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFocusMode}
          className="absolute top-4 right-4 z-10"
          title="Exit Focus Mode"
        >
          <Minimize className="h-5 w-5" />
        </Button>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Let your story flow..."
          className={cn(
            "w-full h-full flex-grow resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg p-6 leading-relaxed shadow-none",
            themeClasses[theme]
          )}
          aria-label="Writing area in focus mode"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full p-4 md:p-6 rounded-none shadow-lg", themeClasses[theme], isFocusMode ? 'fixed inset-0 z-50' : '')}>
      <Card className={cn("flex flex-col flex-grow shadow-none border-0 rounded-none", themeClasses[theme])}>
        {!isFocusMode && (
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="icon" title="Save (auto-saved)">
                <Save className={cn("h-5 w-5", isSaving ? "animate-pulse text-primary" : "text-muted-foreground")} />
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".txt" style={{ display: 'none' }} />
              <Button variant="ghost" size="icon" onClick={handleImportClick} title="Import TXT">
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
                  <DropdownMenuItem disabled>Export as PDF (soon)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={() => { if(confirm('Are you sure you want to clear all content? This cannot be undone.')) clearSavedContent();}} title="Clear Content">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
               {/* Timer Controls */}
              <Button variant="ghost" size="icon" onClick={handleTimerToggle} title={isTimerRunning ? "Pause Session" : "Start Session"}>
                {isTimerRunning ? <Pause className="h-5 w-5 text-muted-foreground" /> : <Play className="h-5 w-5 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleTimerReset} title="Reset Session Timer" disabled={sessionTime === 0 && !isTimerRunning}>
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[70px] text-center"><TimerIcon className="inline h-4 w-4 mr-1" />{formatTime(sessionTime)}</span>


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
                  <DropdownMenuItem onClick={() => applyTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => applyTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" /> Dark
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
        <CardContent className="flex-grow p-0">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Let your story flow..."
            className={cn(
              "w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg p-6 leading-relaxed shadow-none rounded-none",
              themeClasses[theme]
            )}
            aria-label="Writing area"
          />
        </CardContent>
        {!isFocusMode && (
          <div className="p-3 border-t border-border text-sm text-muted-foreground flex justify-between items-center">
            <span>Words: {wordCount}</span>
            <span>Chars: {charCount}</span>
            <span>{isSaving ? "Saving..." : lastSavedTime ? `Saved: ${lastSavedTime.toLocaleTimeString()}` : "Saved"}</span>
          </div>
        )}
      </Card>
    </div>
  );
}
