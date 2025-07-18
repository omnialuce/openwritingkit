// src/app/(app)/resources/page.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Newspaper, Mic, ExternalLink, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

type ResourceType = 'Article' | 'Podcast' | 'Tool' | 'Guide';

interface Resource {
  titleKey: string;
  descriptionKey: string;
  href: string;
  type: ResourceType;
  icon: React.ElementType;
}

const resources: Resource[] = [
  {
    titleKey: "resources.list.nanowrimo.title",
    descriptionKey: "resources.list.nanowrimo.description",
    href: "https://nanowrimo.org/",
    type: "Guide",
    icon: BookOpen,
  },
  {
    titleKey: "resources.list.reedsy.title",
    descriptionKey: "resources.list.reedsy.description",
    href: "https://blog.reedsy.com/",
    type: "Article",
    icon: Newspaper,
  },
  {
    titleKey: "resources.list.writing_excuses.title",
    descriptionKey: "resources.list.writing_excuses.description",
    href: "https://writingexcuses.com/",
    type: "Podcast",
    icon: Mic,
  },
  {
    titleKey: "resources.list.creative_penn.title",
    descriptionKey: "resources.list.creative_penn.description",
    href: "https://www.thecreativepenn.com/",
    type: "Article",
    icon: Newspaper,
  },
  {
    titleKey: "resources.list.helping_writers.title",
    descriptionKey: "resources.list.helping_writers.description",
    href: "https://www.helpingwritersbecomeauthors.com/",
    type: "Guide",
    icon: Lightbulb,
  },
  {
    titleKey: "resources.list.one_stop.title",
    descriptionKey: "resources.list.one_stop.description",
    href: "https://onestopforwriters.com/",
    type: "Tool",
    icon: BookOpen,
  },
];

export default function ResourcesPage() {
  const { t } = useLanguage();
  
  const getResourceTypeTranslation = (type: ResourceType) => {
    switch (type) {
        case 'Article': return t('resources.types.article');
        case 'Podcast': return t('resources.types.podcast');
        case 'Tool': return t('resources.types.tool');
        case 'Guide': return t('resources.types.guide');
        default: return type;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          {t('resources.title')}
        </h1>
        <p className="text-muted-foreground">{t('resources.description')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map(resource => (
          <Card key={resource.titleKey} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <resource.icon className="h-8 w-8 text-primary" />
                <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{getResourceTypeTranslation(resource.type)}</span>
              </div>
              <CardTitle>{t(resource.titleKey as any)}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{t(resource.descriptionKey as any)}</CardDescription>
            </CardContent>
            <CardContent>
              <Link href={resource.href} target="_blank" rel="noopener noreferrer" passHref>
                <Button variant="outline" className="w-full">
                  {t('resources.visit_site')} <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('resources.suggestion_box.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('resources.suggestion_box.description')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
