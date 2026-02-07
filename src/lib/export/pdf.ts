import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Editor } from '@tiptap/react';

export interface ExportOptions {
  fileName?: string;
  format?: 'pdf' | 'html' | 'markdown' | 'text';
  includeMetadata?: boolean;
}

/**
 * Export document as PDF with proper text rendering
 */
export async function exportToPDF(
  editor: Editor,
  options: ExportOptions = {}
): Promise<void> {
  const {
    fileName = 'document.pdf',
    includeMetadata = true,
  } = options;

  try {
    // Get the editor content element
    const editorElement = editor.view.dom;

    if (!editorElement) {
      throw new Error('Editor element not found');
    }

    // Clone the element to avoid modifying the original
    const clone = editorElement.cloneNode(true) as HTMLElement;

    // Apply inline styles to ensure proper rendering
    clone.style.padding = '20px';
    clone.style.backgroundColor = '#ffffff';
    clone.style.color = '#000000';
    clone.style.fontSize = '14px';
    clone.style.lineHeight = '1.6';
    clone.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Force ALL text elements to black color for PDF
    const allElements = clone.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const tagName = htmlEl.tagName.toLowerCase();

      // Force black color on all text-containing elements
      if (['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'blockquote', 'code', 'pre', 'a', 'strong', 'em', 'u', 'mark'].includes(tagName)) {
        htmlEl.style.color = '#000000 !important';
        htmlEl.style.setProperty('color', '#000000', 'important');
      }

      // Remove all background colors except tables
      if (tagName !== 'table' && tagName !== 'th' && tagName !== 'td' && tagName !== 'mark') {
        htmlEl.style.backgroundColor = 'transparent';
      }

      // Handle highlights - keep background but ensure text is black
      if (tagName === 'mark') {
        htmlEl.style.color = '#000000 !important';
      }

      // Fix table styling
      if (tagName === 'table') {
        htmlEl.style.borderCollapse = 'collapse';
        htmlEl.style.width = '100%';
        htmlEl.style.border = '1px solid #000';
        htmlEl.style.backgroundColor = '#ffffff';
      }
      if (tagName === 'th' || tagName === 'td') {
        htmlEl.style.border = '1px solid #000';
        htmlEl.style.padding = '8px';
        htmlEl.style.color = '#000000 !important';
        htmlEl.style.backgroundColor = '#ffffff';
      }
    });

    // Temporarily append clone to document for rendering
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.width = '800px'; // Fixed width for consistent rendering
    document.body.appendChild(clone);

    // Create canvas from cloned content with enhanced settings
    const canvas = await html2canvas(clone, {
      scale: 3, // Even higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      foreignObjectRendering: false,
      imageTimeout: 0,
      removeContainer: false,
      allowTaint: true,
      width: 800,
    });

    // Remove clone from document
    document.body.removeChild(clone);

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add metadata if requested
    if (includeMetadata) {
      pdf.setProperties({
        title: fileName.replace('.pdf', ''),
        subject: 'SyncState Document',
        author: 'SyncState',
        creator: 'SyncState Collaborative Editor',
      });
    }

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

/**
 * Export document as HTML
 */
export function exportToHTML(
  editor: Editor,
  options: ExportOptions = {}
): void {
  const {
    fileName = 'document.html',
  } = options;

  try {
    const html = editor.getHTML();

    // Create complete HTML document
    const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName.replace('.html', '')}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    p {
      margin-bottom: 1em;
    }
    a {
      color: #0ea5e9;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    code {
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f5f5f5;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    blockquote {
      border-left: 3px solid #0ea5e9;
      padding-left: 1em;
      margin-left: 0;
      color: #666;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to HTML:', error);
    throw error;
  }
}

/**
 * Export document as Markdown
 */
export function exportToMarkdown(
  editor: Editor,
  options: ExportOptions = {}
): void {
  const {
    fileName = 'document.md',
  } = options;

  try {
    // Get the JSON content
    const json = editor.getJSON();

    // Convert to markdown (simplified version)
    let markdown = '';

    function processNode(node: any, level = 0): void {
      const indent = '  '.repeat(level);

      switch (node.type) {
        case 'heading':
          const headingLevel = '#'.repeat(node.attrs?.level || 1);
          markdown += `${headingLevel} ${node.content?.map((n: any) => n.text || '').join('')}\n\n`;
          break;
        case 'paragraph':
          const text = node.content?.map((n: any) => {
            if (n.type === 'text') {
              let txt = n.text;
              if (n.marks) {
                n.marks.forEach((mark: any) => {
                  if (mark.type === 'bold') txt = `**${txt}**`;
                  if (mark.type === 'italic') txt = `*${txt}*`;
                  if (mark.type === 'code') txt = `\`${txt}\``;
                  if (mark.type === 'link') txt = `[${txt}](${mark.attrs.href})`;
                });
              }
              return txt;
            }
            return '';
          }).join('') || '';
          if (text) markdown += `${text}\n\n`;
          break;
        case 'bulletList':
        case 'orderedList':
          node.content?.forEach((item: any, idx: number) => {
            const bullet = node.type === 'bulletList' ? '-' : `${idx + 1}.`;
            const content = item.content?.map((n: any) => n.content?.map((c: any) => c.text || '').join('') || '').join('');
            markdown += `${indent}${bullet} ${content}\n`;
          });
          markdown += '\n';
          break;
        case 'codeBlock':
          const code = node.content?.map((n: any) => n.text || '').join('') || '';
          markdown += `\`\`\`${node.attrs?.language || ''}\n${code}\n\`\`\`\n\n`;
          break;
        case 'blockquote':
          node.content?.forEach((n: any) => processNode(n));
          break;
        default:
          if (node.content) {
            node.content.forEach((n: any) => processNode(n, level + 1));
          }
      }
    }

    processNode(json);

    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Markdown:', error);
    throw error;
  }
}

/**
 * Export document as plain text
 */
export function exportToText(
  editor: Editor,
  options: ExportOptions = {}
): void {
  const {
    fileName = 'document.txt',
  } = options;

  try {
    const text = editor.getText();

    // Create blob and download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to text:', error);
    throw error;
  }
}

/**
 * Main export function that handles all formats
 */
export async function exportDocument(
  editor: Editor,
  options: ExportOptions = {}
): Promise<void> {
  const { format = 'pdf' } = options;

  switch (format) {
    case 'pdf':
      await exportToPDF(editor, options);
      break;
    case 'html':
      exportToHTML(editor, options);
      break;
    case 'markdown':
      exportToMarkdown(editor, options);
      break;
    case 'text':
      exportToText(editor, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
