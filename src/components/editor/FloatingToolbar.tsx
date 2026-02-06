'use client';

import { useEffect, useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Highlighter,
} from 'lucide-react';

interface FloatingToolbarProps {
  editor: Editor | null;
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const isTextSelected = from !== to;

    if (!isTextSelected) {
      setIsVisible(false);
      return;
    }

    // Get the DOM range for the selection
    const { view } = editor;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // Calculate center position of selection
    const centerX = (start.left + end.left) / 2;
    const topY = start.top;

    // Position toolbar above selection with offset
    setPosition({
      top: topY - 60, // 60px above selection
      left: centerX,
    });

    setIsVisible(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    // Update position on selection change
    const handleSelectionUpdate = () => {
      updatePosition();
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('update', handleSelectionUpdate);

    // Hide on blur
    const handleBlur = () => {
      // Delay hiding to allow button clicks
      setTimeout(() => {
        const { from, to } = editor.state.selection;
        if (from === to) {
          setIsVisible(false);
        }
      }, 200);
    };

    editor.on('blur', handleBlur);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('update', handleSelectionUpdate);
      editor.off('blur', handleBlur);
    };
  }, [editor, updatePosition]);

  if (!editor || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed z-50 flex items-center gap-1 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 p-1 transition-opacity"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {/* Bold */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-colors ${
          editor.isActive('bold') ? 'bg-blue-600' : ''
        }`}
        title="Bold (Cmd+B)"
      >
        <Bold className="w-4 h-4" />
      </button>

      {/* Italic */}
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-colors ${
          editor.isActive('italic') ? 'bg-blue-600' : ''
        }`}
        title="Italic (Cmd+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      {/* Strikethrough */}
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-colors ${
          editor.isActive('strike') ? 'bg-blue-600' : ''
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Code */}
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-colors ${
          editor.isActive('code') ? 'bg-blue-600' : ''
        }`}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </button>

      {/* Highlight */}
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-2 rounded hover:bg-gray-700 transition-colors ${
          editor.isActive('highlight') ? 'bg-yellow-600' : ''
        }`}
        title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </button>

      {/* Link */}
      <button
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-2 rounded hover:bg-gray-700 transition-colors ${
          editor.isActive('link') ? 'bg-blue-600' : ''
        }`}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>

      {/* Pointer arrow */}
      <div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #1f2937',
        }}
      />
    </div>
  );
}
