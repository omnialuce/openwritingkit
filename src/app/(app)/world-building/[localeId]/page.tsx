
// src/app/(app)/world-building/[localeId]/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Globe, Save, Loader2, AlertTriangle, Download, Info } from 'lucide-react';
import { useStoryContext, getWorldBuildingStorageKey, getLocaleSheetStorageKey, type Locale } from '@/contexts/StoryContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/storage';

const localeSheetSections = {
  // Based on https://www.storyplanner.com/story/plan/world-building-detailed-plan
  overview: 'world_building_sheet.sections.overview',
  geography: 'world_building_sheet.sections.geography',
  ecosystem: 'world_building_sheet.sections.ecosystem',
  locations: 'world_building_sheet.sections.locations',
  society: 'world_building_sheet.sections.society',
  culture: 'world_building_sheet.sections.culture',
  economy: 'world_building_sheet.sections.economy',
  technology: 'world_building_sheet.sections.technology',
  magic: 'world_building_sheet.sections.magic',
  history: 'world_building_sheet.sections.history',
};

const getLocaleSheetFields = (t: (key: any) => string) => ({
  overview: [
    { id: 'name', label: t('world_building_sheet.fields.name'), type: 'display' },
    { id: 'summary', label: t('world_building_sheet.fields.summary') },
    { id: 'inspiration', label: t('world_building_sheet.fields.inspiration') },
  ],
  geography: [
    { id: 'terrain', label: t('world_building_sheet.fields.terrain') },
    { id: 'climate', label: t('world_building_sheet.fields.climate') },
    { id: 'bodiesOfWater', label: t('world_building_sheet.fields.bodies_of_water') },
    { id: 'naturalResources', label: t('world_building_sheet.fields.natural_resources') },
  ],
  ecosystem: [
    { id: 'flora', label: t('world_building_sheet.fields.flora') },
    { id: 'fauna', label: t('world_building_sheet.fields.fauna') },
    { id: 'naturalLaws', label: t('world_building_sheet.fields.natural_laws') },
  ],
  locations: [
    { id: 'continents', label: t('world_building_sheet.fields.continents') },
    { id: 'countries', label: t('world_building_sheet.fields.countries') },
    { id: 'cities', label: t('world_building_sheet.fields.cities') },
    { id: 'landmarks', label: t('world_building_sheet.fields.landmarks') },
  ],
  society: [
    { id: 'inhabitants', label: t('world_building_sheet.fields.inhabitants') },
    { id: 'government', label: t('world_building_sheet.fields.government') },
    { id: 'socialStructure', label: t('world_building_sheet.fields.social_structure') },
    { id: 'laws', label: t('world_building_sheet.fields.laws') },
    { id: 'military', label: t('world_building_sheet.fields.military') },
  ],
  culture: [
    { id: 'language', label: t('world_building_sheet.fields.language') },
    { id: 'religion', label: t('world_building_sheet.fields.religion') },
    { id: 'education', label: t('world_building_sheet.fields.education') },
    { id: 'traditions', label: t('world_building_sheet.fields.traditions') },
    { id: 'art', label: t('world_building_sheet.fields.art') },
    { id: 'entertainment', label: t('world_building_sheet.fields.entertainment') },
    { id: 'food', label: t('world_building_sheet.fields.food') },
  ],
  economy: [
    { id: 'currency', label: t('world_building_sheet.fields.currency') },
    { id: 'trade', label: t('world_building_sheet.fields.trade') },
    { id: 'industries', label: t('world_building_sheet.fields.industries') },
  ],
  technology: [
    { id: 'techLevel', label: t('world_building_sheet.fields.tech_level') },
    { id: 'innovations', label: t('world_building_sheet.fields.innovations') },
    { id: 'transportation', label: t('world_building_sheet.fields.transportation') },
    { id: 'communication', label: t('world_building_sheet.fields.communication') },
  ],
  magic: [
    { id: 'magicSystem', label: t('world_building_sheet.fields.magic_system') },
    { id: 'magicUsers', label: t('world_building_sheet.fields.magic_users') },
    { id: 'magicLimits', label: t('world_building_sheet.fields.magic_limits') },
  ],
  history: [
    { id: 'creationMyth', label: t('world_building_sheet.fields.creation_myth') },
    { id: 'historicalEvents', label: t('world_building_sheet.fields.historical_events') },
    { id: 'conflicts', label: t('world_building_sheet.fields.conflicts') },
    { id: 'legends', label: t('world_building_sheet.fields.legends') },
  ],
});


type SheetData = {
  [key: string]: string;
};

