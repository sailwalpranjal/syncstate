# Contributing to SyncState

This is a personal project that I maintain on my own, so reviews are not instant. Small, focused changes get merged fastest.

## Before you start

For anything larger than a typo or a one-line fix, open an issue first using the feature request template. It asks for the problem and the acceptance criteria. That conversation is cheaper than a rejected pull request.

## Local setup

```
npm install
cp .env.example .env.local   # then fill in the Clerk and Supabase keys
```

## Running the tests

```
npm test
```

Please run them before you push. CI runs the same command.

## Pull requests

- Branch from the default branch and keep the change to one idea.
- Write commit messages in the imperative: "fix off-by-one in window sizing", not "fixed bug".
- If you change a number quoted in the README or in `docs/`, say where the new number came from.
- Add an entry to `CHANGELOG.md` under Unreleased.

## Reporting security problems

Do not open a public issue. See [SECURITY.md](SECURITY.md).
