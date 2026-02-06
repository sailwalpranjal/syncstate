import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

export interface YjsProviders {
  ydoc: Y.Doc;
  persistence: IndexeddbPersistence;
  webrtcProvider: WebrtcProvider;
}

export function initializeYjsDocument(documentId: string): YjsProviders {
  // Create Yjs document
  const ydoc = new Y.Doc();

  // Set up local persistence with IndexedDB
  const persistence = new IndexeddbPersistence(documentId, ydoc);

  // Set up WebRTC provider for P2P synchronization
  const webrtcProvider = new WebrtcProvider(documentId, ydoc, {
    signaling: [process.env.NEXT_PUBLIC_YJS_SIGNALING_SERVER || 'wss://signaling.yjs.dev'],
    maxConns: 20,
    filterBcConns: true,
  });

  return {
    ydoc,
    persistence,
    webrtcProvider,
  };
}

export function cleanupYjsDocument(providers: YjsProviders): void {
  providers.webrtcProvider.destroy();
  providers.persistence.destroy();
  providers.ydoc.destroy();
}
