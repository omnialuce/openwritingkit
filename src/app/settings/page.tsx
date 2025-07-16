// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Cloud, Brain, Palette as PaletteIcon, Type, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';
const EDITOR_FONT_SIZE_KEY = 'openwritingkit-editor-font-size';

type EditorFontSize = "sm" | "base" | "lg";

export default function SettingsPage() {
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState<EditorFontSize>("base");
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    if (!user) return;
    
    const aiKey = `${AI_OPT_IN_KEY}-${user.uid}`;
    const fontKey = `${EDITOR_FONT_SIZE_KEY}-${user.uid}`;

    const storedAIPref = localStorage.getItem(aiKey);
    setAiFeaturesEnabled(storedAIPref === 'true');

    const storedFontSize = localStorage.getItem(fontKey) as EditorFontSize | null;
    if (storedFontSize && ["sm", "base", "lg"].includes(storedFontSize)) {
      setEditorFontSize(storedFontSize);
    }
  }, [user]);

  const handleAiToggle = (enabled: boolean) => {
    if (!user) return;
    const key = `${AI_OPT_IN_KEY}-${user.uid}`;
    setAiFeaturesEnabled(enabled);
    if (isMounted) {
      localStorage.setItem(key, enabled ? 'true' : 'false');
    }
  };

  const handleEditorFontSizeChange = (value: string) => {
    if (!user) return;
    const key = `${EDITOR_FONT_SIZE_KEY}-${user.uid}`;
    const newSize = value as EditorFontSize;
    setEditorFontSize(newSize);
    if (isMounted) {
      localStorage.setItem(key, newSize);
      window.dispatchEvent(new CustomEvent('editorSettingsChanged', { detail: { fontSize: newSize } }));
    }
  };
  
  const handlePasswordReset = async () => {
    if (!user || !user.email) {
      toast({
        title: "Error",
        description: "You must be logged in with a valid email to reset your password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Password Reset Email Sent",
        description: `An email has been sent to ${user.email} with instructions to reset your password.`,
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Error Sending Reset Email",
        description: "Could not send the password reset email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (!isMounted) {
    return null; // Avoid hydration mismatch
  }
  
  if (!user) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You must be logged in to view settings.</p>
            </CardContent>
        </Card>
    )
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
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm">Logged in as: <strong>{user.email}</strong></p>
            <Button variant="outline" onClick={handlePasswordReset}>
              <Shield className="mr-2 h-4 w-4" /> Change Password
            </Button>
           <p className="text-xs text-muted-foreground mt-2">
             Clicking this will send a password reset link to your registered email address.
          </p>
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
            By enabling AI features, you agree that the text you submit for a specific AI function (e.g., "Get Writing Feedback," "Analyze Pacing," "Generate Prompt") will be sent to a third-party AI model for processing to provide that feature. OpenWritingKit does not store this submitted text on its servers or use it for training its own AI models. Your primary document content remains stored locally in your browser. You can disable AI features at any time.
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
          <Button disabled className="w-full md:w-auto">
            Connect to Cloud (Coming Soon)
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
