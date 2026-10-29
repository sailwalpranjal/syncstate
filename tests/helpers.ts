import * as Y from 'yjs';

/** One writer that edits offline and records every update it produces. */
export interface Author {
  doc: Y.Doc;
  updates: Uint8Array[];
}

export function makeAuthor(clientID: number): Author {
  const doc = new Y.Doc();
  // Fixed ids make failures reproducible; the CRDT tie-break depends on them.
  doc.clientID = clientID;
  const updates: Uint8Array[] = [];
  doc.on('update', (u: Uint8Array) => updates.push(u));
  return { doc, updates };
}

/** Apply updates to a fresh replica in the given order. */
export function replay(updates: Uint8Array[], order: number[]): Y.Doc {
  const replica = new Y.Doc();
  for (const i of order) Y.applyUpdate(replica, updates[i]);
  return replica;
}

/** Deterministic Fisher-Yates so a failing order can be printed and rerun. */
export function permutation(n: number, seed: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  let s = seed >>> 0 || 1;
  const next = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Full-document fingerprint: content plus the state vector. */
export function snapshot(doc: Y.Doc) {
  return {
    text: doc.getText('t').toString(),
    arr: doc.getArray('a').toJSON(),
    map: doc.getMap('m').toJSON(),
    sv: Array.from(Y.encodeStateVector(doc)),
  };
}

export function syncPair(a: Y.Doc, b: Y.Doc): void {
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a, Y.encodeStateVector(b)));
  Y.applyUpdate(a, Y.encodeStateAsUpdate(b, Y.encodeStateVector(a)));
}
