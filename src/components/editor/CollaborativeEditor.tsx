'use client';

import { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { createLowlight, common } from 'lowlight';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import type { UserPresence } from '@/types';
import { FloatingToolbar } from './FloatingToolbar';
import { EditorToolbar } from './EditorToolbar';
import { Loader2 } from 'lucide-react';

import type { WebrtcProvider } from 'y-webrtc';

const lowlight = createLowlight(common);

interface CollaborativeEditorProps {
  ydoc: Y.Doc;
  provider: WebrtcProvider;
  userPresence: UserPresence;
  onReady?: (editor: Editor) => void;
}

export function CollaborativeEditor({
  ydoc,
  provider,
  userPresence,
  onReady,
}: CollaborativeEditorProps) {
  const editorInstanceRef = useRef<Editor | null>(null);
  const [templateApplied, setTemplateApplied] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        history: false,
        codeBlock: false, // Disable default code block to use lowlight
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-600 cursor-pointer',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: userPresence.userName,
          color: userPresence.userColor,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[calc(100vh-200px)] p-8 text-white dark:text-white prose-headings:text-white dark:prose-headings:text-white prose-p:text-neutral-100 dark:prose-p:text-neutral-100 prose-strong:text-white dark:prose-strong:text-white prose-em:text-neutral-100 dark:prose-em:text-neutral-100 prose-a:text-primary-400 dark:prose-a:text-primary-400 prose-li:text-neutral-100 prose-code:text-neutral-100 prose-blockquote:text-neutral-200',
      },
    },
  });

  // Apply template content if available and document is empty (run once)
  useEffect(() => {
    if (!editor || templateApplied) return;

    const isEmpty = editor.isEmpty;

    // Check if there's a template to apply (only in browser, not during SSR)
    if (isEmpty && typeof window !== 'undefined') {
      const docId = window.location.pathname.split('/').pop();
      if (docId) {
        const templateId = sessionStorage.getItem(`template_${docId}`);
        if (templateId) {
          // Import template and apply content
          import('@/lib/templates')
            .then(({ getTemplateById }) => {
              const template = getTemplateById(templateId);
              if (template && template.content && editor && !editor.isDestroyed) {
                editor.commands.setContent(template.content);
              }
            })
            .catch((err) => {
              console.error('Failed to load template:', err);
            })
            .finally(() => {
              // Clear the template from sessionStorage after attempting to apply
              try {
                sessionStorage.removeItem(`template_${docId}`);
              } catch (e) {
                // Ignore storage errors
              }
            });
        }
      }
    }

    // Mark template as applied to prevent re-running
    setTemplateApplied(true);
  }, [editor]);

  useEffect(() => {
    if (editor) {
      editorInstanceRef.current = editor;
      if (onReady) {
        onReady(editor);
      }
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, [editor, onReady]);

  if (!editor) {
    return (
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Initializing editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <FloatingToolbar editor={editor} />
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} className="min-h-[400px]" />
      </div>
    </div>
  );
}
