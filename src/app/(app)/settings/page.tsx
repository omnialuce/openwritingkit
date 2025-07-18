// src/app/(app)/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, Wand2, KeyRound, Type, Settings as SettingsIcon, AlertCircle, Info, Languages } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';
const EDITOR_FONT_SIZE_KEY = 'openwritingkit-editor-font-size';
type EditorFontSize = "sm" | "base" | "lg";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

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
      title: t('settings.toast.ai_updated_title'),
      description: checked ? t('settings.toast.ai_enabled_desc') : t('settings.toast.ai_disabled_desc'),
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
        title: t('common.error'),
        description: t('settings.toast.must_be_logged_in'),
        variant: "destructive",
      });
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: t('settings.toast.password_reset_sent_title'),
        description: `${t('settings.toast.password_reset_sent_desc')} ${user.email}.`,
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: t('settings.toast.password_reset_error_title'),
        description: t('settings.toast.password_reset_error_desc'),
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
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">{t('settings.description')}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Appearance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5"/> {t('settings.appearance.title')}</CardTitle>
            <CardDescription>{t('settings.appearance.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-switcher">{t('settings.appearance.theme')}</Label>
              <div className="flex items-center gap-2">
                <Button variant={theme === 'light' ? 'default' : 'ghost'} size="icon" onClick={() => setTheme('light')}>
                  <Sun className="h-5 w-5" />
                </Button>
                <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="icon" onClick={() => setTheme('dark')}>
                  <Moon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="language-switcher">{t('settings.appearance.language')}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language-switcher" className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português (Brasil)</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Editor Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5"/> {t('settings.editor.title')}</CardTitle>
            <CardDescription>{t('settings.editor.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Label>{t('settings.editor.font_size')}</Label>
            <RadioGroup 
              value={editorFontSize} 
              onValueChange={handleFontSizeChange} 
              className="flex items-center gap-4 mt-2"
            >
              <Label htmlFor="font-sm" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="sm" id="font-sm" />
                {t('settings.editor.font_size_small')}
              </Label>
              <Label htmlFor="font-base" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="base" id="font-base" />
                {t('settings.editor.font_size_medium')}
              </Label>
              <Label htmlFor="font-lg" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="lg" id="font-lg" />
                {t('settings.editor.font_size_large')}
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>


        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> {t('settings.security.title')}</CardTitle>
            <CardDescription>{t('settings.security.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleChangePassword} className="w-full">
              {t('settings.security.change_password_button')}
            </Button>
             <p className="text-xs text-muted-foreground mt-2">
              {t('settings.security.change_password_desc')}
            </p>
          </CardContent>
        </Card>

      </div>
      
      {/* AI Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5"/> {t('settings.ai.title')}</CardTitle>
          <CardDescription>{t('settings.ai.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4 p-4 border bg-background rounded-lg">
            <Switch
              id="ai-features"
              checked={aiFeaturesEnabled}
              onCheckedChange={handleAiOptInChange}
              aria-label={t('settings.ai.toggle_label')}
            />
            <div className="flex-1">
              <Label htmlFor="ai-features" className="text-base font-medium">
                {t('settings.ai.enable_label')}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t('settings.ai.enable_desc')}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 border-l-4 border-destructive bg-destructive/10 rounded-r-lg">
            <div className="flex items-center gap-2">
               <AlertCircle className="h-5 w-5 text-destructive" />
               <h4 className="font-semibold text-destructive">{t('settings.ai.privacy_title')}</h4>
            </div>
            <p className="text-sm text-destructive/90 mt-2">
              {t('settings.ai.privacy_desc')}
            </p>
          </div>
           <div className="mt-4 p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
            <div className="flex items-center gap-2">
               <Info className="h-5 w-5 text-primary" />
               <h4 className="font-semibold text-primary">{t('settings.ai.transparency_title')}</h4>
            </div>
            <p className="text-sm text-primary/90 mt-2">
              {t('settings.ai.transparency_desc')}
            </p>
             <Link href="https://policies.google.com/privacy" passHref target="_blank" rel="noopener noreferrer">
              <Button variant="link" className="p-0 h-auto mt-2 text-sm">{t('settings.ai.google_policy_link')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
