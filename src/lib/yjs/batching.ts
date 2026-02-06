import * as Y from 'yjs';

/**
 * CRDT Operation Batcher
 * Batches Yjs document updates to improve performance
 * Processes updates in 50ms intervals to reduce overhead
 */
export class YjsUpdateBatcher {
  private batchInterval = 50; // milliseconds
  private pendingUpdates: Uint8Array[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private doc: Y.Doc;
  private onBatchCallback?: (mergedUpdate: Uint8Array) => void;

  constructor(doc: Y.Doc, onBatch?: (mergedUpdate: Uint8Array) => void) {
    this.doc = doc;
    this.onBatchCallback = onBatch;
  }

  /**
   * Add an update to the batch queue
   */
  addUpdate(update: Uint8Array, origin?: any): void {
    // Skip updates from remote origins to avoid feedback loops
    if (origin !== 'local' && origin !== null && origin !== undefined) {
      return;
    }

    this.pendingUpdates.push(update);

    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Schedule batch processing
    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.batchInterval);
  }

  /**
   * Process all pending updates in a single batch
   */
  private processBatch(): void {
    if (this.pendingUpdates.length === 0) return;

    try {
      // Merge all pending updates into a single update
      const mergedUpdate = Y.mergeUpdates(this.pendingUpdates);

      // Call the batch callback
      if (this.onBatchCallback) {
        this.onBatchCallback(mergedUpdate);
      }

      // Clear pending updates
      this.pendingUpdates = [];
      this.batchTimer = null;
    } catch (error) {
      console.error('Error processing update batch:', error);
      this.pendingUpdates = [];
      this.batchTimer = null;
    }
  }

  /**
   * Force process all pending updates immediately
   */
  flush(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.processBatch();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.pendingUpdates = [];
    this.batchTimer = null;
  }
}

/**
 * Transaction Batcher for Yjs operations
 * Groups multiple document mutations into a single transaction
 */
export class YjsTransactionBatcher {
  private doc: Y.Doc;
  private batchInterval = 50; // milliseconds
  private pendingOperations: Array<() => void> = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(doc: Y.Doc) {
    this.doc = doc;
  }

  /**
   * Queue an operation to be executed in a batched transaction
   */
  queueOperation(operation: () => void): void {
    this.pendingOperations.push(operation);

    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // Schedule batch execution
    this.batchTimer = setTimeout(() => {
      this.executeBatch();
    }, this.batchInterval);
  }

  /**
   * Execute all pending operations in a single transaction
   */
  private executeBatch(): void {
    if (this.pendingOperations.length === 0) return;

    try {
      // Execute all operations in a single transaction
      this.doc.transact(() => {
        this.pendingOperations.forEach((operation) => {
          try {
            operation();
          } catch (error) {
            console.error('Error executing batched operation:', error);
          }
        });
      });

      // Clear pending operations
      this.pendingOperations = [];
      this.batchTimer = null;
    } catch (error) {
      console.error('Error executing transaction batch:', error);
      this.pendingOperations = [];
      this.batchTimer = null;
    }
  }

  /**
   * Force execute all pending operations immediately
   */
  flush(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.executeBatch();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.pendingOperations = [];
    this.batchTimer = null;
  }
}

/**
 * Debounce helper for update handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle helper for high-frequency updates
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
