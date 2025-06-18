// src/components/editor/WritingArea.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Download, Trash2, Settings2, Palette, Sun, Moon } from 'lucide-react';
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

type Theme = 'light' | 'dark' | 'sepia';

export function WritingArea() {
  const [content, setContent, isSaving, clearSavedContent] = useAutosave<string>('linguaflow-editor-content', '');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [theme, setTheme] = useState<Theme>('light');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/) : [];
    setWordCount(words.length);
    setCharCount(content.length);
  }, [content]);

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

  const applyTheme = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
    // In a real app, you might change CSS variables or apply theme classes to a higher-level container
  };
  
  const themeClasses = {
    light: 'bg-background text-foreground',
    dark: 'bg-gray-800 text-gray-100', // Example dark theme
    sepia: 'bg-sepia-50 text-sepia-900' // Example sepia theme (add to tailwind.config if needed)
  };

  return (
    <div className={cn("flex flex-col h-full p-4 md:p-6 rounded-lg shadow-lg", themeClasses[theme])}>
      <Card className={cn("flex flex-col flex-grow shadow-none border-0", themeClasses[theme])}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => textareaRef.current?.focus()} title="Save (auto-saved)">
              <Save className={cn("h-5 w-5", isSaving ? "animate-pulse text-primary" : "text-muted-foreground")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Export">
                  <Download className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={handleExportTXT}>Export as TXT</DropdownMenuItem>
                <DropdownMenuItem disabled>Export as PDF (soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={clearSavedContent} title="Clear Content">
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Customize Theme">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Editor Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => applyTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyTheme('sepia')} disabled>
                  <Palette className="mr-2 h-4 w-4" /> Sepia (soon)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* <Button variant="ghost" size="icon" title="Settings">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
            </Button> */}
          </div>
        </div>
        <CardContent className="flex-grow p-0">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Let your story flow..."
            className={cn(
              "w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg p-6 leading-relaxed shadow-none",
              themeClasses[theme]
            )}
            aria-label="Writing area"
          />
        </CardContent>
        <div className="p-4 border-t border-border text-sm text-muted-foreground flex justify-between items-center">
          <span>Word Count: {wordCount}</span>
          <span>Character Count: {charCount}</span>
          <span>{isSaving ? "Saving..." : "Saved"}</span>
        </div>
      </Card>
    </div>
  );
}