export default function LocaleSheetPage() {
  const { t } = useLanguage();
  const params = useParams();
  const localeId = params.localeId as string;
  const { user } = useAuth();
  const { activeStoryId } = useStoryContext();
  const { toast } = useToast();
  
  const [locale, setLocale] = useState<Locale | null>(null);
  const sheetStorageKey = useMemo(() => getLocaleSheetStorageKey(activeStoryId, localeId, user?.uid), [activeStoryId, localeId, user?.uid]);
  
  const [sheetData, setSheetData] = useState<SheetData>({});
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dynamicLocaleSheetFields = getLocaleSheetFields(t);

  const loadLocaleData = useCallback(async () => {
    if (typeof window !== 'undefined' && activeStoryId && user) {
      const storageKey = getWorldBuildingStorageKey(activeStoryId, user.uid);
      const storedLocales = await storage.getItem<Locale[]>(storageKey);
      if (storedLocales) {
          const foundLocale = storedLocales.find(c => c.id === localeId);
          setLocale(foundLocale || null);
      }
      
      const storedSheet = await storage.getItem<SheetData>(sheetStorageKey);
      if (storedSheet) {
          setSheetData(storedSheet);
      }
    }
    setIsMounted(true);
  }, [activeStoryId, localeId, user, sheetStorageKey]);


  useEffect(() => {
    loadLocaleData();
  }, [loadLocaleData]);


  const handleFieldChange = (fieldId: string, value: string) => {
    setSheetData(prev => ({ ...prev, [fieldId]: value }));
  };
  
  const handleSaveChanges = async () => {
    if (!sheetStorageKey) return;
    setIsLoading(true);
    try {
      await storage.setItem(sheetStorageKey, sheetData);
      toast({ title: t('common.save'), description: t('world_building_sheet.toast_save_success') });
    } catch(e) {
      console.error("Failed to save locale sheet:", e);
      toast({ title: t('common.error'), description: t('world_building_sheet.toast_save_error'), variant: 'destructive'});
    } finally {
      setIsLoading(false);
    }
  };


  const handleExportSheet = () => {
    if (!locale || !sheetData) return;

    let textContent = `${t('world_building_sheet.export.title_prefix')} ${locale.name}\n`;
    textContent += `${t('world_building_sheet.export.description')}: ${locale.description || t('world_building_sheet.export.not_applicable')}\n`;
    textContent += `${t('world_building_sheet.export.tags')}: ${locale.tags?.join(', ') || t('world_building_sheet.export.not_applicable')}\n`;
    textContent += `${'='.repeat(35)}\n\n`;

    Object.entries(dynamicLocaleSheetFields).forEach(([sectionKey, fields]) => {
      const sectionName = t(localeSheetSections[sectionKey as keyof typeof localeSheetSections]);
      textContent += `--- ${sectionName.toUpperCase()} ---\n\n`;
      fields.forEach(field => {
        if (field.type !== 'display') {
          textContent += `${field.label}:\n${sheetData[field.id] || t('world_building_sheet.export.not_applicable')}\n\n`;
        }
      });
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${locale.name}_world_sheet.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: t('world_building_sheet.export.toast_success_title'), description: t('world_building_sheet.export.toast_success_desc', {name: locale.name})});
  };


  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('world_building_sheet.loading')}</p>
      </div>
    );
  }

  if (!activeStoryId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('world_building_sheet.no_active_story_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('world_building_sheet.no_active_story_desc_1')} <Link href="/stories" className="text-primary hover:underline">{t('world_building_sheet.no_active_story_desc_2')}</Link> {t('world_building_sheet.no_active_story_desc_3')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!locale) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> {t('world_building_sheet.not_found_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t('world_building_sheet.not_found_desc')}</p>
           <Button asChild variant="outline">
             <Link href="/world-building"><ArrowLeft className="mr-2 h-4 w-4" />{t('world_building_sheet.back_to_locales')}</Link>
           </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <Button asChild variant="ghost" className="mb-2 -ml-4">
             <Link href="/world-building"><ArrowLeft className="mr-2 h-4 w-4" />{t('world_building_sheet.back_to_locales')}</Link>
           </Button>
          <h1 className="text-4xl font-bold mb-1 flex items-center">
            <Globe className="mr-3 h-10 w-10 text-primary" /> {t('world_building_sheet.title')}: {locale.name}
          </h1>
          <p className="text-muted-foreground">
            {t('world_building_sheet.save_notice')}
          </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSheet} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" /> {t('world_building_sheet.export_button')}
            </Button>
            <Button onClick={handleSaveChanges} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {t('common.save')}
            </Button>
        </div>
      </div>

       <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-primary">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="flex-grow">{t('world_building_sheet.template_citation')} <a href="https://www.storyplanner.com/story/plan/world-building-detailed-plan" target="_blank" rel="noopener noreferrer" className="font-semibold underline">StoryPlanner.com</a>.</p>
          </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={['overview']} className="w-full space-y-4">
        {Object.entries(dynamicLocaleSheetFields).map(([sectionKey, fields]) => (
          <AccordionItem key={sectionKey} value={sectionKey} className="border-b-0">
            <Card>
              <AccordionTrigger className="p-6 text-xl hover:no-underline">
                {t(localeSheetSections[sectionKey as keyof typeof localeSheetSections])}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-6 p-6 pt-0">
                  {fields.map(field => (
                    <div key={field.id} className="grid gap-2">
                      <Label htmlFor={field.id}>{field.label}</Label>
                      {field.type === 'display' ? (
                        <Input id={field.id} readOnly value={locale.name} className="bg-muted" />
                      ) : (
                        <Textarea
                          id={field.id}
                          value={sheetData[field.id] || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          rows={3}
                          placeholder={t('world_building_sheet.field_placeholder', { label: field.label.toLowerCase() })}
                          disabled={isLoading}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
