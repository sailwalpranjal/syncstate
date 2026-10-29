# Decision log

Decisions visible in the code. I did not date them at the time.

## 1. Yjs instead of a custom CRDT

**Context.** Merging concurrent edits is the whole point of the app.
**Options.** Write my own text CRDT; use Automerge; use Yjs.
**Decision.** Yjs, with TipTap's collaboration extensions (`y-prosemirror`) binding it to the editor.
**Consequences.** I get a mature, fast implementation and ready-made providers (WebRTC, WebSocket, IndexedDB). I do not control the merge algorithm, so my tests check the properties I rely on (convergence, idempotence, order independence) rather than the algorithm.

## 2. Content on the clients, metadata on the server

**Context.** I wanted offline-first behaviour and I did not want to run a document server.
**Options.** Store content in Postgres and sync through it; keep content in browsers and sync peer to peer; both.
**Decision.** Content lives in IndexedDB and moves between peers over WebRTC; Supabase holds titles, owners and collaborators (`supabase-schema.sql`).
**Consequences.** Works offline and costs almost nothing to host. The trade-offs are that nothing on a server holds the live document, and that version history (decision 5) breaks the "metadata only" rule.

## 3. WebRTC first, WebSocket optional

**Context.** Peer-to-peer gives low latency without a relay.
**Options.** WebSocket relay only; WebRTC only; WebRTC with an optional WebSocket provider.
**Decision.** `initializeYjsDocument` always starts WebRTC (up to 20 connections) and adds a WebSocket provider only when asked.
**Consequences.** No relay to run, but peers need a signalling server to find each other, and the default is a public one. NAT traversal depends on public STUN servers.

## 4. Clerk for authentication, Supabase for data

**Context.** I wanted hosted auth without building it, and a managed Postgres.
**Options.** Supabase Auth for both; Clerk for auth and Supabase for data.
**Decision.** Clerk guards `/dashboard` and `/editor` in `middleware.ts`; Supabase stores metadata.
**Consequences.** Two vendors to set up, and the Clerk identity has to be passed through to Supabase for row policies to use it. That wiring is not finished.

## 5. Version snapshots as full Yjs state

**Context.** Version history needs something to restore from.
**Options.** Store diffs; store full state snapshots; use Yjs snapshots with garbage collection off.
**Decision.** `createVersionSnapshot` encodes the whole document with `Y.encodeStateAsUpdate` and stores it as base64 in `document_versions`.
**Consequences.** Simple to write and restore. Storage grows with every snapshot, and the table holds document content on the server, which contradicts decision 2.

## 6. Batch outgoing updates in 50 ms windows

**Context.** Fast typing produces many tiny updates.
**Options.** Send each update; debounce; merge updates in a window.
**Decision.** `YjsUpdateBatcher` merges pending updates with `Y.mergeUpdates` every 50 ms.
**Consequences.** Fewer messages. The merged update reproduces the same document (tested). A side effect I did not intend is recorded in `tests/batching.test.ts`: provider-origin updates are dropped by the batcher.
