// src/app/(app)/settings/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, SpellCheck2, KeyRound, Settings as SettingsIcon, AlertCircle, Info, Download, Upload, Loader2, Eye, EyeOff, MessageCircleQuestion, Cloud, CloudDownload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';
import { cloudSync } from '@/lib/cloud-sync';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout, changeUserEmail, changeUserPassword } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const importFormRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isCloudPushing, setIsCloudPushing] = useState(false);
  const [isCloudPulling, setIsCloudPulling] = useState(false);

  // State for security forms
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [currentPasswordForPassword, setCurrentPasswordForPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showCurrentPasswordForEmail, setShowCurrentPasswordForEmail] = useState(false);
  const [showCurrentPasswordForPassword, setShowCurrentPasswordForPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);


  useEffect(() => {
    setIsMounted(true);
    storage.getItem<string>(AI_OPT_IN_KEY).then(val => {
      setAiFeaturesEnabled(val === 'true');
    });
  }, []);
  
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail || !currentPasswordForEmail) return;
    setIsChangingEmail(true);

    const result = await changeUserEmail(currentPasswordForEmail, newEmail);

    if (result.success) {
      toast({ title: t('settings.toast.email_change_success_title'), description: result.message });
      await logout(); 
    } else {
      toast({ title: t('common.error'), description: result.message, variant: 'destructive' });
    }
    
    setNewEmail('');
    setCurrentPasswordForEmail('');
    setIsChangingEmail(false);
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword || !currentPasswordForPassword || newPassword !== confirmNewPassword) {
      if (newPassword !== confirmNewPassword) {
        toast({ title: t('common.error'), description: t('settings.toast.passwords_do_not_match'), variant: 'destructive' });
      }
      return;
    }
    setIsChangingPassword(true);

    const result = await changeUserPassword(currentPasswordForPassword, newPassword);

    if (result.success) {
        toast({ title: t('settings.toast.password_change_success_title'), description: result.message });
        await logout();
    } else {
        toast({ title: t('common.error'), description: result.message, variant: 'destructive' });
    }

    setCurrentPasswordForPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsChangingPassword(false);
  };


  const handleAiOptInChange = (checked: boolean) => {
    setAiFeaturesEnabled(checked);
    storage.setItem(AI_OPT_IN_KEY, String(checked));
    window.dispatchEvent(new StorageEvent('storage', { key: AI_OPT_IN_KEY, newValue: String(checked) }));
    toast({
      title: t('settings.toast.ai_updated_title'),
      description: checked ? t('settings.toast.ai_enabled_desc') : t('settings.toast.ai_disabled_desc'),
    });
  };
  
  const handleExportAllData = () => {
    if (!user) {
        toast({ title: t('settings.toast.data_export_error_title'), description: t('settings.toast.data_export_error_desc'), variant: "destructive" });
        return;
    }
    const backupData: { [key: string]: any } = {};
    const generalPrefix = 'openwritingkit-';


    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(generalPrefix))) {
            try {
                backupData[key] = JSON.parse(localStorage.getItem(key)!);
            } catch(e) {
                backupData[key] = localStorage.getItem(key);
            }
        }
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openwritingkit_backup_${user.email || 'user'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: t('settings.toast.data_export_success_title'), description: t('settings.toast.data_export_success_desc') });
  };
  
  const handlePushToCloud = async () => {
    if (!user) return;
    setIsCloudPushing(true);
    try {
      await cloudSync.pushAll(user.id);
      toast({ title: t('settings.cloud.push_success_title'), description: t('settings.cloud.push_success_desc') });
    } catch {
      toast({ title: t('common.error'), description: t('settings.cloud.push_error_desc'), variant: 'destructive' });
    } finally {
      setIsCloudPushing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!user) return;
    if (!confirm(t('settings.cloud.pull_confirm'))) return;
    setIsCloudPulling(true);
    try {
      await cloudSync.pullAll(user.id);
      toast({ title: t('settings.cloud.pull_success_title'), description: t('settings.cloud.pull_success_desc') });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast({ title: t('common.error'), description: t('settings.cloud.pull_error_desc'), variant: 'destructive' });
    } finally {
      setIsCloudPulling(false);
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({ title: t('settings.toast.data_import_no_file_title'), description: t('settings.toast.data_import_no_file_desc'), variant: "destructive" });
      return;
    }

    if (!confirm(t('settings.data_management.import_confirm'))) {
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const content = reader.result as string;
            if (!content) throw new Error("File content is empty.");
            const backupData = JSON.parse(content);

            // Clear all existing app data first
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                 if (key && key.startsWith('openwritingkit-')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            // Write imported data to localStorage
            for (const key in backupData) {
                if (Object.prototype.hasOwnProperty.call(backupData, key)) {
                   localStorage.setItem(key, typeof backupData[key] === 'string' ? backupData[key] : JSON.stringify(backupData[key]));
                }
            }

            // Push imported data to cloud so the next session restore pulls the
            // correct data instead of old cloud state overwriting the import.
            if (user) {
              try {
                await cloudSync.pushAll(user.id);
              } catch {
                // Non-fatal — local data is correct, cloud sync will catch up
              }
            }

            toast({ title: t('settings.toast.data_import_success_title'), description: t('settings.toast.data_import_success_desc') });
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Import error:", error);
            toast({ title: t('settings.toast.data_import_failed_title'), description: t('settings.toast.data_import_failed_desc'), variant: "destructive" });
        } finally {
             if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    reader.readAsText(file);
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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
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
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (GB)</SelectItem>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5"/> {t('settings.security.title')}</CardTitle>
            <CardDescription>{t('settings.security.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleChangeEmail} className="space-y-3">
              <Label htmlFor="new-email" className='font-semibold'>{t('settings.security.change_email_label')}</Label>
              <Input
                id="new-email"
                type="email"
                placeholder={t('settings.security.new_email_placeholder')}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={isChangingEmail}
                required
              />
              <div className="relative">
                <Input
                  id="current-password-email"
                  type={showCurrentPasswordForEmail ? "text" : "password"}
                  placeholder={t('settings.security.current_password_placeholder')}
                  value={currentPasswordForEmail}
                  onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  disabled={isChangingEmail}
                  required
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowCurrentPasswordForEmail(!showCurrentPasswordForEmail)}><span className="sr-only">Toggle password visibility</span>{showCurrentPasswordForEmail ? <EyeOff /> : <Eye />}</Button>
              </div>
              <Button type="submit" disabled={isChangingEmail || !newEmail || !currentPasswordForEmail} className="w-full">
                {isChangingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.security.change_email_button')}
              </Button>
            </form>
            <hr/>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <Label htmlFor="new-password" className='font-semibold'>{t('settings.security.change_password_label')}</Label>
               <div className="relative">
                <Input
                  id="current-password-password"
                  type={showCurrentPasswordForPassword ? "text" : "password"}
                  placeholder={t('settings.security.current_password_placeholder')}
                  value={currentPasswordForPassword}
                  onChange={(e) => setCurrentPasswordForPassword(e.target.value)}
                  disabled={isChangingPassword}
                  required
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowCurrentPasswordForPassword(!showCurrentPasswordForPassword)}><span className="sr-only">Toggle password visibility</span>{showCurrentPasswordForPassword ? <EyeOff /> : <Eye />}</Button>
              </div>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t('settings.security.new_password_placeholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  required
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowNewPassword(!showNewPassword)}><span className="sr-only">Toggle password visibility</span>{showNewPassword ? <EyeOff /> : <Eye />}</Button>
              </div>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmNewPassword ? "text" : "password"}
                  placeholder={t('settings.security.confirm_password_placeholder')}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  required
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}><span className="sr-only">Toggle password visibility</span>{showConfirmNewPassword ? <EyeOff /> : <Eye />}</Button>
              </div>
              <Button type="submit" disabled={isChangingPassword || !currentPasswordForPassword || !newPassword || !confirmNewPassword} className="w-full">
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.security.change_password_button')}
              </Button>
            </form>
             <a href="mailto:owk@omnialuce.tech?subject=OpenWritingKit%20Support%20Request" className="w-full">
                <Button variant="outline" className="w-full">
                  <MessageCircleQuestion className="mr-2 h-4 w-4" />
                  {t('settings.security.contact_support_button')}
                </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <Card id="data-management">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5"/>{t('settings.data_management.title')}</CardTitle>
            <CardDescription>{t('settings.data_management.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <Button onClick={handleExportAllData} disabled={!user}>
                    <Download className="mr-2 h-4 w-4" /> {t('settings.data_management.export_button')}
                </Button>
                <p className="text-xs text-muted-foreground">{t('settings.data_management.export_desc')}</p>
            </div>
            <div className="flex flex-col gap-2">
                 <form ref={importFormRef}>
                  <input
                      type="file"
                      id="import-file"
                      ref={fileInputRef}
                      onChange={handleImportFile}
                      accept=".json"
                      className="hidden"
                    />
                    <Label
                      htmlFor="import-file"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "cursor-pointer w-full justify-center",
                        !user && "opacity-50 pointer-events-none"
                      )}
                    >
                      <Upload className="mr-2 h-4 w-4" /> {t('settings.data_management.import_button')}
                    </Label>
                 </form>
                <p className="text-xs text-muted-foreground">{t('settings.data_management.import_desc')}</p>
            </div>
        </CardContent>
         <CardContent>
            <div className="mt-4 p-4 border-l-4 border-destructive bg-destructive/10 rounded-r-lg">
                <div className="flex items-center gap-2">
                   <AlertCircle className="h-5 w-5 text-destructive" />
                   <h4 className="font-semibold text-destructive">{t('settings.data_management.import_warning_title')}</h4>
                </div>
                <p className="text-sm text-destructive/90 mt-2">
                  {t('settings.data_management.import_warning_desc')}
                </p>
            </div>
        </CardContent>
      </Card>

      <Card id="cloud-storage">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Cloud className="h-5 w-5"/>{t('settings.cloud.title')}</CardTitle>
          <CardDescription>{t('settings.cloud.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Button onClick={handlePushToCloud} disabled={!user || isCloudPushing}>
              {isCloudPushing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cloud className="mr-2 h-4 w-4" />}
              {t('settings.cloud.push_button')}
            </Button>
            <p className="text-xs text-muted-foreground">{t('settings.cloud.push_desc')}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={handlePullFromCloud} disabled={!user || isCloudPulling}>
              {isCloudPulling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudDownload className="mr-2 h-4 w-4" />}
              {t('settings.cloud.pull_button')}
            </Button>
            <p className="text-xs text-muted-foreground">{t('settings.cloud.pull_desc')}</p>
          </div>
        </CardContent>
        <CardContent>
          <div className="mt-2 p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-primary">{t('settings.cloud.info_title')}</h4>
            </div>
            <p className="text-sm text-primary/90 mt-2">{t('settings.cloud.info_desc')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Grammar Checking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SpellCheck2 className="h-5 w-5"/> {t('settings.grammar.title')}</CardTitle>
          <CardDescription>{t('settings.grammar.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4 p-4 border bg-background rounded-lg">
            <Switch
              id="grammar-features"
              checked={aiFeaturesEnabled}
              onCheckedChange={handleAiOptInChange}
              aria-label={t('settings.grammar.toggle_label')}
            />
            <div className="flex-1">
              <Label htmlFor="grammar-features" className="text-base font-medium">
                {t('settings.grammar.enable_label')}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t('settings.grammar.enable_desc')}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-r-lg">
            <div className="flex items-center gap-2">
               <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
               <h4 className="font-semibold text-amber-700 dark:text-amber-300">{t('settings.grammar.privacy_title')}</h4>
            </div>
            <p className="text-sm text-amber-700/90 dark:text-amber-300/90 mt-2">
              {t('settings.grammar.privacy_desc')}
            </p>
          </div>

          <div className="mt-4 p-4 border-l-4 border-primary bg-primary/10 rounded-r-lg">
            <div className="flex items-center gap-2">
               <Info className="h-5 w-5 text-primary" />
               <h4 className="font-semibold text-primary">{t('settings.grammar.transparency_title')}</h4>
            </div>
            <p className="text-sm text-primary/90 mt-2">
              {t('settings.grammar.transparency_desc')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
