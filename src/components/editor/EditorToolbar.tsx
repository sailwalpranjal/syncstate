'use client';

import { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Table as TableIcon,
  Image as ImageIcon,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState({ top: 0, left: 0 });
  const [highlightPickerPos, setHighlightPickerPos] = useState({ top: 0, left: 0 });
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const highlightButtonRef = useRef<HTMLButtonElement>(null);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const textColors = [
    '#000000',
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
  ];

  const highlightColors = [
    '#FEF3C7',
    '#FEE2E2',
    '#DBEAFE',
    '#D1FAE5',
    '#FCE7F3',
    '#E9D5FF',
  ];

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2 sm:px-4 py-2 rounded-t-2xl">
      <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 mx-0.5 sm:mx-1" />

        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('bold') ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('italic') ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('underline') ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('strike') ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 mx-0.5 sm:mx-1" />

        {/* Text Color */}
        <div className="relative">
          <button
            ref={colorButtonRef}
            onClick={() => {
              if (!showColorPicker && colorButtonRef.current) {
                const rect = colorButtonRef.current.getBoundingClientRect();
                setColorPickerPos({
                  top: rect.bottom + 4,
                  left: rect.left,
                });
              }
              setShowColorPicker(!showColorPicker);
            }}
            className="p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Text Color"
          >
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          {showColorPicker && (
            <>
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => setShowColorPicker(false)}
              />
              <div
                className="fixed bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-2 z-[101] flex gap-1"
                style={{
                  top: `${colorPickerPos.top}px`,
                  left: `${colorPickerPos.left}px`,
                }}
              >
                {textColors.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      editor.chain().focus().setColor(color).run();
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded hover:scale-110 transition-transform border border-neutral-300 dark:border-neutral-600"
                    style={{ backgroundColor: color }}
                    title={`Set text color to ${color}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <button
            ref={highlightButtonRef}
            onClick={() => {
              if (!showHighlightPicker && highlightButtonRef.current) {
                const rect = highlightButtonRef.current.getBoundingClientRect();
                setHighlightPickerPos({
                  top: rect.bottom + 4,
                  left: rect.left,
                });
              }
              setShowHighlightPicker(!showHighlightPicker);
            }}
            className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
              editor.isActive('highlight') ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
            }`}
            title="Highlight"
          >
            <Highlighter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          {showHighlightPicker && (
            <>
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => setShowHighlightPicker(false)}
              />
              <div
                className="fixed bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-2 z-[101] flex gap-1"
                style={{
                  top: `${highlightPickerPos.top}px`,
                  left: `${highlightPickerPos.left}px`,
                }}
              >
                {highlightColors.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      editor.chain().focus().toggleHighlight({ color }).run();
                      setShowHighlightPicker(false);
                    }}
                    className="w-6 h-6 rounded hover:scale-110 transition-transform border border-neutral-300 dark:border-neutral-600"
                    style={{ backgroundColor: color }}
                    title={`Highlight with ${color}`}
                  />
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editor.chain().focus().unsetHighlight().run();
                    setShowHighlightPicker(false);
                  }}
                  className="w-6 h-6 rounded hover:scale-110 transition-transform border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 flex items-center justify-center text-xs"
                  title="Remove highlight"
                >
                  ✕
                </button>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 mx-0.5 sm:mx-1" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 mx-0.5 sm:mx-1" />

        {/* Text Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Justify"
        >
          <AlignJustify className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 mx-0.5 sm:mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('bulletList') ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('orderedList') ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 mx-0.5 sm:mx:1" />

        {/* Blockquote */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('blockquote') ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Code Block */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
            editor.isActive('codeBlock') ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : ''
          }`}
          title="Code Block"
        >
          <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-neutral-700 mx-0.5 sm:mx-1" />

        {/* Table */}
        <button
          onClick={insertTable}
          className="p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Insert Table"
        >
          <TableIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Image */}
        <button
          onClick={addImage}
          className="p-1.5 sm:p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
