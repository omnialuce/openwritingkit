// src/lib/docx-generator.ts

import { Document, Packer, Paragraph, TextRun, HeadingLevel, IStylesOptions, AlignmentType } from 'docx';

// This is a simplified html-to-docx converter. For more complex conversions, a more robust library would be needed.
// It currently handles paragraphs, headings (h1-h3), bold, italic, and underline.
function htmlToDocxChildren(htmlString: string): Paragraph[] {
    if (typeof DOMParser === 'undefined') {
        // We are in a node environment, likely during build time.
        // We can't parse HTML without a DOM. Return an empty paragraph.
        // The client-side export will work fine.
        return [new Paragraph("HTML content will be exported in the browser.")];
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    const paragraphs: Paragraph[] = [];

    const processNode = (node: ChildNode): TextRun[] => {
        const runs: TextRun[] = [];
        if (node.nodeType === 3) { // Text node
             runs.push(new TextRun(node.textContent || ''));
        } else if (node.nodeType === 1) { // Element node
            const element = node as HTMLElement;
            const childrenRuns = Array.from(element.childNodes).flatMap(processNode);
            
            let isBold = false;
            let isItalic = false;
            let isUnderline = false;
            let isStrikethrough = false;

            const tagName = element.tagName.toLowerCase();
            if (tagName === 'strong' || tagName === 'b' || element.style.fontWeight === 'bold') {
                isBold = true;
            }
            if (tagName === 'em' || tagName === 'i' || element.style.fontStyle === 'italic') {
                isItalic = true;
            }
             if (tagName === 'u') {
                isUnderline = true;
            }
             if (tagName === 's' || tagName === 'strike') {
                isStrikethrough = true;
            }

            childrenRuns.forEach(run => {
                if (isBold) run.options.bold = true;
                if (isItalic) run.options.italics = true;
                if (isUnderline) run.options.underline = {};
                if (isStrikethrough) run.options.strike = true;
                runs.push(run);
            });
        }
        return runs;
    };
    
    nodes.forEach(node => {
        if (node.nodeType === 1) {
            const element = node as HTMLElement;
            const tagName = element.tagName.toLowerCase();
            const children = Array.from(element.childNodes).flatMap(processNode);
            
            let headingLevel: HeadingLevel | undefined = undefined;
            if (tagName === 'h1') headingLevel = HeadingLevel.HEADING_1;
            if (tagName === 'h2') headingLevel = HeadingLevel.HEADING_2;
            if (tagName === 'h3') headingLevel = HeadingLevel.HEADING_3;
            
            let alignment: AlignmentType | undefined = undefined;
            if(element.style.textAlign === 'center') alignment = AlignmentType.CENTER;
            if(element.style.textAlign === 'right') alignment = AlignmentType.RIGHT;
            if(element.style.textAlign === 'justify') alignment = AlignmentType.JUSTIFIED;

            if (children.length > 0) {
                 paragraphs.push(new Paragraph({
                    children,
                    heading: headingLevel,
                    alignment: alignment,
                    spacing: { after: 100 }
                }));
            } else if (tagName === 'br') {
                 paragraphs.push(new Paragraph({}));
            }
        }
    });

    return paragraphs;
}


export function generateDocxFromHtml(htmlString: string): Document {
  const children = htmlToDocxChildren(htmlString);
  return new Document({
    sections: [{ children }],
  });
}

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
            text: t(templateInfo.titleKey as any),
            heading: HeadingLevel.TITLE,
        }),
    ];

    templateInfo.structure.forEach((section: any) => {
        children.push(
            new Paragraph({
                text: t(section.titleKey as any),
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
            })
        );
        section.steps.forEach((step: any) => {
            children.push(
                new Paragraph({
                    text: t(step.titleKey as any),
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
