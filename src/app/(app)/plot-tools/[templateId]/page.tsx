
// src/app/(app)/plot-tools/[templateId]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStoryContext, getPlotTemplateDataKey } from '@/contexts/StoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, BookCopy, Loader2, Save } from 'lucide-react';
import { storage } from '@/lib/storage';
import { fullPlotTemplates, type PlotTemplate } from '@/lib/plot-templates';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ExportButton } from '@/components/plot-tools/ExportButton';

export default function PlotTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { activeStoryId } = useStoryContext();
  const { t } = useLanguage();
  const { toast } = useToast();

  const templateId = params.templateId as string;
  const templateInfo = fullPlotTemplates[templateId];

  const [templateData, setTemplateData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const storageKey = getPlotTemplateDataKey(activeStoryId, templateId, user?.uid);

  useEffect(() => {
    if (storageKey) {
      storage.getItem<Record<string, string>>(storageKey).then(data => {
        if (data) {
          setTemplateData(data);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [storageKey]);

  const handleDataChange = (stepId: string, value: string) => {
    setTemplateData(prev => ({ ...prev, [stepId]: value }));
  };

  const handleSaveChanges = async () => {
    if (!storageKey) return;
    setIsSaving(true);
    try {
      await storage.setItem(storageKey, templateData);
      toast({ title: t('common.save'), description: t('plot_tools.toast.template_saved') });
    } catch (e) {
      toast({ title: t('common.error'), description: t('plot_tools.toast.template_error'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!templateInfo || templateInfo.structure.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('plot_tools.templates.not_found_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('plot_tools.templates.not_found_desc')}</p>
          <Button asChild variant="link" className="p-0 mt-2">
            <Link href="/plot-tools">{t('plot_tools.templates.back_button')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" id={`template-export-${templateId}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button asChild variant="ghost" className="mb-2 -ml-4">
             <Link href="/plot-tools"><ArrowLeft className="mr-2 h-4 w-4" />{t('plot_tools.templates.back_button')}</Link>
           </Button>
          <h1 className="text-4xl font-bold mb-1 flex items-center">
            <BookCopy className="mr-3 h-10 w-10 text-primary" /> {t(templateInfo.titleKey as any)}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {t(templateInfo.descriptionKey as any)}
          </p>
        </div>
        <div className="flex gap-2">
            <ExportButton contentId={`template-export-${templateId}`} type="template" data={templateData} templateInfo={templateInfo}/>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {t('common.save')}
            </Button>
        </div>
      </div>
      
      <div className="space-y-8">
        {templateInfo.structure.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle>{t(section.titleKey as any)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.steps.map(step => (
                <div key={step.id} className="space-y-2">
                  <Label htmlFor={step.id} className="text-lg font-semibold">{t(step.titleKey as any)}</Label>
                  <p className="text-sm text-muted-foreground">{t(step.descriptionKey as any)}</p>
                  <Textarea
                    id={step.id}
                    value={templateData[step.id] || ''}
                    onChange={(e) => handleDataChange(step.id, e.target.value)}
                    rows={5}
                    placeholder={t('plot_tools.templates.placeholder', { title: t(step.titleKey as any).toLowerCase() })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
