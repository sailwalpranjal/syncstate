import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import type { VersionNode } from '@/components/visualization/VersionTree3D';

export interface DocumentSnapshot {
  timestamp: number;
  state: Uint8Array;
  clientId: number;
}

/**
 * Hook to track and manage document version snapshots
 * Captures snapshots of Yjs document state over time for version visualization
 */
export function useDocumentVersions(ydoc: Y.Doc | null) {
  const [versions, setVersions] = useState<VersionNode[]>([]);
  const [snapshots, setSnapshots] = useState<DocumentSnapshot[]>([]);

  useEffect(() => {
    if (!ydoc) return;

    // Create initial snapshot
    const initialSnapshot: DocumentSnapshot = {
      timestamp: Date.now(),
      state: Y.encodeStateAsUpdate(ydoc),
      clientId: ydoc.clientID,
    };

    setSnapshots([initialSnapshot]);

    // Track document updates
    const updateHandler = (update: Uint8Array, origin: any) => {
      // Debounce snapshots: only create new snapshot if 5 seconds have passed
      setSnapshots((prev) => {
        const lastSnapshot = prev[prev.length - 1];
        const timeSinceLastSnapshot = Date.now() - lastSnapshot.timestamp;

        if (timeSinceLastSnapshot < 5000) {
          // Update the latest snapshot instead of creating new one
          return [
            ...prev.slice(0, -1),
            {
              timestamp: Date.now(),
              state: Y.encodeStateAsUpdate(ydoc),
              clientId: ydoc.clientID,
            },
          ];
        }

        // Create new snapshot
        return [
          ...prev,
          {
            timestamp: Date.now(),
            state: Y.encodeStateAsUpdate(ydoc),
            clientId: ydoc.clientID,
          },
        ];
      });
    };

    ydoc.on('update', updateHandler);

    return () => {
      ydoc.off('update', updateHandler);
    };
  }, [ydoc]);

  // Convert snapshots to version nodes for visualization
  useEffect(() => {
    const versionNodes: VersionNode[] = snapshots.map((snapshot, index) => {
      return {
        id: `version-${index}`,
        timestamp: snapshot.timestamp,
        author: `Client ${snapshot.clientId}`,
        message: index === 0 ? 'Initial version' : `Update ${index}`,
        parentId: index > 0 ? `version-${index - 1}` : undefined,
      };
    });

    setVersions(versionNodes);
  }, [snapshots]);

  // Function to restore a specific version
  const restoreVersion = (versionId: string) => {
    if (!ydoc) return;

    const versionIndex = parseInt(versionId.split('-')[1]);
    const snapshot = snapshots[versionIndex];

    if (snapshot) {
      // Clear current document state
      ydoc.transact(() => {
        // Apply the snapshot state
        Y.applyUpdate(ydoc, snapshot.state);
      });
    }
  };

  // Function to create a manual snapshot
  const createSnapshot = (message?: string) => {
    if (!ydoc) return;

    const snapshot: DocumentSnapshot = {
      timestamp: Date.now(),
      state: Y.encodeStateAsUpdate(ydoc),
      clientId: ydoc.clientID,
    };

    setSnapshots((prev) => [...prev, snapshot]);
  };

  return {
    versions,
    snapshots,
    restoreVersion,
    createSnapshot,
  };
}
