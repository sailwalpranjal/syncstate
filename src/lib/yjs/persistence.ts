import * as Y from 'yjs';
import { YjsUpdateBatcher, YjsTransactionBatcher, debounce } from './batching';

/**
 * Observe document changes with optional batching
 * Updates are batched at 50ms intervals for performance
 */
export function observeDocumentChanges(
  ydoc: Y.Doc,
  callback: (update: Uint8Array) => void,
  enableBatching = true
): () => void {
  if (enableBatching) {
    // Use update batcher for optimized performance
    const batcher = new YjsUpdateBatcher(ydoc, callback);

    const observer = (update: Uint8Array, origin: any) => {
      // Only process remote changes (not local ones)
      if (origin !== 'local') {
        batcher.addUpdate(update, origin);
      }
    };

    ydoc.on('update', observer);

    // Return cleanup function
    return () => {
      ydoc.off('update', observer);
      batcher.flush(); // Process any pending updates
      batcher.destroy();
    };
  } else {
    // No batching - process updates immediately
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
}

/**
 * Batch document updates into a single transaction
 * Multiple operations are grouped together for efficiency
 */
export function batchDocumentUpdates(
  ydoc: Y.Doc,
  updates: () => void
): void {
  ydoc.transact(() => {
    updates();
  }, 'local');
}

/**
 * Create a transaction batcher for a document
 * Allows queuing multiple operations to be executed in batches
 */
export function createTransactionBatcher(ydoc: Y.Doc): YjsTransactionBatcher {
  return new YjsTransactionBatcher(ydoc);
}

/**
 * Create a debounced version of a document update handler
 * Useful for expensive operations like syncing to server
 */
export function createDebouncedHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay = 50
): (...args: Parameters<T>) => void {
  return debounce(handler, delay);
}
