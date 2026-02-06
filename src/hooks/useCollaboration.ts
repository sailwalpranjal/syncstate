import { useState, useEffect } from 'react';
import type { WebrtcProvider } from 'y-webrtc';
import type { ConnectionStatus } from '@/types';

export function useCollaboration(provider: WebrtcProvider | null) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('offline');
  const [peerCount, setPeerCount] = useState(0);

  useEffect(() => {
    if (!provider) {
      return;
    }

    const handleStatusChange = ({ connected }: { connected: boolean }) => {
      setConnectionStatus(connected ? 'online' : 'offline');
    };

    const handlePeersChange = ({ webrtcPeers }: { webrtcPeers: unknown[] }) => {
      setPeerCount(webrtcPeers.length);
    };

    provider.on('status', handleStatusChange);
    provider.on('peers', handlePeersChange);

    return () => {
      provider.off('status', handleStatusChange);
      provider.off('peers', handlePeersChange);
    };
  }, [provider]);

  return { connectionStatus, peerCount };
}
