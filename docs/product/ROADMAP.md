# Roadmap

Scores are my own judgement. RICE = Reach x Impact x Confidence / Effort. Reach is on a 1-10 scale, Impact is 0.25 / 0.5 / 1 / 2 / 3, Confidence is a fraction, Effort is person-weeks. ICE = (Impact + Confidence + Ease) / 3, each out of 10.

## Now

| Item | Why | Score (my judgement) |
|---|---|---|
| Decide what `observeDocumentChanges` should do with provider-origin updates | With batching on they are dropped; a test records this as current behaviour | ICE: (5 + 8 + 8) / 3 = **7.0** |
| Add a Playwright test: two browsers, one goes offline, both end identical | The browser flow is untested; only the CRDT layer is | RICE: 6 x 2 x 0.6 / 2 = **3.6** |
| Remove the console-cleaning code in `provider.ts` | It hides WebSocket errors and prints a reassuring message regardless of state | ICE: (4 + 9 + 9) / 3 = **7.3** |

## Next

| Item | Why | Score (my judgement) |
|---|---|---|
| Optional server-side persistence provider | Without it, all-peers-offline plus cleared storage means data loss | RICE: 6 x 2 x 0.6 / 3 = **2.4** |
| Self-hosted signalling server, documented | The default public server is a single dependency I do not control | RICE: 5 x 1 x 0.8 / 1 = **4.0** |
| Comments and mentions | The most requested feature in my own backlog | RICE: 5 x 1 x 0.5 / 4 = **0.6** |

## Later

| Item | Why | Score (my judgement) |
|---|---|---|
| Public share links | Needs a permission model first | ICE: (6 + 5 + 3) / 3 = **4.7** |
| Folders and full-text search | Convenience | ICE: (4 + 5 + 4) / 3 = **4.3** |
| Mobile app | Large effort, no evidence of need | ICE: (4 + 2 + 1) / 3 = **2.3** |
