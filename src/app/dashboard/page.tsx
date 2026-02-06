'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DocumentCard } from '@/components/dashboard/DocumentCard';
import { getDocuments, createDocument, deleteDocument } from '@/lib/supabase/documents';
import type { Document } from '@/types';

export default function DashboardPage() {
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const docs = await getDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleCreateDocument = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      const title = `Untitled Document ${new Date().toLocaleDateString()}`;
      const newDoc = await createDocument(title, user.id);

      if (newDoc) {
        setDocuments([newDoc, ...documents]);
        toast.success('Document created successfully');
      } else {
        toast.error('Failed to create document');
      }
    } catch (error) {
      toast.error('Failed to create document');
      console.error(error);
    }
    setIsCreating(false);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const success = await deleteDocument(id);
      if (success) {
        setDocuments(documents.filter((doc) => doc.id !== id));
        toast.success('Document deleted');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      toast.error('Failed to delete document');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text">
              My Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage your collaborative documents
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              onClick={handleCreateDocument}
              disabled={isCreating}
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Document
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No documents yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by creating your first document
            </p>
            <Button onClick={handleCreateDocument} disabled={isCreating}>
              <Plus className="w-5 h-5 mr-2" />
              Create Document
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
      </div>
    </div>
  );
}
