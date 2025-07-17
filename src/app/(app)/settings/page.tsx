// src/app/(app)/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Wand2, KeyRound, Type, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';
const EDITOR_FONT_SIZE_KEY = 'openwritingkit-editor-font-size';
type EditorFontSize = "sm" | "base" | "lg";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();

  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState<EditorFontSize>('base');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedAIPref = localStorage.getItem(AI_OPT_IN_KEY);
    setAiFeaturesEnabled(storedAIPref === 'true');
    
    const storedFontSize = localStorage.getItem(EDITOR_FONT_SIZE_KEY) as EditorFontSize | null;
    if (storedFontSize && ['sm', 'base', 'lg'].includes(storedFontSize)) {
      setEditorFontSize(storedFontSize);
    }
  }, []);

  const handleAiOptInChange = (checked: boolean) => {
    setAiFeaturesEnabled(checked);
    localStorage.setItem(AI_OPT_IN_KEY, String(checked));
    window.dispatchEvent(new StorageEvent('storage', { key: AI_OPT_IN_KEY, newValue: String(checked) }));
    toast({
      title: "AI Settings Updated",
      description: `AI features have been ${checked ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleFontSizeChange = (value: EditorFontSize) => {
    setEditorFontSize(value);
    localStorage.setItem(EDITOR_FONT_SIZE_KEY, value);
    window.dispatchEvent(new CustomEvent('editorSettingsChanged', { detail: { fontSize: value } }));
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) {
      toast({
        title: "Error",
        description: "You must be logged in to change your password.",
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
    return null; // Or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <SettingsIcon className="mr-3 h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your application preferences and account.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Appearance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5"/> Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-switcher">Theme</Label>
              <div className="flex items-center gap-2">
                <Button variant={theme === 'light' ? 'default' : 'ghost'} size="icon" onClick={() => setTheme('light')}>
                  <Sun className="h-5 w-5" />
                </Button>
                <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="icon" onClick={() => setTheme('dark')}>
                  <Moon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Editor Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5"/> Editor</CardTitle>
            <CardDescription>Adjust your writing environment.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label>Font Size</Label>
            <RadioGroup 
              value={editorFontSize} 
              onValueChange={handleFontSizeChange} 
              className="flex items-center gap-4 mt-2"
            >
              <Label htmlFor="font-sm" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="sm" id="font-sm" />
                Small
              </Label>
              <Label htmlFor="font-base" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="base" id="font-base" />
                Medium
              </Label>
              <Label htmlFor="font-lg" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="lg" id="font-lg" />
                Large
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>


        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> Security</CardTitle>
            <CardDescription>Manage your account security.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleChangePassword} className="w-full">
              Change Password
            </Button>
             <p className="text-xs text-muted-foreground mt-2">
              This will send a password reset link to your registered email address.
            </p>
          </CardContent>
        </Card>

      </div>
      
      {/* AI Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5"/> AI Features</CardTitle>
          <CardDescription>Enable or disable AI-powered writing assistance tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4 p-4 border bg-background rounded-lg">
            <Switch
              id="ai-features"
              checked={aiFeaturesEnabled}
              onCheckedChange={handleAiOptInChange}
              aria-label="Toggle AI Features"
            />
            <div className="flex-1">
              <Label htmlFor="ai-features" className="text-base font-medium">
                Enable AI Writing Assistant
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Allow the app to send selected text to third-party services (like Google's Gemini) for analysis and suggestions.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 border-l-4 border-destructive bg-destructive/10 rounded-r-lg">
            <div className="flex items-center gap-2">
               <AlertCircle className="h-5 w-5 text-destructive" />
               <h4 className="font-semibold text-destructive">Privacy Disclaimer</h4>
            </div>
            <p className="text-sm text-destructive/90 mt-2">
              By enabling AI features, you acknowledge that the text you submit for analysis (e.g., for pacing feedback or prompt generation) will be sent to external AI models for processing. OpenWritingKit does not store this text. You can disable this feature at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
