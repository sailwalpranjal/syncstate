import { Awareness } from 'y-protocols/awareness';
import type { UserPresence } from '@/types';

export function updateUserPresence(
  awareness: Awareness,
  userId: string,
  userName: string,
  userColor: string
): void {
  awareness.setLocalStateField('user', {
    userId,
    userName,
    userColor,
  });
}

export function getUserPresences(awareness: Awareness): UserPresence[] {
  const presences: UserPresence[] = [];

  awareness.getStates().forEach((state, clientId) => {
    if (state.user && clientId !== awareness.clientID) {
      presences.push({
        userId: state.user.userId,
        userName: state.user.userName,
        userColor: state.user.userColor,
        cursor: state.cursor,
      });
    }
  });

  return presences;
}

export function generateUserColor(userId: string): string {
  // Generate a consistent color based on user ID
  const colors = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4', // cyan
    '#EC4899', // pink
    '#F97316', // orange
  ];

  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}
