import { useEffect, useState } from 'react';
import type { YjsProviders } from '@/lib/yjs/provider';
import { initializeYjsDocument, cleanupYjsDocument } from '@/lib/yjs/provider';

export function useYjsDocument(documentId: string | null) {
  const [providers, setProviders] = useState<YjsProviders | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!documentId) {
      setProviders(null);
      setIsReady(false);
      return;
    }

    let mounted = true;
    let yjsProviders: YjsProviders | null = null;

    try {
      yjsProviders = initializeYjsDocument(documentId);

      // Wait for persistence to be ready
      yjsProviders.persistence.once('synced', () => {
        if (mounted) {
          setIsReady(true);
        }
      });

      if (mounted) {
        setProviders(yjsProviders);
      }
    } catch (error) {
      console.error('Failed to initialize Yjs document:', error);
    }

    return () => {
      mounted = false;
      if (yjsProviders) {
        // Cleanup in next tick to avoid race conditions
        setTimeout(() => {
          if (yjsProviders) {
            cleanupYjsDocument(yjsProviders);
          }
        }, 0);
      }
    };
  }, [documentId]);

  return { providers, isReady };
}
