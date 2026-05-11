'use client';

import { PromptGeneratorCard } from '@/components/ai/PromptGeneratorCard';
import { PacingAnalyzerCard } from '@/components/ai/PacingAnalyzerCard';
import { useLanguage } from '@/contexts/LanguageContext';

export default function WritingToolsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('writing_tools.title')}</h1>
        <p className="text-muted-foreground">{t('writing_tools.description')}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <PromptGeneratorCard />
        <PacingAnalyzerCard />
      </div>
    </div>
  );
}
