'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, FileText, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DocumentCard } from '@/components/dashboard/DocumentCard';
import { getDocuments, createDocument, deleteDocument } from '@/lib/supabase/documents';
import { useKeyboardShortcuts, getDashboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal, KeyboardShortcutsTrigger } from '@/components/ui/keyboard-shortcuts-modal';
import type { Document } from '@/types';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setIsLoading(false);
      return;
    }

    console.log('Loading documents for user:', user.id);
    setIsLoading(true);
    setError(null);

    try {
      const docs = await getDocuments(user.id);
      console.log('Documents loaded:', docs);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents. Please check your database setup.');
      toast.error('Failed to load documents. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!user?.id) {
      toast.error('Please sign in to create documents');
      return;
    }

    console.log('Creating document...');
    setIsCreating(true);
    setError(null);

    try {
      const title = `Untitled Document ${new Date().toLocaleDateString()}`;
      const newDoc = await createDocument(title, user.id);

      if (newDoc) {
        console.log('Document created:', newDoc);
        setDocuments([newDoc, ...documents]);
        toast.success('Document created successfully!');
      } else {
        throw new Error('Document creation returned null');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      setError('Failed to create document. Did you run the SQL schema?');
      toast.error('Failed to create document. Check console for details.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    console.log('Deleting document:', id);
    try {
      const success = await deleteDocument(id);
      if (success) {
        setDocuments(documents.filter((doc) => doc.id !== id));
        toast.success('Document deleted');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  // Register keyboard shortcuts
  const dashboardShortcuts = getDashboardShortcuts(handleCreateDocument);
  useKeyboardShortcuts([
    ...dashboardShortcuts,
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcuts(true),
    },
  ]);

  useEffect(() => {
    if (isLoaded && user) {
      loadDocuments();
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black mb-3">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Documents
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Create and manage your collaborative documents
            </p>
          </div>
          <div className="flex items-center gap-4">
            <KeyboardShortcutsTrigger onClick={() => setShowShortcuts(true)} />
            <ThemeToggle />
            <Button
              onClick={handleCreateDocument}
              disabled={isCreating}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50"
              aria-label="Create new document"
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              New Document
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
              <p className="text-gray-300 mb-3">{error}</p>
              <p className="text-sm text-gray-400">
                Make sure you've run the SQL schema in Supabase. Check the console for more details.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDocuments}
                className="mt-4 border-red-500/30 hover:bg-red-500/10"
              >
                Retry Loading
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              No documents yet
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Get started by creating your first collaborative document
            </p>
            <Button
              onClick={handleCreateDocument}
              disabled={isCreating}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/50"
              aria-label="Create your first document"
            >
              {isCreating ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              Create Your First Document
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDeleteDocument}
              />
            ))}
          </div>
        )}

        {/* Debug Info (remove in production) */}
        <div className="mt-12 p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Debug Info</h3>
          <pre className="text-xs text-gray-500 overflow-auto">
            {JSON.stringify({
              isLoaded,
              hasUser: !!user,
              userId: user?.id,
              documentsCount: documents.length,
              isLoading,
              error: error || 'none',
            }, null, 2)}
          </pre>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        shortcuts={dashboardShortcuts}
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
