import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

export interface YjsProviders {
  ydoc: Y.Doc;
  persistence: IndexeddbPersistence;
  webrtcProvider: WebrtcProvider;
  websocketProvider?: WebsocketProvider;
}

export function initializeYjsDocument(documentId: string, useWebSocket = false): YjsProviders {
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

  // Optional: Set up WebSocket provider as fallback
  let websocketProvider: WebsocketProvider | undefined;
  if (useWebSocket) {
    const wsUrl = process.env.NEXT_PUBLIC_YJS_WEBSOCKET_SERVER || 'wss://demos.yjs.dev';
    websocketProvider = new WebsocketProvider(wsUrl, documentId, ydoc);
  }

  return {
    ydoc,
    persistence,
    webrtcProvider,
    websocketProvider,
  };
}

export function cleanupYjsDocument(providers: YjsProviders): void {
  providers.webrtcProvider.destroy();
  if (providers.websocketProvider) {
    providers.websocketProvider.destroy();
  }
  providers.persistence.destroy();
  providers.ydoc.destroy();
}
