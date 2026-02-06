'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import type { UserPresence } from '@/types';
import { FloatingToolbar } from './FloatingToolbar';

interface CollaborativeEditorProps {
  ydoc: Y.Doc;
  awareness: Awareness;
  userPresence: UserPresence;
  onReady?: () => void;
}

export function CollaborativeEditor({
  ydoc,
  awareness,
  userPresence,
  onReady,
}: CollaborativeEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-600 cursor-pointer',
        },
      }),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: awareness as any,
        user: {
          name: userPresence.userName,
          color: userPresence.userColor,
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[calc(100vh-200px)] p-8 text-white dark:text-white prose-headings:text-white prose-p:text-white',
      },
    },
    onUpdate: ({ editor }) => {
      // Editor content is automatically synced via Yjs
      // No manual sync needed
    },
  });

  useEffect(() => {
    if (editor && onReady) {
      onReady();
    }
  }, [editor, onReady]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <FloatingToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
