import { useEffect, useState } from 'react';
import type { YjsProviders } from '@/lib/yjs/provider';
import { initializeYjsDocument, cleanupYjsDocument } from '@/lib/yjs/provider';

export function useYjsDocument(documentId: string | null) {
  const [providers, setProviders] = useState<YjsProviders | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!documentId) {
      return;
    }

    const yjsProviders = initializeYjsDocument(documentId);

    // Wait for persistence to be ready
    yjsProviders.persistence.once('synced', () => {
      setIsReady(true);
    });

    setProviders(yjsProviders);

    return () => {
      cleanupYjsDocument(yjsProviders);
    };
  }, [documentId]);

  return { providers, isReady };
}
