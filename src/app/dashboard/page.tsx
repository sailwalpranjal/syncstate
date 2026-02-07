'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Loader2, Search, Grid, List, Clock, Users, Trash2, Edit2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CreateDocumentModal } from '@/components/dashboard/CreateDocumentModal';
import { getDocuments, createDocument, deleteDocument } from '@/lib/supabase/documents';
import { useKeyboardShortcuts, getDashboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal, KeyboardShortcutsTrigger } from '@/components/ui/keyboard-shortcuts-modal';
import type { Document } from '@/types';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadDocuments = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const docs = await getDocuments(user.id);
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async (title: string, templateId?: string) => {
    if (!user?.id) {
      toast.error('Please sign in to create documents');
      return;
    }

    try {
      const newDoc = await createDocument(title, user.id);
      if (newDoc) {
        setDocuments([newDoc, ...documents]);
        setFilteredDocuments([newDoc, ...filteredDocuments]);

        // Store template ID in sessionStorage for editor to use
        if (templateId) {
          sessionStorage.setItem(`template_${newDoc.id}`, templateId);
        }

        toast.success('Document created!', {
          icon: '📄',
          style: {
            background: '#22c55e',
            color: '#fff',
          },
        });
        router.push(`/editor/${newDoc.id}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    }
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const success = await deleteDocument(id);
      if (success) {
        setDocuments(documents.filter((doc) => doc.id !== id));
        setFilteredDocuments(filteredDocuments.filter((doc) => doc.id !== id));
        toast.success('Document deleted');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = documents.filter((doc) =>
        doc.title.toLowerCase().includes(query)
      );
      setFilteredDocuments(filtered);
    }
  }, [searchQuery, documents]);

  // Register keyboard shortcuts
  const dashboardShortcuts = getDashboardShortcuts(
    () => setShowCreateModal(true),
    () => document.getElementById('search-input')?.focus()
  );

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
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary-200 dark:border-primary-900 rounded-full" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <Toaster position="top-right" />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-20 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent bg-size-200 animate-gradient-shift">
                My Documents
              </h1>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <KeyboardShortcutsTrigger onClick={() => setShowShortcuts(true)} />
              <ThemeToggle />
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/50 transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>New Document</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-neutral-900 dark:text-white placeholder-neutral-500"
              />
            </div>

            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-neutral-700 text-primary-600 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-700 text-primary-600 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recent Documents */}
        {!isLoading && documents.length > 0 && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              Recent Documents
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {documents.slice(0, 5).map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/editor/${doc.id}`)}
                  className="group relative flex-shrink-0 w-64 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 shadow-md hover:shadow-xl hover:shadow-primary-500/20 transition-all cursor-pointer p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {formatDate(doc.updated_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Documents Header */}
        {!isLoading && filteredDocuments.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {searchQuery ? 'Search Results' : 'All Documents'}
            </h2>
          </div>
        )}

        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/30">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
              {searchQuery ? 'No documents found' : 'No documents yet'}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 max-w-md mx-auto">
              {searchQuery
                ? `No documents match "${searchQuery}"`
                : 'Get started by creating your first collaborative document'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:shadow-xl hover:shadow-primary-500/50 transition-all font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Document
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {viewMode === 'grid' ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => router.push(`/editor/${doc.id}`)}
                    className="group relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 shadow-md hover:shadow-xl hover:shadow-primary-500/20 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>

                        <button
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-error-100 dark:hover:bg-error-900/20 rounded-lg transition-all"
                          aria-label="Delete document"
                        >
                          <Trash2 className="w-4 h-4 text-error-600 dark:text-error-400" />
                        </button>
                      </div>

                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 line-clamp-2">
                        {doc.title}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(doc.updated_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div layout className="space-y-3">
                {filteredDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => router.push(`/editor/${doc.id}`)}
                    className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 shadow-sm hover:shadow-lg hover:shadow-primary-500/10 transition-all cursor-pointer p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Last edited {formatDate(doc.updated_at)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteDocument(doc.id, e)}
                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-error-100 dark:hover:bg-error-900/20 rounded-lg transition-all"
                        aria-label="Delete document"
                      >
                        <Trash2 className="w-4 h-4 text-error-600 dark:text-error-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Modals */}
      <CreateDocumentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateDocument}
      />

      <KeyboardShortcutsModal
        shortcuts={dashboardShortcuts}
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
