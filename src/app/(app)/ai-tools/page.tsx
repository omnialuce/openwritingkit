// src/app/(app)/ai-tools/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PromptGeneratorCard } from '@/components/ai/PromptGeneratorCard';
import { PacingAnalyzerCard } from '@/components/ai/PacingAnalyzerCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Users, Settings, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AI_OPT_IN_KEY = 'openwritingkit-ai-opt-in';

export default function AiToolsPage() {
  const { t } = useLanguage();
  const [aiFeaturesEnabled, setAiFeaturesEnabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedPreference = localStorage.getItem(AI_OPT_IN_KEY);
    setAiFeaturesEnabled(storedPreference === 'true');

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AI_OPT_IN_KEY) {
        setAiFeaturesEnabled(event.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const comingSoonTools = [
    { title: t('ai_tools.coming_soon.plot_hole_detector_title'), description: t('ai_tools.coming_soon.plot_hole_detector_desc'), icon: Lightbulb },
    { title: t('ai_tools.coming_soon.character_voice_consistency_title'), description: t('ai_tools.coming_soon.character_voice_consistency_desc'), icon: Users },
  ];

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t('ai_tools.loading_preferences')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('ai_tools.title')}</h1>
        <p className="text-muted-foreground">{t('ai_tools.description')}</p>
      </div>

      {!aiFeaturesEnabled ? (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <CardTitle className="text-xl text-destructive">{t('ai_tools.disabled.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {t('ai_tools.disabled.description')}
            </p>
            <Link href="/settings" passHref>
              <Button variant="secondary">
                <Settings className="mr-2 h-4 w-4" /> {t('ai_tools.disabled.go_to_settings')}
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              {t('ai_tools.disabled.disclaimer')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            <PromptGeneratorCard />
            <PacingAnalyzerCard />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mt-12 mb-6">{t('ai_tools.coming_soon.title')}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comingSoonTools.map((tool) => (
                <Card key={tool.title} className="opacity-70">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <tool.icon className="h-8 w-8 text-muted-foreground" />
                      <CardTitle className="text-xl text-muted-foreground">{tool.title}</CardTitle>
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-primary font-semibold">{t('common.coming_soon')}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
