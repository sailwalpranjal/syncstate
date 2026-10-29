# SyncState

[![tests](https://github.com/sailwalpranjal/syncstate/actions/workflows/ci.yml/badge.svg)](https://github.com/sailwalpranjal/syncstate/actions/workflows/ci.yml)
[![licence: MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)

A collaborative document editor where the content lives in the browsers and merges by itself. You can keep typing offline; when you reconnect, your edits and everyone else's end up in the same document without a conflict dialog. Built on Yjs CRDTs, TipTap, WebRTC and IndexedDB.

**Live:** [syncstate.vercel.app](https://syncstate.vercel.app)

## Who it is for, and the problem

It is for a small group editing one document, where at least one person is sometimes offline. The usual model (a server holds the truth, you get a conflict if you diverge) loses work or interrupts people. I built this to see how far the other model goes: content on the clients, merging by CRDT. I have no usage data and I have not interviewed users, so treat "who it is for" as a hypothesis. The only users so far have been me and two browser windows.

## Demo

> Screenshot placeholder. To capture the interesting part: open the live site in two browser windows signed in as different users, put the same document in both, and take a 1440x900 screenshot with both cursors visible. Save as `docs/img/editor.png`. For a GIF: in DevTools set one window to Offline, type in both for about 5 seconds, set it back to Online, and record the texts merging with ScreenToGif at 12 fps. Save as `docs/img/offline-merge.gif`.

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in the Clerk and Supabase keys
npm run dev                    # http://localhost:3000
npm test                       # 34 tests, about 3 seconds
```

You need a Clerk application and a Supabase project. Run `supabase-schema.sql` in the Supabase SQL editor, and `supabase-versions-table.sql` if you want version history.

## How it works

```
 browser A                          browser B
 TipTap editor                      TipTap editor
     |                                  |
 Yjs document  <---- WebRTC ---->  Yjs document
     |        (peers find each other      |
 IndexedDB     via a signalling server)  IndexedDB

 Supabase: document titles, owners, collaborators, version snapshots
 Clerk:    sign-in; /dashboard and /editor are protected by middleware
```

Every edit is a Yjs update. Updates can arrive in any order, more than once, and still produce the same document. That property is what the app depends on, and it is what the tests check. Outgoing updates are merged in 50 ms windows (`src/lib/yjs/batching.ts`).

## Evidence

`npm test` runs 34 tests with vitest and fast-check:

- Two or three authors edit offline; their updates are replayed in different orders on fresh replicas, and the documents (text, array, map and state vector) must be identical. Includes concurrent inserts at the same index, delete versus insert inside the deleted range, and conflicting map writes.
- Property tests: 200 random concurrent edit histories delivered in two random orders, 100 delivered twice, 100 synced pairwise through state vectors.
- A negative control, so the comparisons can fail: a replica that misses one update must not match.
- The 50 ms batcher: merged updates reproduce the source document; flush and destroy; origin filtering.
- Presence helpers: stable colour per user, self excluded, incomplete records skipped.

CI runs the tests and `tsc --noEmit` on Node 20 and 22. The tests cover the CRDT layer and the helpers around it. They do not drive a browser; an end-to-end offline test is on the roadmap.

## Limits and known gaps

- **No server copy of live content.** If every peer is offline and browser storage is cleared, the document is gone.
- **Public signalling server by default** (`wss://signaling.yjs.dev`). It sees connection metadata, not content. Run your own for anything real.
- **Provider-origin updates are dropped by the batcher** when batching is on (`observeDocumentChanges`). A test records the behaviour; whether anything depends on it is an open question.
- **Console noise suppressed.** `src/lib/yjs/provider.ts` hides WebSocket errors and clears the console. It should be removed.
- **"No merge conflicts" has limits.** The text always converges, but convergence is not intent: two people rewriting the same sentence get both rewrites interleaved. For simple properties the last write wins.
- **Performance targets** (Lighthouse 95+, sub-millisecond CRDT operations, sub-500 ms WebRTC connection) are targets. I have not measured them.

## Roadmap and product thinking

- [Roadmap](docs/product/ROADMAP.md) (Now / Next / Later with RICE and ICE arithmetic)
- [PRD](docs/product/PRD.md), [decision log](docs/product/DECISIONS.md), [metrics plan](docs/product/METRICS.md)
- [Changelog](CHANGELOG.md), [project board setup](docs/project-board.md), [issue drafts](docs/issues/)

Features that exist today: rich text (headings, lists, tables, code blocks with highlighting, images, links, colours, alignment), presence with coloured cursors, automatic version snapshots with a 3D view, export to PDF, HTML, Markdown and plain text, dark and light themes, document templates, keyboard shortcuts.

Not built yet: comments, mentions, public share links, folders, full-text search, a mobile app.

## Tech stack

Next.js 15 (App Router), React 19, TypeScript; Yjs with `y-webrtc`, `y-websocket` and `y-indexeddb`; TipTap 2; Clerk; Supabase (Postgres); Tailwind CSS 3; Framer Motion; Three.js with react-three-fiber; jsPDF and html2canvas; vitest and fast-check for tests.

## Configuration

`.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_YJS_SIGNALING_SERVER=wss://signaling.yjs.dev   # use your own for real use
```

To run your own signalling server: `HOST=0.0.0.0 PORT=4444 npx y-websocket`, deploy it somewhere, and point `NEXT_PUBLIC_YJS_SIGNALING_SERVER` at it.

## Troubleshooting

- **WebSocket connection errors** to the signalling server mean peers cannot find each other; local editing and IndexedDB persistence still work. Run your own signalling server.
- **401 or 406 from `document_versions`** usually means the table is missing. Run `supabase-versions-table.sql`.
- **Duplicate Yjs room errors in development**: React Strict Mode is disabled on purpose.
- **Stuck local state**: DevTools, Application, IndexedDB, delete the database for the document.

## Deploying

Vercel works with no build changes. Set the environment variables above in the project settings.

## Licence

MIT, see [LICENSE](LICENSE).
