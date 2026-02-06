'use client';

import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UserPresence } from '@/types';

interface ActiveUsersProps {
  presences: UserPresence[];
  currentUserId: string;
}

export function ActiveUsers({ presences, currentUserId }: ActiveUsersProps) {
  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {presences.length + 1} active
      </span>
      <div className="flex items-center gap-1 ml-2">
        {presences.map((presence) => (
          <div
            key={presence.userId}
            className="relative group"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white dark:ring-gray-900"
              style={{ backgroundColor: presence.userColor }}
            >
              {presence.userName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {presence.userName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
