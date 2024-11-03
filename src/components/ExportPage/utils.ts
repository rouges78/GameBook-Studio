import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph as DocxParagraph, TextRun, AlignmentType, PageBreak } from 'docx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ExportData, ProcessedParagraph, Action, ExportOptions } from './types';

// Fixed margins for PDF (in mm)
const PDF_MARGINS = {
  left: 25,
  right: 25,
  top: 25,
  bottom: 25,
  action: 35  // Indentation for actions
};

// Fixed font sizes for PDF
const PDF_FONTS = {
  title: 16,    // Title of the book
  author: 14,   // Author name
  heading: 14,  // Page title
  content: 12,  // Main content and actions
  page: 10      // Page numbers
};

export const convertToPages = (paragraphs: ProcessedParagraph[]): ProcessedParagraph[] => {
  // First, create a mapping of paragraph IDs to page numbers
  const pageMapping = paragraphs.reduce((acc, p, index) => {
    acc[p.id] = index + 1; // Page numbers start at 1
    return acc;
  }, {} as { [key: number]: number });

  // Then convert paragraphs to pages and update action references
  return paragraphs.map((p, index) => ({
    ...p,
    pageNumber: index + 1,
    actions: p.actions.map((action: Action) => {
      // Only update actions that have a paragraph reference
      if (action['N.Par.'] && action['N.Par.'].trim() !== '') {
        const referencedPage = pageMapping[parseInt(action['N.Par.'])];
        return {
          ...action,
          text: action.text,
          'N.Par.': `vai a pagina n. ${referencedPage}`
        };
      }
      return action;
    })
  }));
};

export const shuffleParagraphs = (paragraphs: ProcessedParagraph[]): ProcessedParagraph[] => {
  // Keep first paragraph
  const firstParagraph = paragraphs[0];
  const remainingParagraphs = paragraphs.slice(1);
  
  // Shuffle remaining paragraphs
  for (let i = remainingParagraphs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remainingParagraphs[i], remainingParagraphs[j]] = [remainingParagraphs[j], remainingParagraphs[i]];
  }

  // Combine first paragraph with shuffled paragraphs
  const shuffled = [firstParagraph, ...remainingParagraphs];
  
  // Create a mapping of old IDs to new page numbers
  const pageMapping = shuffled.reduce((acc, p, index) => {
    acc[p.id] = index + 1; // Page numbers start at 1
    return acc;
  }, {} as { [key: number]: number });

  // Update page numbers and action references
  return shuffled.map((p, index) => ({
    ...p,
    pageNumber: index + 1,
    actions: p.actions.map((action: Action) => {
      // Only update actions that have a paragraph reference
      if (action['N.Par.'] && action['N.Par.'].trim() !== '') {
        const referencedPage = pageMapping[parseInt(action['N.Par.'])];
        return {
          ...action,
          text: action.text,
          'N.Par.': `vai a pagina n. ${referencedPage}`
        };
      }
      return action;
    })
  }));
};

export const exportToPDF = (data: ExportData, options: ExportOptions) => {
  const doc = new jsPDF({
    orientation: options.orientation,
    unit: 'mm',
    format: 'a4'
  });

  // Set default font size
  doc.setFontSize(PDF_FONTS.content);

  // Calculate usable width
  const pageWidth = doc.internal.pageSize.width;
  const usableWidth = pageWidth - PDF_MARGINS.left - PDF_MARGINS.right;
  const actionWidth = pageWidth - PDF_MARGINS.action - PDF_MARGINS.right;

  // Add title page
  if (options.includeMeta) {
    doc.setFontSize(PDF_FONTS.title);
    doc.text(data.title, pageWidth / 2, PDF_MARGINS.top, { align: 'center' });
    doc.setFontSize(PDF_FONTS.author);
    doc.text(`by ${data.author}`, pageWidth / 2, PDF_MARGINS.top + 10, { align: 'center' });
    
    // Add page number to title page
    doc.setFontSize(PDF_FONTS.page);
    doc.text('1', pageWidth - PDF_MARGINS.right, doc.internal.pageSize.height - PDF_MARGINS.bottom, { align: 'right' });
  }

  let pageNumber = options.includeMeta ? 2 : 1;

  data.paragraphs.forEach((p: ProcessedParagraph) => {
    doc.addPage();

    // Title
    doc.setFontSize(PDF_FONTS.heading);
    doc.text(p.title, PDF_MARGINS.left, PDF_MARGINS.top);

    // Content
    doc.setFontSize(PDF_FONTS.content);
    let y = PDF_MARGINS.top + 10;

    // Split content into lines that fit within margins
    const contentLines = doc.splitTextToSize(p.content, usableWidth);
    contentLines.forEach((line: string) => {
      // Check if we need a new page
      if (y > doc.internal.pageSize.height - PDF_MARGINS.bottom - 20) {
        doc.addPage();
        pageNumber++;
        y = PDF_MARGINS.top;
        // Add page number to new page
        doc.setFontSize(PDF_FONTS.page);
        doc.text(pageNumber.toString(), pageWidth - PDF_MARGINS.right, doc.internal.pageSize.height - PDF_MARGINS.bottom, { align: 'right' });
        doc.setFontSize(PDF_FONTS.content);
      }
      doc.text(line, PDF_MARGINS.left, y);
      y += 7;
    });

    // Add some space before actions
    y += 5;

    // Actions - using same font size as content
    p.actions.forEach((action: Action) => {
      // Check if we need a new page
      if (y > doc.internal.pageSize.height - PDF_MARGINS.bottom - 20) {
        doc.addPage();
        pageNumber++;
        y = PDF_MARGINS.top;
        // Add page number to new page
        doc.setFontSize(PDF_FONTS.page);
        doc.text(pageNumber.toString(), pageWidth - PDF_MARGINS.right, doc.internal.pageSize.height - PDF_MARGINS.bottom, { align: 'right' });
        doc.setFontSize(PDF_FONTS.content);
      }

      // Format action text to fit within margins
      const actionText = `${action.text} - ${action['N.Par.']}`;
      const actionLines = doc.splitTextToSize(actionText, actionWidth);
      
      actionLines.forEach((line: string) => {
        doc.text(line, PDF_MARGINS.action, y);
        y += 7;
      });
    });

    // Add page number to current page if not already added
    doc.setFontSize(PDF_FONTS.page);
    doc.text(pageNumber.toString(), pageWidth - PDF_MARGINS.right, doc.internal.pageSize.height - PDF_MARGINS.bottom, { align: 'right' });
    pageNumber++;
  });

  doc.save(`${data.title}.pdf`);
};

