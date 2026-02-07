'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Download,
  FileText,
  Code,
  FileCode,
  Loader2,
} from 'lucide-react';
import { exportDocument } from '@/lib/export/pdf';
import toast from 'react-hot-toast';

interface ExportMenuProps {
  editor: Editor | null;
  documentTitle: string;
}

export function ExportMenu({ editor, documentTitle }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: 'pdf' | 'html' | 'markdown' | 'text') => {
    if (!editor) return;

    setIsExporting(true);
    setShowMenu(false);

    try {
      const extensions: Record<string, string> = {
        pdf: '.pdf',
        html: '.html',
        markdown: '.md',
        text: '.txt',
      };

      const fileName = `${documentTitle || 'document'}${extensions[format]}`;

      await exportDocument(editor, {
        fileName,
        format,
        includeMetadata: true,
      });

      toast.success(`Exported as ${format.toUpperCase()}`, {
        icon: '📄',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export document');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || !editor}
        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </>
        )}
      </button>

      {showMenu && !isExporting && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden animate-scale-in">
            <div className="py-1">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <FileText className="w-4 h-4 text-error-500" />
                <span className="text-sm font-medium">Export as PDF</span>
              </button>

              <button
                onClick={() => handleExport('html')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <Code className="w-4 h-4 text-warning-500" />
                <span className="text-sm font-medium">Export as HTML</span>
              </button>

              <button
                onClick={() => handleExport('markdown')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <FileCode className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium">Export as Markdown</span>
              </button>

              <button
                onClick={() => handleExport('text')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <FileText className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium">Export as Text</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
