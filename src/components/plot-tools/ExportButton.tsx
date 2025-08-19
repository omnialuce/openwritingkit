// src/components/plot-tools/ExportButton.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from 'lucide-react';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateTimelineDocx, generateTemplateDocx } from '@/lib/docx-generator';
import type { PlotTemplate } from '@/lib/plot-templates';
import type { TimelineEvent } from '@/app/(app)/plot-tools/page';
import { TranslationKey } from '@/lib/i18n-keys';


interface ExportButtonProps {
  contentId: string;
  type: 'template' | 'timeline';
  data: any;
  templateInfo?: PlotTemplate;
}

export function ExportButton({ contentId, type, data, templateInfo }: ExportButtonProps) {
  const { t } = useLanguage();

  const handleExportTxt = () => {
    let textContent = '';
    if (type === 'timeline') {
      textContent = (data as TimelineEvent[]).map((event: TimelineEvent) => 
        `${t('plot_tools.export.event_title')}: ${event.title}\n` +
        `${t('plot_tools.export.event_datetime')}: ${event.dateTime || 'N/A'}\n` +
        `${t('plot_tools.export.event_description')}: ${event.description || t('plot_tools.export.no_description')}\n`
      ).join('\n---\n');
    } else if (type === 'template' && templateInfo) {
      textContent = `${t(templateInfo.titleKey as TranslationKey)}\n${'='.repeat(20)}\n\n`;
      templateInfo.structure.forEach((section) => {
        textContent += `${t(section.titleKey as TranslationKey)}\n`;
        textContent += `${'-'.repeat(20)}\n`;
        section.steps.forEach((step) => {
          textContent += `${t(step.titleKey as TranslationKey)}:\n`;
          textContent += `${data[step.id] || t('plot_tools.export.no_content')}\n\n`;
        });
        textContent += '\n';
      });
    }

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${type}_export.txt`);
  };

  const handleExportDocx = async () => {
    let doc;
    if (type === 'timeline') {
      doc = generateTimelineDocx(data, t);
    } else if (type === 'template' && templateInfo) {
      doc = generateTemplateDocx(data, templateInfo, t);
    } else {
      return;
    }

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${type}_export.docx`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline"><Download className="mr-2 h-5 w-5" /> {t('plot_tools.export.button_text')}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportTxt}>{t('plot_tools.export.as_txt')}</DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportDocx}>{t('plot_tools.export.as_docx')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
