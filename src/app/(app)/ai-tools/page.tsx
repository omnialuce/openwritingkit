'use client';

import { PromptGeneratorCard } from '@/components/ai/PromptGeneratorCard';
import { PacingAnalyzerCard } from '@/components/ai/PacingAnalyzerCard';
import { HemingwayCard } from '@/components/writing-tools/HemingwayCard';
import { POVTenseCard } from '@/components/writing-tools/POVTenseCard';
import { ClicheDetectorCard } from '@/components/writing-tools/ClicheDetectorCard';
import { NameGeneratorCard } from '@/components/writing-tools/NameGeneratorCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Separator } from '@/components/ui/separator';

export default function WritingToolsPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('writing_tools.title')}</h1>
        <p className="text-muted-foreground">{t('writing_tools.description')}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('writing_tools.section_craft')}</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <HemingwayCard />
          <POVTenseCard />
          <ClicheDetectorCard />
          <PacingAnalyzerCard />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('writing_tools.section_creative')}</h2>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <PromptGeneratorCard />
          <NameGeneratorCard />
        </div>
      </section>
    </div>
  );
}
