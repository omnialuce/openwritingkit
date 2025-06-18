
// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Cloud, Brain, Palette as PaletteIcon, Type, User, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';
const EDITOR_FONT_SIZE_KEY = 'openwritingkit-editor-font-size';

type EditorFontSize = "sm" | "base" | "lg";

export default function SettingsPage() {
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState<EditorFontSize>("base");
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const storedAIPref = localStorage.getItem(AI_OPT_IN_KEY);
    setAiFeaturesEnabled(storedAIPref === 'true');

    const storedFontSize = localStorage.getItem(EDITOR_FONT_SIZE_KEY) as EditorFontSize | null;
    if (storedFontSize && ["sm", "base", "lg"].includes(storedFontSize)) {
      setEditorFontSize(storedFontSize);
    }
  }, []);

  const handleAiToggle = (enabled: boolean) => {
    setAiFeaturesEnabled(enabled);
    if (isMounted) {
      localStorage.setItem(AI_OPT_IN_KEY, enabled ? 'true' : 'false');
    }
  };

  const handleEditorFontSizeChange = (value: string) => {
    const newSize = value as EditorFontSize;
    setEditorFontSize(newSize);
    if (isMounted) {
      localStorage.setItem(EDITOR_FONT_SIZE_KEY, newSize);
      // Dispatch a custom event to notify the editor immediately
      window.dispatchEvent(new CustomEvent('editorSettingsChanged', { detail: { fontSize: newSize } }));
    }
  };
  
  const handlePlaceholderClick = (featureName: string) => {
    toast({
      title: "Feature Not Implemented",
      description: `${featureName} functionality is not yet available.`,
      variant: "default",
    });
  };


  if (!isMounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center"><SettingsIcon className="mr-3 h-8 w-8 text-primary"/>Settings</h1>
        <p className="text-muted-foreground">Manage your OpenWritingKit preferences and account details.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PaletteIcon className="h-6 w-6 text-primary" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme-select">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme-select" className="w-full md:w-[200px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-6 w-6 text-primary" />
            <CardTitle>Editor Preferences</CardTitle>
          </div>
          <CardDescription>Customize your writing environment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="editor-font-size-select">Editor Font Size</Label>
            <Select value={editorFontSize} onValueChange={handleEditorFontSizeChange}>
              <SelectTrigger id="editor-font-size-select" className="w-full md:w-[200px]">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="base">Medium (Default)</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Changes will apply to the text editor area.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <CardTitle>AI Feature Preferences</CardTitle>
          </div>
          <CardDescription>
            Control your experience with AI-powered writing assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="ai-features-toggle"
              checked={aiFeaturesEnabled}
              onCheckedChange={handleAiToggle}
              aria-labelledby="ai-features-label"
            />
            <Label htmlFor="ai-features-toggle" id="ai-features-label" className="flex-grow">
              Enable AI Writing Assistance
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            By enabling AI features, you agree that the text you submit for a specific AI function (e.g., "Get Writing Feedback," "Analyze Pacing," "Generate Prompt") 
            will be sent to a third-party AI model for processing to provide that feature. 
            OpenWritingKit does not store this submitted text on its servers or use it for training its own AI models. 
            Your primary document content remains stored locally in your browser. You can disable AI features at any time.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <CardTitle>Account Management</CardTitle>
          </div>
          <CardDescription>
            Manage your account details (placeholder).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm"><strong>Email:</strong> user@example.com (Mock)</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handlePlaceholderClick("Change Password")}>
              <Shield className="mr-2 h-4 w-4" /> Change Password
            </Button>
            <Button variant="destructive" onClick={() => handlePlaceholderClick("Delete Account")}>
              <AlertTriangle className="mr-2 h-4 w-4" /> Delete Account
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-2">
             Full account management features require backend integration and are not yet implemented.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <CardTitle>Cloud Backup & Sync</CardTitle>
          </div>
          <CardDescription>
            Securely back up your work to the cloud and sync across devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Connect your account to enable cloud backup and synchronization features. This will allow you to access your writing projects from anywhere.
          </p>
          <Button disabled className="w-full md:w-auto" onClick={() => handlePlaceholderClick("Connect to Cloud")}>
            Connect to Cloud (Coming Soon)
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
