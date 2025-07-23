
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
import { jsPDF } from "jspdf";
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateTimelineDocx, generateTemplateDocx } from '@/lib/docx-generator';
import { toPng } from 'html-to-image';
import type { PlotTemplate } from '@/lib/plot-templates';
import type { TimelineEvent } from '@/app/(app)/plot-tools/page';


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
      textContent = `${t(templateInfo.titleKey as any)}\n${'='.repeat(20)}\n\n`;
      templateInfo.structure.forEach((section) => {
        textContent += `${t(section.titleKey as any)}\n`;
        textContent += `${'-'.repeat(20)}\n`;
        section.steps.forEach((step) => {
          textContent += `${t(step.titleKey as any)}:\n`;
          textContent += `${data[step.id] || t('plot_tools.export.no_content')}\n\n`;
        });
        textContent += '\n';
      });
    }

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${type}_export.txt`);
  };

  const handleExportPdf = async () => {
    const element = document.getElementById(contentId);
    if (!element) return;
    
    // Use html-to-image to capture the element as a PNG
    const dataUrl = await toPng(element, { 
      backgroundColor: 'white', 
      pixelRatio: 2,
      style: {
        fontSize: '14px',
      }
    });

    const pdf = new jsPDF('p', 'px', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      const ratio = imgWidth / imgHeight;
      let finalImgWidth = pdfWidth;
      let finalImgHeight = pdfWidth / ratio;
      
      if(finalImgHeight > pdfHeight) {
          finalImgHeight = pdfHeight;
          finalImgWidth = pdfHeight * ratio;
      }

      pdf.addImage(dataUrl, 'PNG', 0, 0, finalImgWidth, finalImgHeight);
      pdf.save(`${type}_export.pdf`);
    };
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
        <Button variant="outline"><Download className="mr-2 h-5 w-5" /> {t('plot_tools.export_button')}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportTxt}>{t('plot_tools.export.as_txt')}</DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPdf}>{t('plot_tools.export.as_pdf')}</DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportDocx}>{t('plot_tools.export.as_docx')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
