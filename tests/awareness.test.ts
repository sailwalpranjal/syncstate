import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import { describe, expect, it } from 'vitest';
import { generateUserColor, getUserPresences, updateUserPresence } from '@/lib/yjs/awareness';

const PALETTE = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#F97316'];

describe('generateUserColor', () => {
  it('always returns the same colour for the same user id', () => {
    expect(generateUserColor('user_abc')).toBe(generateUserColor('user_abc'));
  });

  it('only returns colours from the palette, including for odd ids', () => {
    for (const id of ['', 'a', 'user_2abcXYZ', '日本語', 'x'.repeat(500)]) {
      expect(PALETTE).toContain(generateUserColor(id));
    }
  });

  it('spreads a few hundred ids over most of the palette', () => {
    const used = new Set<string>();
    for (let i = 0; i < 300; i++) used.add(generateUserColor(`user_${i}`));
    expect(used.size).toBeGreaterThanOrEqual(6);
  });
});

describe('presence', () => {
  it('lists other users but not the local one', () => {
    const a = new Awareness(new Y.Doc());
    const b = new Awareness(new Y.Doc());
    updateUserPresence(a, 'u1', 'Ada', '#3B82F6');
    updateUserPresence(b, 'u2', 'Grace', '#10B981');

    // carry b's state into a, the way a provider would
    const bState = b.getLocalState();
    a.states.set(b.clientID, bState as Record<string, unknown>);

    const seen = getUserPresences(a);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ userId: 'u2', userName: 'Grace', userColor: '#10B981' });
  });

  it('skips peers whose user record is missing a field', () => {
    const a = new Awareness(new Y.Doc());
    a.states.set(999, { user: { userId: 'u9', userName: '', userColor: '#000' } });
    a.states.set(998, { cursor: { x: 1, y: 2 } });
    expect(getUserPresences(a)).toEqual([]);
  });

  it('passes the cursor through when a peer has one', () => {
    const a = new Awareness(new Y.Doc());
    a.states.set(5, { user: { userId: 'u5', userName: 'Lin', userColor: '#F59E0B' }, cursor: { x: 10, y: 20 } });
    expect(getUserPresences(a)[0].cursor).toEqual({ x: 10, y: 20 });
  });
});
