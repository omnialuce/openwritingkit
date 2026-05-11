'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RefreshCw, User } from 'lucide-react';
import { generateName, NAME_CATEGORIES, CATEGORY_KEYS, type NameCategoryKey } from '@/lib/name-lists';
import { useLanguage } from '@/contexts/LanguageContext';

type NameType = 'full' | 'first' | 'last' | 'place';

export function NameGeneratorCard() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<NameCategoryKey>('fantasy');
  const [nameType, setNameType] = useState<NameType>('full');
  const [names, setNames] = useState<string[]>([]);

  const handleGenerate = () => {
    const batch = Array.from({ length: 8 }, (_, i) =>
      generateName(category, nameType, Date.now() + i * 7919)
    );
    // Deduplicate while preserving order
    setNames([...new Set(batch)]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          {t('name_gen.title')}
        </CardTitle>
        <CardDescription>{t('name_gen.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{t('name_gen.category_label')}</Label>
            <Select value={category} onValueChange={v => setCategory(v as NameCategoryKey)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_KEYS.map(k => (
                  <SelectItem key={k} value={k}>{NAME_CATEGORIES[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('name_gen.type_label')}</Label>
            <Select value={nameType} onValueChange={v => setNameType(v as NameType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">{t('name_gen.type_full')}</SelectItem>
                <SelectItem value="first">{t('name_gen.type_first')}</SelectItem>
                <SelectItem value="last">{t('name_gen.type_last')}</SelectItem>
                <SelectItem value="place">{t('name_gen.type_place')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleGenerate} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          {names.length > 0 ? t('name_gen.regenerate') : t('name_gen.generate')}
        </Button>

        {names.length > 0 && (
          <div className="rounded-md border divide-y">
            {names.map((name, i) => (
              <div key={i} className="px-3 py-2 text-sm font-medium hover:bg-muted/50 cursor-default select-all">
                {name}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">{t('name_gen.tip')}</p>
      </CardContent>
    </Card>
  );
}
