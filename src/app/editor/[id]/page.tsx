'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, GitBranch, Loader2, Save, Check } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal, KeyboardShortcutsTrigger } from '@/components/ui/keyboard-shortcuts-modal';
import { ActiveUsers } from '@/components/editor/ActiveUsers';
import { ConnectionStatus } from '@/components/editor/ConnectionStatus';
import { ExportMenu } from '@/components/editor/ExportMenu';
import { useYjsDocument } from '@/hooks/useYjsDocument';
import { usePresence } from '@/hooks/usePresence';
import { useCollaboration } from '@/hooks/useCollaboration';
import { getDocumentById, updateDocument } from '@/lib/supabase/documents';
import { generateUserColor } from '@/lib/yjs/awareness';
import type { Document } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

// Dynamically import CollaborativeEditor with SSR disabled
const CollaborativeEditor = dynamic(
  () => import('@/components/editor/CollaborativeEditor').then(mod => ({ default: mod.CollaborativeEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);

  // Ensure we're fully client-side mounted before rendering editor
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { providers, isReady } = useYjsDocument(documentId);
  const userColor = user?.id ? generateUserColor(user.id) : '#3B82F6';

  const presences = usePresence(
    providers?.webrtcProvider.awareness || null,
    user?.id || null,
    user?.fullName || user?.firstName || 'Anonymous'
  );

  const { connectionStatus, peerCount } = useCollaboration(
    providers?.webrtcProvider || null
  );

  // Setup auto-versioning every 5 minutes (memoized to prevent rebuild loops)
  useEffect(() => {
    if (!providers?.ydoc || !user?.id || !documentId) return;

    let cleanup: (() => void) | null = null;
    let mounted = true;

    const setupVersioning = async () => {
      try {
        const { setupAutoVersioning } = await import('@/lib/yjs/versions');
        if (!mounted) return;

        cleanup = setupAutoVersioning(
          documentId,
          providers.ydoc,
          user.id,
          user.fullName || user.firstName || 'Anonymous',
          5 // Save version every 5 minutes
        );
      } catch (error) {
        console.error('Failed to setup auto-versioning:', error);
      }
    };

    setupVersioning();

    return () => {
      mounted = false;
      if (cleanup) {
        try {
          cleanup();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
    // Only re-run if documentId or user.id changes (not on every render)
  }, [documentId, user?.id]);

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcuts(true),
    },
  ]);

  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  const loadDocument = async () => {
    setIsLoading(true);
    try {
      const doc = await getDocumentById(documentId);
      if (doc) {
        setDocument(doc);
        setTitle(doc.title);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTitle = useCallback(async () => {
    if (!document || title === document.title || !title.trim()) return;

    setIsSaving(true);
    try {
      const updated = await updateDocument(documentId, title.trim());
      if (updated) {
        setDocument(updated);
        setLastSaved(new Date());
        toast.success('Title saved', {
          icon: <Check className="w-4 h-4" />,
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error saving title:', error);
      toast.error('Failed to save title');
    } finally {
      setIsSaving(false);
    }
  }, [document, title, documentId]);

  const handleEditorReady = useCallback((editor: any) => {
    setEditorInstance(editor);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 dark:border-primary-900 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-6 text-lg font-medium text-neutral-700 dark:text-neutral-300">
            Loading document...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-error-100 dark:bg-error-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📄</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Document Not Found
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            This document doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <Toaster position="top-right" />

      {/* Enhanced Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-20 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              </button>

              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="text-xl sm:text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg px-2 py-1 text-neutral-900 dark:text-white placeholder-neutral-400 w-full"
                  placeholder="Untitled Document"
                  aria-label="Document title"
                  maxLength={100}
                />

                <AnimatePresence>
                  {isSaving ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 text-sm text-neutral-500 whitespace-nowrap"
                    >
                      <Save className="w-4 h-4 animate-pulse" />
                      <span className="hidden sm:inline">Saving...</span>
                    </motion.div>
                  ) : lastSaved && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 text-sm text-success-600 dark:text-success-400 whitespace-nowrap"
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Saved</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <KeyboardShortcutsTrigger onClick={() => setShowShortcuts(true)} />

              <ExportMenu editor={editorInstance} documentTitle={title || 'Untitled'} />

              <button
                onClick={() => router.push(`/visualization/${documentId}`)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-all shadow-md hover:shadow-lg"
                aria-label="View 3D version tree visualization"
              >
                <GitBranch className="w-4 h-4" />
                <span className="hidden lg:inline">3D Versions</span>
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-neutral-300 dark:border-neutral-700">
                <ConnectionStatus status={connectionStatus} peerCount={peerCount} />
                <ActiveUsers presences={presences} currentUserId={user?.id || ''} />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Editor */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isMounted && isReady && providers?.ydoc && providers?.webrtcProvider ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CollaborativeEditor
              ydoc={providers.ydoc}
              provider={providers.webrtcProvider}
              userPresence={{
                userId: user?.id || 'anonymous',
                userName: user?.fullName || user?.firstName || 'Anonymous',
                userColor,
              }}
              onReady={handleEditorReady}
            />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative mx-auto mb-6">
                <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                {!isMounted ? 'Mounting editor...' : 'Initializing collaboration...'}
              </p>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Setting up real-time sync
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        shortcuts={[]}
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
