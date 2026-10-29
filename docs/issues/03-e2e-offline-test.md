# End-to-end test: edit offline in one browser, converge with another

**Labels:** type:feature, priority:P1, area:sync

## Problem

The CRDT layer is tested; the browser flow (editor, IndexedDB, WebRTC, reconnect) is not. The headline promise of the app is untested at that level.

## Acceptance criteria

- [ ] A Playwright test opens the same document in two browser contexts.
- [ ] It sets one context offline, types in both, brings it back online, and waits for sync.
- [ ] Both editors show identical text and the text contains both edits.
- [ ] The test runs in CI, using a local signalling server rather than the public one.
