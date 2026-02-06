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
    // TODO: Fetch document metadata and version history from Supabase
    // For now, using demo data
    setDocumentTitle(`Document ${documentId.slice(0, 8)} - Version History`);

    // In production, this would fetch real version data from Yjs/Supabase
    // const fetchVersions = async () => {
    //   const { data } = await supabase
    //     .from('document_versions')
    //     .select('*')
    //     .eq('document_id', documentId)
    //     .order('created_at', { ascending: true });
    //   setVersions(data || []);
    // };
    // fetchVersions();
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
    </div>
  );
}
