import * as Y from 'yjs';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { makeAuthor, permutation, replay, snapshot, syncPair } from './helpers';

describe('convergence: same edits, different delivery order', () => {
  it('two replicas end identical when concurrent inserts arrive in opposite order', () => {
    const alice = makeAuthor(1);
    const bob = makeAuthor(2);
    alice.doc.getText('t').insert(0, 'hello');
    bob.doc.getText('t').insert(0, 'world');
    const updates = [...alice.updates, ...bob.updates];

    const r1 = replay(updates, [0, 1]);
    const r2 = replay(updates, [1, 0]);

    expect(snapshot(r1)).toEqual(snapshot(r2));
    // Both insertions survive; nothing is dropped.
    expect(r1.getText('t').toString()).toHaveLength('helloworld'.length);
    expect(r1.getText('t').toString()).toMatch(/^(helloworld|worldhello)$/);
  });

  it('concurrent inserts at the same index are ordered the same way on every replica', () => {
    const base = makeAuthor(10);
    base.doc.getText('t').insert(0, 'ac');
    const a = makeAuthor(11);
    const b = makeAuthor(12);
    const c = makeAuthor(13);
    for (const w of [a, b, c]) Y.applyUpdate(w.doc, Y.encodeStateAsUpdate(base.doc));
    a.updates.length = b.updates.length = c.updates.length = 0;

    a.doc.getText('t').insert(1, 'X');
    b.doc.getText('t').insert(1, 'Y');
    c.doc.getText('t').insert(1, 'Z');

    const all = [...base.updates, ...a.updates, ...b.updates, ...c.updates];
    const results = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      // base must arrive first only because later updates depend on it
      const rest = permutation(all.length - 1, seed).map((i) => i + 1);
      results.add(replay(all, [0, ...rest]).getText('t').toString());
    }
    expect(results.size).toBe(1);
  });

  it('concurrent delete and insert inside the deleted range converge, and the insert survives', () => {
    const base = makeAuthor(20);
    base.doc.getText('t').insert(0, 'abcdef');
    const a = makeAuthor(21);
    const b = makeAuthor(22);
    Y.applyUpdate(a.doc, Y.encodeStateAsUpdate(base.doc));
    Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(base.doc));
    a.updates.length = b.updates.length = 0;

    a.doc.getText('t').delete(1, 4); // removes "bcde"
    b.doc.getText('t').insert(3, '!'); // inserts between "c" and "d"

    const all = [...base.updates, ...a.updates, ...b.updates];
    const r1 = replay(all, [0, 1, 2]);
    const r2 = replay(all, [0, 2, 1]);
    expect(snapshot(r1)).toEqual(snapshot(r2));
    expect(r1.getText('t').toString()).toContain('!');
    expect(r1.getText('t').toString()).not.toContain('b');
  });

  it('conflicting writes to one map key resolve to the same winner everywhere', () => {
    const a = makeAuthor(31);
    const b = makeAuthor(32);
    a.doc.getMap('m').set('title', 'from a');
    b.doc.getMap('m').set('title', 'from b');
    const all = [...a.updates, ...b.updates];
    const r1 = replay(all, [0, 1]);
    const r2 = replay(all, [1, 0]);
    expect(r1.getMap('m').get('title')).toBe(r2.getMap('m').get('title'));
    expect(['from a', 'from b']).toContain(r1.getMap('m').get('title'));
  });

  it('array pushes from three authors converge and keep every element', () => {
    const authors = [makeAuthor(41), makeAuthor(42), makeAuthor(43)];
    authors.forEach((w, i) => w.doc.getArray('a').push([`${i}-x`, `${i}-y`]));
    const all = authors.flatMap((w) => w.updates);
    const reference = snapshot(replay(all, [0, 1, 2]));
    for (let seed = 1; seed <= 20; seed++) {
      expect(snapshot(replay(all, permutation(all.length, seed)))).toEqual(reference);
    }
    expect((reference.arr as string[]).sort()).toEqual(['0-x', '0-y', '1-x', '1-y', '2-x', '2-y']);
  });
});

