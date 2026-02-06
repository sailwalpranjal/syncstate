'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import type { UserPresence } from '@/types';

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
    extensions: [
      StarterKit,
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
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[calc(100vh-200px)] p-8',
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
      <EditorContent editor={editor} />
    </div>
  );
}
