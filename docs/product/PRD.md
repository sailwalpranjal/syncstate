# PRD: SyncState

**Status:** Retrospective PRD, written after the build. It describes what the app is for today and where it falls short, not requirements gathered before I started.

## Problem

Shared documents usually assume you are online and that a server is the source of truth. Two people editing the same paragraph on a train, or one person on flaky wifi, either lose work or get a "conflict" dialog. I wanted to see how far a document editor can go with the content living on the clients and merging automatically.

## Target user

Primary user: a small group (two to a handful of people) editing one document together, where at least one of them is sometimes offline. I have not interviewed anyone and I have no usage data, so this is a hypothesis about a user, not a description of one. In practice the first user was me, testing with two browser windows.

## Jobs to be done

- When I lose my connection mid-edit, I want to keep typing and have my changes merge later, so that I do not lose work or have to resolve conflicts by hand.
- When someone else is editing the same document, I want to see where their cursor is, so that we do not write over the same sentence.
- When I want to go back, I want to see earlier versions of the document, so that a bad edit is recoverable.

## Goals

1. Edits made offline merge without manual conflict resolution.
2. Two replicas that have seen the same edits are identical, whatever order they arrived in (checked by `tests/crdt-convergence.test.ts`).
3. Document content lives on clients; the server stores metadata.
4. Rich-text editing with export to PDF, HTML, Markdown and plain text.

## Non-goals

- Commenting, mentions and public share links (all on the roadmap, none built).
- Being a drop-in replacement for any existing editor.
- End-to-end encryption.

## User stories and acceptance criteria

| Story | Acceptance criteria |
|---|---|
| As an editor I can keep writing while offline. | With the network off, typing still works; after reconnect the other replica shows the same text. Convergence is covered by property tests; the browser flow has not been automated |
| As an editor I can see who else is in the document. | Active users and cursors appear with a colour that is stable per user id (`generateUserColor`, tested) |
| As an editor I can open a version from earlier. | A snapshot is created automatically and listed; restoring one writes it back into the document |
| As an owner I can export the document. | PDF, HTML, Markdown and plain text exports are available from the toolbar |

## Success metrics

No usage exists, so these are plans plus the one thing that is measured.

- North star (proposed): documents edited by two or more people in the same week. Not measured.
- Input metrics (proposed): share of editing sessions that include an offline period; share of reconnects that end with identical documents on both sides.
- Guardrail (measured today): the CRDT convergence property tests pass in CI (34 tests, including 200 random edit histories).

See [METRICS.md](METRICS.md).

## Risks and open questions

- **No server copy of live content.** If every peer is offline and browser storage is cleared, the document is gone. Open question: add an optional server-side persistence provider.
- **Public signalling server.** Peers find each other through `wss://signaling.yjs.dev` by default. It sees connection metadata, not content, but it is a dependency I do not control.
- **Remote updates and batching.** `observeDocumentChanges` with batching on drops updates whose origin is a provider object (a characterisation test records this). Open question: whether anything relies on that path.
