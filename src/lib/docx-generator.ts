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

    interface RunFmt { bold?: boolean; italics?: boolean; underline?: {}; strike?: boolean; }

    const processNode = (node: ChildNode, fmt: RunFmt = {}): TextRun[] => {
        if (node.nodeType === 3) {
            const text = node.textContent ?? '';
            return text ? [new TextRun({ text, ...fmt })] : [];
        }
        if (node.nodeType !== 1) return [];
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const childFmt: RunFmt = { ...fmt };
        if (tag === 'strong' || tag === 'b' || el.style.fontWeight === 'bold') childFmt.bold = true;
        if (tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic') childFmt.italics = true;
        if (tag === 'u') childFmt.underline = {};
        if (tag === 's' || tag === 'strike') childFmt.strike = true;
        return Array.from(el.childNodes).flatMap(c => processNode(c, childFmt));
    };

    nodes.forEach(node => {
        if (node.nodeType !== 1) return;
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        const children = Array.from(element.childNodes).flatMap(c => processNode(c));

        let headingLevel: string | undefined;
        if (tagName === 'h1') headingLevel = HeadingLevel.HEADING_1;
        else if (tagName === 'h2') headingLevel = HeadingLevel.HEADING_2;
        else if (tagName === 'h3') headingLevel = HeadingLevel.HEADING_3;

        let alignment: string | undefined;
        if (element.style.textAlign === 'center') alignment = AlignmentType.CENTER;
        else if (element.style.textAlign === 'right') alignment = AlignmentType.RIGHT;
        else if (element.style.textAlign === 'justify') alignment = AlignmentType.JUSTIFIED;

        if (children.length > 0) {
            paragraphs.push(new Paragraph({
                children,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                heading: headingLevel as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                alignment: alignment as any,
                spacing: { after: 100 },
            }));
        } else if (tagName === 'br') {
            paragraphs.push(new Paragraph({}));
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
