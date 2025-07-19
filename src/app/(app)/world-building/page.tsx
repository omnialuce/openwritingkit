// src/app/(app)/world-building/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Globe, PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStoryContext, getWorldBuildingStorageKey } from '@/contexts/StoryContext';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Locale {
  id: string;
  name: string;
  description?: string;
}

export default function WorldBuildingPage() {
  const { t } = useLanguage();
  const { activeStoryId } = useStoryContext();
  const [locales, setLocales] = useState<Locale[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<Locale | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const storageKey = getWorldBuildingStorageKey(activeStoryId);
      const storedLocales = localStorage.getItem(storageKey);
      if (storedLocales) {
        setLocales(JSON.parse(storedLocales));
      } else {
        setLocales([]);
      }
    } else if (!activeStoryId) {
      setLocales([]);
    }
  }, [activeStoryId]);

  const saveLocales = (updatedLocales: Locale[]) => {
    if (typeof window !== 'undefined' && activeStoryId) {
      const storageKey = getWorldBuildingStorageKey(activeStoryId);
      setLocales(updatedLocales);
      localStorage.setItem(storageKey, JSON.stringify(updatedLocales));
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingLocale(null);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (locale: Locale) => {
    setEditingLocale(locale);
    setName(locale.name);
    setDescription(locale.description || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeStoryId) return;

    const newLocaleData = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    if (editingLocale) {
      const updatedLocales = locales.map(loc =>
        loc.id === editingLocale.id ? { ...loc, ...newLocaleData } : loc
      );
      saveLocales(updatedLocales);
    } else {
      const newLocaleWithId = { ...newLocaleData, id: Date.now().toString() };
      saveLocales([...locales, newLocaleWithId]);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteLocale = (id: string) => {
    const updatedLocales = locales.filter(loc => loc.id !== id);
    saveLocales(updatedLocales);
  };

  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('world_building.no_story.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('world_building.no_story.description_1')} <Link href="/stories" className="text-primary hover:underline">{t('world_building.no_story.description_2')}</Link> {t('world_building.no_story.description_3')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Globe className="mr-3 h-8 w-8 text-primary" /> {t('world_building.title')}
          </h1>
          <p className="text-muted-foreground">{t('world_building.description')}</p>
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-5 w-5" /> {t('world_building.create_button')}
        </Button>
      </div>

      {locales.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('world_building.no_locales')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locales.map(locale => (
            <Card key={locale.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{locale.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4">{locale.description || t('world_building.no_description')}</p>
              </CardContent>
              <CardContent className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(locale)} className="flex-1">
                    <Edit className="mr-2 h-4 w-4" /> {t('common.edit')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('world_building.delete_dialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('world_building.delete_dialog.description')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLocale(locale.id)}>
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <ScrollArea className="max-h-[80vh]">
            <div className="p-1 pr-3">
              <DialogHeader>
                <DialogTitle>{editingLocale ? t('world_building.edit_dialog.title') : t('world_building.create_dialog.title')}</DialogTitle>
                <DialogDescription>
                  {editingLocale ? t('world_building.edit_dialog.description') : t('world_building.create_dialog.description')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="locale-name" className="text-right">{t('world_building.fields.name')}</Label>
                  <Input id="locale-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="locale-description" className="text-right pt-2">{t('world_building.fields.description')}</Label>
                  <Textarea id="locale-description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" rows={5} placeholder={t('world_building.fields.description_placeholder')}/>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">{t('common.cancel')}</Button>
                  </DialogClose>
                  <Button type="submit">{editingLocale ? t('common.save') : t('world_building.create_button')}</Button>
                </DialogFooter>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
