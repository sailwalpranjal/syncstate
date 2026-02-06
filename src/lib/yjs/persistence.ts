import * as Y from 'yjs';

export function observeDocumentChanges(
  ydoc: Y.Doc,
  callback: (update: Uint8Array) => void
): () => void {
  const observer = (update: Uint8Array, origin: any) => {
    // Only process remote changes (not local ones)
    if (origin !== 'local') {
      callback(update);
    }
  };

  ydoc.on('update', observer);

  // Return cleanup function
  return () => {
    ydoc.off('update', observer);
  };
}

export function batchDocumentUpdates(
  ydoc: Y.Doc,
  updates: () => void
): void {
  ydoc.transact(() => {
    updates();
  }, 'local');
}
