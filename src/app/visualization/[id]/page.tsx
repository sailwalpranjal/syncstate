'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense, lazy } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { VersionNode } from '@/components/visualization/VersionTree3D';

// Dynamic import with code-splitting for Three.js
const VersionTree3D = lazy(() => import('@/components/visualization/VersionTree3D'));

function VisualizationLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-white text-lg">Loading 3D Visualization...</p>
      </div>
    </div>
  );
}

export default function VisualizationPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [versions, setVersions] = useState<VersionNode[]>([]);
  const [documentTitle, setDocumentTitle] = useState('Document Versions');

  useEffect(() => {
    const fetchData = async () => {
      // Fetch document metadata
      const { supabase } = await import('@/lib/supabase/client');
      const { data: docData } = await supabase
        .from('documents')
        .select('title')
        .eq('id', documentId)
        .single();

      if (docData) {
        setDocumentTitle(`${docData.title} - Version History`);
      } else {
        setDocumentTitle(`Document - Version History`);
      }

      // Fetch version history from Supabase
      const { getDocumentVersions } = await import('@/lib/yjs/versions');
      const versionData = await getDocumentVersions(documentId);

      // Convert to VersionNode format for 3D visualization
      const nodes: VersionNode[] = versionData.map((v) => ({
        id: v.id,
        timestamp: v.timestamp,
        author: v.author,
        message: v.message,
        parentId: v.parentId,
      }));

      setVersions(nodes);
    };

    fetchData();
  }, [documentId]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {documentTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                Interactive 3D version tree with geodesic path visualization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/editor/${documentId}`)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Open Editor
            </button>
          </div>
        </div>
      </header>

      {/* 3D Visualization */}
      <main className="flex-1 relative">
        <Suspense fallback={<VisualizationLoading />}>
          <VersionTree3D versions={versions} className="absolute inset-0" />
        </Suspense>
      </main>

      {/* Info Banner */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-purple-500/20 backdrop-blur-md border border-purple-400/30 rounded-full px-6 py-2 text-white text-sm">
          <span className="font-semibold">Geodesic Paths</span> visualize version relationships in 3D space
        </div>
      </div>

      {/* Setup Notice - Show when no versions exist */}
      {versions.length === 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 max-w-lg">
          <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-lg px-6 py-4 text-white">
            <p className="text-sm font-semibold mb-2">📊 No Versions Yet</p>
            <p className="text-xs text-gray-200">
              Start creating versions by editing your document. Versions are automatically saved every 5 minutes while you work.
            </p>
            <p className="text-xs text-gray-200 mt-2">
              💡 <strong>Tip:</strong> Make some changes to your document and wait 5 minutes, or edit the document multiple times over time to see the version tree appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