describe('algebraic properties of update delivery', () => {
  it('applying the same update twice changes nothing (idempotent)', () => {
    const a = makeAuthor(51);
    a.doc.getText('t').insert(0, 'once');
    a.doc.getText('t').insert(4, ' only');
    const once = replay(a.updates, [0, 1]);
    const twice = replay([...a.updates, ...a.updates], [0, 1, 2, 3]);
    expect(snapshot(twice)).toEqual(snapshot(once));
  });

  it('update order does not matter between two independent authors (commutative)', () => {
    const a = makeAuthor(61);
    const b = makeAuthor(62);
    a.doc.getText('t').insert(0, 'AAA');
    b.doc.getText('t').insert(0, 'BBB');
    const all = [...a.updates, ...b.updates];
    expect(snapshot(replay(all, [0, 1]))).toEqual(snapshot(replay(all, [1, 0])));
  });

  it('merging updates and applying the result equals applying them one by one', () => {
    const a = makeAuthor(71);
    const t = a.doc.getText('t');
    t.insert(0, 'abc');
    t.insert(3, 'def');
    t.delete(1, 2);
    const merged = new Y.Doc();
    Y.applyUpdate(merged, Y.mergeUpdates(a.updates));
    expect(snapshot(merged)).toEqual(snapshot(replay(a.updates, a.updates.map((_, i) => i))));
  });

  it('a late joiner built from the full state matches replicas that saw every update', () => {
    const a = makeAuthor(81);
    const b = makeAuthor(82);
    a.doc.getText('t').insert(0, 'one ');
    b.doc.getText('t').insert(0, 'two ');
    syncPair(a.doc, b.doc);
    a.doc.getText('t').insert(a.doc.getText('t').length, 'three');
    syncPair(a.doc, b.doc);

    const late = new Y.Doc();
    Y.applyUpdate(late, Y.encodeStateAsUpdate(a.doc));
    expect(snapshot(late)).toEqual(snapshot(a.doc));
    expect(snapshot(late)).toEqual(snapshot(b.doc));
  });

  it('edits made offline on both sides merge after one state-vector exchange', () => {
    const a = new Y.Doc();
    const b = new Y.Doc();
    a.getText('t').insert(0, 'shared');
    syncPair(a, b);

    // "offline": no syncing while each side edits
    a.getText('t').insert(0, 'A:');
    a.getText('t').insert(a.getText('t').length, ':endA');
    b.getText('t').delete(0, 3);
    b.getText('t').insert(b.getText('t').length, '+B');

    syncPair(a, b);
    expect(snapshot(a)).toEqual(snapshot(b));
  });
});

describe('property: random concurrent edit histories converge', () => {
  type Op = { author: number; kind: 'ins' | 'del'; pos: number; text: string; len: number };

  const opArb = fc.record({
    author: fc.integer({ min: 0, max: 2 }),
    kind: fc.constantFrom<'ins' | 'del'>('ins', 'ins', 'del'),
    pos: fc.integer({ min: 0, max: 30 }),
    text: fc.string({ minLength: 1, maxLength: 5 }),
    len: fc.integer({ min: 1, max: 4 }),
  });

  function run(ops: Op[]) {
    const authors = [makeAuthor(101), makeAuthor(102), makeAuthor(103)];
    for (const op of ops) {
      const t = authors[op.author].doc.getText('t');
      if (op.kind === 'ins') t.insert(Math.min(op.pos, t.length), op.text);
      else if (t.length > 0) {
        const at = Math.min(op.pos, t.length - 1);
        t.delete(at, Math.min(op.len, t.length - at));
      }
    }
    return authors.flatMap((w) => w.updates);
  }

  it('any two delivery orders give the same document', () => {
    fc.assert(
      fc.property(fc.array(opArb, { minLength: 1, maxLength: 25 }), fc.integer(), fc.integer(), (ops, s1, s2) => {
        const updates = run(ops);
        const a = replay(updates, permutation(updates.length, s1));
        const b = replay(updates, permutation(updates.length, s2));
        expect(snapshot(a)).toEqual(snapshot(b));
      }),
      { numRuns: 200 },
    );
  });

  it('delivering each update twice, in random order, gives the same document', () => {
    fc.assert(
      fc.property(fc.array(opArb, { minLength: 1, maxLength: 20 }), fc.integer(), (ops, seed) => {
        const updates = run(ops);
        const doubled = [...updates, ...updates];
        const once = replay(updates, permutation(updates.length, seed));
        const twice = replay(doubled, permutation(doubled.length, seed + 1));
        expect(snapshot(twice)).toEqual(snapshot(once));
      }),
      { numRuns: 100 },
    );
  });

  it('pairwise state-vector sync of three replicas reaches one shared state', () => {
    fc.assert(
      fc.property(fc.array(opArb, { minLength: 1, maxLength: 25 }), (ops) => {
        const authors = [makeAuthor(111), makeAuthor(112), makeAuthor(113)];
        for (const op of ops) {
          const t = authors[op.author].doc.getText('t');
          if (op.kind === 'ins') t.insert(Math.min(op.pos, t.length), op.text);
          else if (t.length > 0) {
            const at = Math.min(op.pos, t.length - 1);
            t.delete(at, Math.min(op.len, t.length - at));
          }
        }
        const [a, b, c] = authors.map((w) => w.doc);
        syncPair(a, b);
        syncPair(b, c);
        syncPair(a, c);
        syncPair(a, b);
        expect(snapshot(a)).toEqual(snapshot(b));
        expect(snapshot(b)).toEqual(snapshot(c));
      }),
      { numRuns: 100 },
    );
  });
});

describe('negative control', () => {
  it('a replica that misses one update does NOT match, so the comparisons above can fail', () => {
    const a = makeAuthor(121);
    a.doc.getText('t').insert(0, 'first');
    a.doc.getText('t').insert(5, ' second');
    const complete = replay(a.updates, [0, 1]);
    const missing = replay(a.updates, [0]);
    expect(snapshot(missing)).not.toEqual(snapshot(complete));
  });
});
