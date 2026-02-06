'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal, KeyboardShortcutsTrigger } from '@/components/ui/keyboard-shortcuts-modal';
import { CollaborativeEditor } from '@/components/editor/CollaborativeEditor';
import { ActiveUsers } from '@/components/editor/ActiveUsers';
import { ConnectionStatus } from '@/components/editor/ConnectionStatus';
import { useYjsDocument } from '@/hooks/useYjsDocument';
import { usePresence } from '@/hooks/usePresence';
import { useCollaboration } from '@/hooks/useCollaboration';
import { getDocumentById, updateDocument } from '@/lib/supabase/documents';
import type { Document } from '@/types';

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

  const { providers, isReady } = useYjsDocument(documentId);
  const presences = usePresence(
    providers?.webrtcProvider.awareness || null,
    user?.id || null,
    user?.fullName || user?.firstName || 'Anonymous'
  );
  const { connectionStatus, peerCount } = useCollaboration(
    providers?.webrtcProvider || null
  );

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
    const doc = await getDocumentById(documentId);
    if (doc) {
      setDocument(doc);
      setTitle(doc.title);
    }
    setIsLoading(false);
  };

  const handleSaveTitle = async () => {
    if (!document || title === document.title) return;

    setIsSaving(true);
    const updated = await updateDocument(documentId, title);
    if (updated) {
      setDocument(updated);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Document not found
          </h2>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                placeholder="Untitled Document"
                aria-label="Document title"
              />
              {isSaving && (
                <span className="text-sm text-gray-500">Saving...</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <KeyboardShortcutsTrigger onClick={() => setShowShortcuts(true)} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/visualization/${documentId}`)}
                className="flex items-center gap-2"
                aria-label="View 3D version tree visualization"
              >
                <GitBranch className="w-4 h-4" />
                3D Version Tree
              </Button>
              <ConnectionStatus status={connectionStatus} peerCount={peerCount} />
              <ActiveUsers presences={presences} currentUserId={user?.id || ''} />
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      {isReady && providers?.ydoc && providers?.webrtcProvider ? (
        <CollaborativeEditor
          ydoc={providers.ydoc}
          awareness={providers.webrtcProvider.awareness}
          userPresence={{
            userId: user?.id || 'anonymous',
            userName: user?.fullName || user?.firstName || 'Anonymous',
            userColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
          }}
        />
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Initializing editor...
            </p>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        shortcuts={[]}
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
