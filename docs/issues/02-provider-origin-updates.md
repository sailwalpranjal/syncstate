# Decide what to do with provider-origin updates in the batcher

**Labels:** type:bug, priority:P1, area:sync

## Problem

`observeDocumentChanges` (batching on) forwards updates whose origin is not `'local'` to `YjsUpdateBatcher.addUpdate`, which drops every origin other than `'local'` or unset. A remote update tagged with a provider object therefore never reaches the callback. `tests/batching.test.ts` records this as current behaviour.

## Acceptance criteria

- [ ] Write down which updates the callback is meant to see (local only, remote only, or both).
- [ ] The code and the characterisation tests in `tests/batching.test.ts` are changed to match that decision.
- [ ] A test applies an update from a second `Y.Doc` using `Y.applyUpdate(doc, update, provider)` and asserts whether the callback fires.
