'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ConnectionStatus as Status } from '@/types';

interface ConnectionStatusProps {
  status: Status;
  peerCount: number;
}

export function ConnectionStatus({ status, peerCount }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: <Wifi className="w-3 h-3" />,
          text: `Connected (${peerCount} peers)`,
          variant: 'success' as const,
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3 h-3 animate-spin" />,
          text: 'Syncing...',
          variant: 'warning' as const,
        };
      case 'offline':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          text: 'Offline mode',
          variant: 'secondary' as const,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className="flex items-center gap-1.5">
      {config.icon}
      <span className="text-xs">{config.text}</span>
    </Badge>
  );
}
