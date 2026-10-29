# Metrics

SyncState has no recorded usage. This is the plan for finding out whether it works for anyone but me. Nothing here has been measured.

## Questions

1. Do people actually edit together, or mostly alone?
2. How often does an offline period end with both sides identical?
3. Do people use version history?

## Events to add

Document content must never be sent. Events carry ids and counts only.

| Event | Properties | Question |
|---|---|---|
| `doc_opened` | `doc_id_hash`, `peers_at_open` | 1 |
| `peer_count_changed` | `doc_id_hash`, `peers` | 1 |
| `offline_period` | `doc_id_hash`, `seconds`, `local_updates` | 2 |
| `reconnect_checked` | `doc_id_hash`, `state_vectors_equal` (compare hashes of both state vectors after sync) | 2 |
| `version_opened` | `doc_id_hash`, `age_minutes` | 3 |
| `export_used` | `format` | features |

## Queries

```sql
-- documents with at least two people editing in the same week
SELECT date_trunc('week', ts) AS week,
       COUNT(DISTINCT doc_id_hash) AS shared_docs
FROM events
WHERE name = 'peer_count_changed' AND peers >= 2
GROUP BY week
ORDER BY week;

-- how often a reconnect ends with matching state
SELECT AVG(state_vectors_equal::int) AS converged_share
FROM events
WHERE name = 'reconnect_checked';
```

## Guardrail that exists today

`npm test` runs 34 tests, including property-based tests over random concurrent edit histories. They run in CI on every push.
