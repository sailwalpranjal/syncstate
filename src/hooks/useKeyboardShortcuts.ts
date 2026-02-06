import { useEffect } from 'react';
import { Editor } from '@tiptap/react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

/**
 * Hook to register global keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const shiftMatches = shortcut.shift ? event.shiftKey : true;
        const altMatches = shortcut.alt ? event.altKey : true;
        const metaMatches = shortcut.meta ? event.metaKey : true;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          // Check if any of the modifier keys are required
          const hasRequiredModifiers =
            shortcut.ctrl || shortcut.shift || shortcut.alt || shortcut.meta;

          if (hasRequiredModifiers) {
            event.preventDefault();
            shortcut.action();
            break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

/**
 * Get default editor keyboard shortcuts
 */
export function getEditorShortcuts(editor: Editor | null): KeyboardShortcut[] {
  if (!editor) return [];

  return [
    {
      key: 'b',
      ctrl: true,
      description: 'Toggle Bold',
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: 'i',
      ctrl: true,
      description: 'Toggle Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: 'u',
      ctrl: true,
      description: 'Toggle Underline',
      action: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Insert Link',
      action: () => {
        const url = window.prompt('Enter URL:');
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Toggle Code',
      action: () => editor.chain().focus().toggleCode().run(),
    },
    {
      key: 'h',
      ctrl: true,
      shift: true,
      description: 'Toggle Highlight',
      action: () => editor.chain().focus().toggleHighlight().run(),
    },
    {
      key: 'z',
      ctrl: true,
      description: 'Undo',
      action: () => editor.chain().focus().undo().run(),
    },
    {
      key: 'y',
      ctrl: true,
      description: 'Redo',
      action: () => editor.chain().focus().redo().run(),
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      description: 'Redo (Alt)',
      action: () => editor.chain().focus().redo().run(),
    },
  ];
}

/**
 * Get dashboard keyboard shortcuts
 */
export function getDashboardShortcuts(
  onNewDocument?: () => void,
  onSearch?: () => void
): KeyboardShortcut[] {
  const shortcuts: KeyboardShortcut[] = [];

  if (onNewDocument) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      description: 'New Document',
      action: onNewDocument,
    });
  }

  if (onSearch) {
    shortcuts.push({
      key: 'k',
      ctrl: true,
      description: 'Search Documents',
      action: onSearch,
    });
  }

  return shortcuts;
}
