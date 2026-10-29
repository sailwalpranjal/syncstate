import * as Y from 'yjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { YjsTransactionBatcher, YjsUpdateBatcher, debounce, throttle } from '@/lib/yjs/batching';
import { observeDocumentChanges } from '@/lib/yjs/persistence';
import { snapshot } from './helpers';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('YjsUpdateBatcher', () => {
  it('delivers many updates as one merged update after the 50ms window', () => {
    const source = new Y.Doc();
    const onBatch = vi.fn();
    const batcher = new YjsUpdateBatcher(source, onBatch);
    source.on('update', (u: Uint8Array, origin: unknown) => batcher.addUpdate(u, origin));

    source.getText('t').insert(0, 'a');
    source.getText('t').insert(1, 'b');
    source.getText('t').insert(2, 'c');
    expect(onBatch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(49);
    expect(onBatch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onBatch).toHaveBeenCalledTimes(1);

    // The merged update must reproduce the source document exactly.
    const target = new Y.Doc();
    Y.applyUpdate(target, onBatch.mock.calls[0][0]);
    expect(snapshot(target)).toEqual(snapshot(source));
  });

  it('restarts the window on every new update', () => {
    const doc = new Y.Doc();
    const onBatch = vi.fn();
    const batcher = new YjsUpdateBatcher(doc, onBatch);
    doc.on('update', (u: Uint8Array) => batcher.addUpdate(u));
    doc.getText('t').insert(0, 'a');
    vi.advanceTimersByTime(40);
    doc.getText('t').insert(1, 'b');
    vi.advanceTimersByTime(40);
    expect(onBatch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10);
    expect(onBatch).toHaveBeenCalledTimes(1);
  });

  it('flush() delivers immediately and a second flush is a no-op', () => {
    const doc = new Y.Doc();
    const onBatch = vi.fn();
    const batcher = new YjsUpdateBatcher(doc, onBatch);
    doc.on('update', (u: Uint8Array) => batcher.addUpdate(u));
    doc.getText('t').insert(0, 'x');
    batcher.flush();
    batcher.flush();
    expect(onBatch).toHaveBeenCalledTimes(1);
  });

  it('ignores updates whose origin is neither local nor unset', () => {
    const doc = new Y.Doc();
    const onBatch = vi.fn();
    const batcher = new YjsUpdateBatcher(doc, onBatch);
    doc.on('update', (u: Uint8Array, origin: unknown) => batcher.addUpdate(u, origin));
    doc.transact(() => doc.getText('t').insert(0, 'from a provider'), { provider: 'webrtc' });
    batcher.flush();
    expect(onBatch).not.toHaveBeenCalled();
  });

  it('destroy() drops anything pending', () => {
    const doc = new Y.Doc();
    const onBatch = vi.fn();
    const batcher = new YjsUpdateBatcher(doc, onBatch);
    doc.on('update', (u: Uint8Array) => batcher.addUpdate(u));
    doc.getText('t').insert(0, 'x');
    batcher.destroy();
    vi.advanceTimersByTime(500);
    expect(onBatch).not.toHaveBeenCalled();
  });
});

describe('observeDocumentChanges', () => {
  it('does not report transactions tagged "local"', () => {
    const doc = new Y.Doc();
    const cb = vi.fn();
    const stop = observeDocumentChanges(doc, cb, false);
    doc.transact(() => doc.getText('t').insert(0, 'mine'), 'local');
    stop();
    expect(cb).not.toHaveBeenCalled();
  });

  it('reports untagged transactions straight away when batching is off', () => {
    const doc = new Y.Doc();
    const cb = vi.fn();
    const stop = observeDocumentChanges(doc, cb, false);
    doc.getText('t').insert(0, 'x');
    expect(cb).toHaveBeenCalledTimes(1);
    stop();
  });

  it('batches untagged transactions and flushes them on cleanup', () => {
    const doc = new Y.Doc();
    const cb = vi.fn();
    const stop = observeDocumentChanges(doc, cb, true);
    doc.getText('t').insert(0, 'a');
    doc.getText('t').insert(1, 'b');
    expect(cb).not.toHaveBeenCalled();
    stop();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  // Characterisation test, not an endorsement. Remote updates arrive with an
  // origin object from the provider. With batching on, the observer lets them
  // through (origin !== 'local') and then the batcher drops them (origin is
  // neither 'local' nor unset), so the callback never fires. See the roadmap.
  it('currently drops updates that carry a provider origin when batching is on', () => {
    const doc = new Y.Doc();
    const cb = vi.fn();
    const stop = observeDocumentChanges(doc, cb, true);
    doc.transact(() => doc.getText('t').insert(0, 'remote'), { provider: 'webrtc' });
    stop();
    expect(cb).not.toHaveBeenCalled();
  });

  it('with batching off the same provider-origin update is reported', () => {
    const doc = new Y.Doc();
    const cb = vi.fn();
    const stop = observeDocumentChanges(doc, cb, false);
    doc.transact(() => doc.getText('t').insert(0, 'remote'), { provider: 'webrtc' });
    stop();
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

describe('YjsTransactionBatcher', () => {
  it('runs queued operations inside a single transaction', () => {
    const doc = new Y.Doc();
    const updates: Uint8Array[] = [];
    doc.on('update', (u: Uint8Array) => updates.push(u));
    const batcher = new YjsTransactionBatcher(doc);

    batcher.queueOperation(() => doc.getText('t').insert(0, 'a'));
    batcher.queueOperation(() => doc.getText('t').insert(1, 'b'));
    batcher.queueOperation(() => doc.getText('t').insert(2, 'c'));
    expect(updates).toHaveLength(0);

    vi.advanceTimersByTime(50);
    expect(updates).toHaveLength(1);
    expect(doc.getText('t').toString()).toBe('abc');
  });

  it('keeps going when one queued operation throws', () => {
    const doc = new Y.Doc();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const batcher = new YjsTransactionBatcher(doc);
    batcher.queueOperation(() => doc.getText('t').insert(0, 'a'));
    batcher.queueOperation(() => {
      throw new Error('boom');
    });
    batcher.queueOperation(() => doc.getText('t').insert(1, 'c'));
    batcher.flush();
    expect(doc.getText('t').toString()).toBe('ac');
    spy.mockRestore();
  });
});

describe('debounce and throttle', () => {
  it('debounce calls once with the last arguments', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d(1);
    d(2);
    d(3);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('throttle fires on the leading edge and drops calls inside the window', () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t('a');
    t('b');
    t('c');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
    vi.advanceTimersByTime(100);
    t('d');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
