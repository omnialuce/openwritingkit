
// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Cloud, Brain, Palette as PaletteIcon, Type, User, Shield, AlertTriangle, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from '@/contexts/LocaleContext';

const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';
const EDITOR_FONT_SIZE_KEY = 'openwritingkit-editor-font-size';

type EditorFontSize = "sm" | "base" | "lg";

export default function SettingsPage() {
  const { t, setLocale, locale } = useLocale();
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
        <h1 className="text-3xl font-bold mb-2 flex items-center"><SettingsIcon className="mr-3 h-8 w-8 text-primary"/>{t('settings_title')}</h1>
        <p className="text-muted-foreground">{t('settings_description')}</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings_language_title')}</CardTitle>
          </div>
          <CardDescription>{t('settings_language_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={locale} onValueChange={setLocale}>
            <SelectTrigger id="language-select" className="w-full md:w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Português (Brasil)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PaletteIcon className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings_appearance_title')}</CardTitle>
          </div>
          <CardDescription>{t('settings_appearance_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme-select">{t('settings_theme_label')}</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme-select" className="w-full md:w-[200px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('theme_light')}</SelectItem>
                <SelectItem value="dark">{t('theme_dark')}</SelectItem>
                <SelectItem value="system">{t('theme_system')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings_editor_title')}</CardTitle>
          </div>
          <CardDescription>{t('settings_editor_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="editor-font-size-select">{t('settings_editor_font_size_label')}</Label>
            <Select value={editorFontSize} onValueChange={handleEditorFontSizeChange}>
              <SelectTrigger id="editor-font-size-select" className="w-full md:w-[200px]">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">{t('font_size_small')}</SelectItem>
                <SelectItem value="base">{t('font_size_medium')}</SelectItem>
                <SelectItem value="lg">{t('font_size_large')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {t('settings_editor_font_size_description')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings_ai_title')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings_ai_description')}
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
              {t('settings_ai_enable_label')}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('settings_ai_disclaimer')}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings_account_title')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings_account_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm"><strong>{t('email_label')}:</strong> user@example.com (Mock)</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => handlePlaceholderClick("Change Password")}>
              <Shield className="mr-2 h-4 w-4" /> {t('change_password_button')}
            </Button>
            <Button variant="destructive" onClick={() => handlePlaceholderClick("Delete Account")}>
              <AlertTriangle className="mr-2 h-4 w-4" /> {t('delete_account_button')}
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-2">
             {t('settings_account_disclaimer')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <CardTitle>{t('settings_cloud_title')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings_cloud_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('settings_cloud_connect_description')}
          </p>
          <Button disabled className="w-full md:w-auto" onClick={() => handlePlaceholderClick("Connect to Cloud")}>
            {t('connect_to_cloud_button')}
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
