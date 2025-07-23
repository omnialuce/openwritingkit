// src/lib/docx-generator.ts

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export function generateTimelineDocx(timelineEvents: any[], t: (key: string) => string): Document {
  const children = [
    new Paragraph({
      text: t('plot_tools.timeline.title'),
      heading: HeadingLevel.TITLE,
    }),
  ];

  timelineEvents.forEach(event => {
    children.push(
      new Paragraph({
        text: event.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );
    if (event.dateTime) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${t('plot_tools.export.event_datetime')}: `, bold: true }),
            new TextRun(event.dateTime),
          ],
        })
      );
    }
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${t('plot_tools.export.event_description')}: `, bold: true }),
          new TextRun(event.description || t('plot_tools.export.no_description')),
        ],
        spacing: { after: 200 }
      })
    );
  });

  return new Document({
    sections: [{ children }],
  });
}

export function generateTemplateDocx(templateData: any, templateInfo: any, t: (key: string) => string): Document {
    const children = [
        new Paragraph({
            text: t(templateInfo.titleKey),
            heading: HeadingLevel.TITLE,
        }),
    ];

    templateInfo.structure.forEach((section: any) => {
        children.push(
            new Paragraph({
                text: t(section.titleKey),
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            })
        );
        section.steps.forEach((step: any) => {
            children.push(
                new Paragraph({
                    text: t(step.titleKey),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                })
            );
            children.push(
                new Paragraph({
                    text: templateData[step.id] || t('plot_tools.export.no_content'),
                    spacing: { after: 200 }
                })
            );
        });
    });

    return new Document({
        sections: [{ children }],
    });
}