export const exportToHTML = (data: ExportData, options: ExportOptions) => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.title}</title>
      <style>
        body { 
          font-family: ${options.fontFamily}; 
          font-size: ${options.fontSize}px; 
          line-height: ${options.lineSpacing}; 
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .page { 
          position: relative;
          margin-bottom: 2em;
          padding: 2em;
          border: 1px solid #ccc;
          page-break-after: always;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .actions { 
          margin-left: 2em;
          margin-top: 1em;
        }
        .action {
          margin: 0.5em 0;
          padding-left: 2em;
        }
      </style>
    </head>
    <body>
      ${options.includeMeta ? `
        <h1 style="text-align: center;">${data.title}</h1>
        <h2 style="text-align: center;">by ${data.author}</h2>
      ` : ''}
  `;

  data.paragraphs.forEach((p: ProcessedParagraph) => {
    html += `
      <div class="page">
        <h3>${p.title}</h3>
        <p>${p.content}</p>
        <div class="actions">
          ${p.actions.map(a => `<p class="action">${a.text} - ${a['N.Par.']}</p>`).join('')}
        </div>
      </div>
    `;
  });

  html += '</body></html>';

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${data.title}.html`);
};

export const exportToJSON = (data: ExportData) => {
  const jsonData = {
    ...data,
    totalPages: data.paragraphs.length + (data.includeMeta ? 1 : 0)
  };
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  saveAs(blob, `${data.title}.json`);
};

export const exportToDOCX = (data: ExportData, options: ExportOptions) => {
  let pageNumber = 1;
  const children = [];

  if (options.includeMeta) {
    children.push(
      new DocxParagraph({
        children: [new TextRun({ text: data.title, bold: true, size: 32 })],
        alignment: AlignmentType.CENTER
      }),
      new DocxParagraph({
        children: [new TextRun({ text: `by ${data.author}`, size: 24 })],
        alignment: AlignmentType.CENTER
      }),
      new DocxParagraph({
        children: [new TextRun({ text: pageNumber.toString(), bold: true })],
        alignment: AlignmentType.RIGHT
      }),
      new DocxParagraph({
        children: [new PageBreak()]
      })
    );
    pageNumber++;
  }

  data.paragraphs.forEach((p: ProcessedParagraph) => {
    children.push(
      new DocxParagraph({
        children: [new TextRun({ text: p.title, bold: true, size: 28 })]
      }),
      new DocxParagraph({
        children: [new TextRun({ text: p.content })]
      }),
      ...p.actions.map(a => new DocxParagraph({
        children: [new TextRun({ text: `${a.text} - ${a['N.Par.']}` })],
        indent: { left: 720 } // 720 twips = 0.5 inch
      })),
      new DocxParagraph({
        children: [new TextRun({ text: pageNumber.toString(), bold: true })],
        alignment: AlignmentType.RIGHT
      }),
      new DocxParagraph({
        children: [new PageBreak()]
      })
    );
    pageNumber++;
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `${data.title}.docx`);
  });
};

export const exportToTXT = (data: ExportData, options: ExportOptions) => {
  let txt = options.includeMeta ? `${data.title}\nby ${data.author}\n\n` : '';

  data.paragraphs.forEach((p: ProcessedParagraph) => {
    txt += `\n\n${p.title}\n\n${p.content}\n\n`;
    p.actions.forEach(a => {
      txt += `    ${a.text} - ${a['N.Par.']}\n`;
    });
    txt += '\n==========\n'; // Page separator
  });

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${data.title}.txt`);
};

export const exportToXLSX = (data: ExportData) => {
  const ws = XLSX.utils.json_to_sheet(
    data.paragraphs.map((p: ProcessedParagraph) => ({
      Title: p.title,
      Content: p.content,
      Actions: p.actions.map(a => `${a.text} - ${a['N.Par.']}`).join('\n')
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pages');
  XLSX.writeFile(wb, `${data.title}.xlsx`);
};
