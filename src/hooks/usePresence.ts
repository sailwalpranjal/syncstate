import { useEffect, useState } from 'react';
import { Awareness } from 'y-protocols/awareness';
import { updateUserPresence, getUserPresences, generateUserColor } from '@/lib/yjs/awareness';
import type { UserPresence } from '@/types';

export function usePresence(
  awareness: Awareness | null,
  userId: string | null,
  userName: string | null
) {
  const [presences, setPresences] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!awareness || !userId || !userName) {
      return;
    }

    const userColor = generateUserColor(userId);
    updateUserPresence(awareness, userId, userName, userColor);

    const updatePresences = () => {
      setPresences(getUserPresences(awareness));
    };

    awareness.on('change', updatePresences);
    updatePresences();

    return () => {
      awareness.off('change', updatePresences);
    };
  }, [awareness, userId, userName]);

  return presences;
}
