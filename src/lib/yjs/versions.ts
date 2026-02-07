import * as Y from 'yjs';
import { supabase } from '@/lib/supabase/client';

export interface DocumentVersion {
  id: string;
  documentId: string;
  timestamp: number;
  author: string;
  authorId: string;
  message: string;
  snapshot: Uint8Array;
  parentId?: string;
}

/**
 * Create a version snapshot of the current Yjs document state
 */
export async function createVersionSnapshot(
  documentId: string,
  ydoc: Y.Doc,
  authorId: string,
  authorName: string,
  message: string = 'Auto-save snapshot',
  parentId?: string
): Promise<DocumentVersion | null> {
  try {
    // Encode the current Yjs document state
    const snapshot = Y.encodeStateAsUpdate(ydoc);

    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      documentId,
      timestamp: Date.now(),
      author: authorName,
      authorId,
      message,
      snapshot,
      parentId,
    };

    // Store version metadata in Supabase (snapshot stored in IndexedDB/localStorage)
    const { error } = await supabase.from('document_versions').insert({
      id: version.id,
      document_id: version.documentId,
      timestamp: new Date(version.timestamp).toISOString(),
      author: version.author,
      author_id: version.authorId,
      message: version.message,
      parent_id: version.parentId,
      // Store snapshot as base64 for Supabase
      snapshot_data: Buffer.from(snapshot).toString('base64'),
    });

    if (error) {
      // Check if error is due to missing table (expected if migration not run)
      const errorMessage = error.message || '';
      const errorCode = error.code || '';
      const isTableMissing =
        errorCode === 'PGRST116' ||
        errorCode === '42P01' ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        Object.keys(error).length === 0;

      if (!isTableMissing) {
        // Only log unexpected errors
        console.error('Error creating version snapshot:', error);
      }
      // Table missing is expected - auto-versioning is optional
      return null;
    }

    return version;
  } catch (error) {
    console.error('Error creating version snapshot:', error);
    return null;
  }
}

/**
 * Fetch all version snapshots for a document
 */
export async function getDocumentVersions(
  documentId: string
): Promise<DocumentVersion[]> {
  try {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('timestamp', { ascending: true });

    if (error) {
      // Table might not exist yet - this is expected if migration hasn't been run
      // Supabase returns various error formats, so we handle all cases gracefully
      const errorMessage = error.message || error.hint || '';
      const errorCode = error.code || '';
      const isTableMissing =
        errorCode === 'PGRST116' || // Table not found
        errorCode === '42P01' || // Postgres: relation does not exist
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        Object.keys(error).length === 0; // Empty error object

      if (!isTableMissing) {
        // Only log if it's an unexpected error
        console.warn('Could not fetch versions:', error);
      }
      // Table missing is expected - no need to log, the UI shows a notice
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      documentId: row.document_id,
      timestamp: new Date(row.timestamp).getTime(),
      author: row.author,
      authorId: row.author_id,
      message: row.message,
      snapshot: Buffer.from(row.snapshot_data, 'base64'),
      parentId: row.parent_id,
    }));
  } catch (error) {
    console.error('Error fetching document versions:', error);
    return [];
  }
}

/**
 * Restore a document to a specific version
 */
export async function restoreDocumentVersion(
  ydoc: Y.Doc,
  version: DocumentVersion
): Promise<boolean> {
  try {
    // Clear current document state
    ydoc.transact(() => {
      ydoc.share.clear();
    });

    // Apply the snapshot state
    Y.applyUpdate(ydoc, version.snapshot);

    return true;
  } catch (error) {
    console.error('Error restoring document version:', error);
    return false;
  }
}

/**
 * Get the latest version for a document
 */
export async function getLatestVersion(
  documentId: string
): Promise<DocumentVersion | null> {
  try {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      documentId: data.document_id,
      timestamp: new Date(data.timestamp).getTime(),
      author: data.author,
      authorId: data.author_id,
      message: data.message,
      snapshot: Buffer.from(data.snapshot_data, 'base64'),
      parentId: data.parent_id,
    };
  } catch (error) {
    console.error('Error fetching latest version:', error);
    return null;
  }
}

/**
 * Auto-save version snapshots at regular intervals
 */
export function setupAutoVersioning(
  documentId: string,
  ydoc: Y.Doc,
  authorId: string,
  authorName: string,
  intervalMinutes: number = 5
): () => void {
  let lastVersionTimestamp = Date.now();

  const checkAndSave = async () => {
    const now = Date.now();
    const minutesSinceLastVersion = (now - lastVersionTimestamp) / (1000 * 60);

    if (minutesSinceLastVersion >= intervalMinutes) {
      const latestVersion = await getLatestVersion(documentId);
      await createVersionSnapshot(
        documentId,
        ydoc,
        authorId,
        authorName,
        'Auto-save checkpoint',
        latestVersion?.id
      );
      lastVersionTimestamp = now;
    }
  };

  // Check every minute
  const intervalId = setInterval(checkAndSave, 60 * 1000);

  // Cleanup function
  return () => {
    clearInterval(intervalId);
  };
}
