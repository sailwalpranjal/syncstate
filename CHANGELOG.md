# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow semantic versioning.

## [Unreleased]

## [0.2.0] - proposed tag `v0.2.0`

### Added
- Tests (vitest, fast-check): CRDT convergence under reordered and duplicated delivery, offline merge, random edit histories; update batching; presence helpers. 34 tests.
- CI workflow running the tests and the TypeScript check on Node 20 and 22.
- Issue and pull request templates, contributing, security and conduct files.
- Product documents under `docs/product/`.

### Changed
- README now states where version snapshots are stored and that the default signalling server is public.

## [0.1.0] - proposed tag `v0.1.0`

First version: TipTap editor on Yjs, WebRTC sync, IndexedDB persistence, presence, version history with a 3D view, export to PDF/HTML/Markdown/plain text, Clerk auth, Supabase metadata.
