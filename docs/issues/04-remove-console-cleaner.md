# Remove the console-cleaning code

**Labels:** type:chore, priority:P1, area:sync

## Problem

`setupConsoleCleaner` in `src/lib/yjs/provider.ts` swallows WebSocket errors, clears the console every few seconds and prints "App working perfectly". That hides real connection failures from the developer and from bug reports.

## Acceptance criteria

- [ ] The function and its call site are removed.
- [ ] A short status line (connected, number of peers, last error) is shown through the existing `ConnectionStatus` component instead.
- [ ] README troubleshooting no longer tells people to ignore WebSocket errors.
