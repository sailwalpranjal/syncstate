'use client';

import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import type { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({
  shortcuts,
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys: string[] = [];
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    if (shortcut.ctrl || shortcut.meta) {
      keys.push(isMac ? '⌘' : 'Ctrl');
    }
    if (shortcut.shift) {
      keys.push(isMac ? '⇧' : 'Shift');
    }
    if (shortcut.alt) {
      keys.push(isMac ? '⌥' : 'Alt');
    }
    keys.push(shortcut.key.toUpperCase());

    return keys.join(' + ');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Keyboard className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-foreground">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto">
            <div className="grid gap-4">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  <span className="text-foreground font-medium">
                    {shortcut.description}
                  </span>
                  <kbd className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm text-gray-700 dark:text-gray-300 shadow-sm">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-muted-foreground text-center">
              Press <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Button to trigger keyboard shortcuts modal
 */
export function KeyboardShortcutsTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      title="View keyboard shortcuts"
    >
      <Keyboard className="w-4 h-4" />
      <span className="hidden sm:inline">Shortcuts</span>
    </button>
  );
}
