# Security policy

## Supported versions

Only the latest commit on the default branch.

## Reporting a vulnerability

Please email pranjalsailwal09@gmail.com with the subject line "SyncState security". Include what you found, how to reproduce it, and the version or commit.

I will reply within a week to confirm I have seen it. This is a one-person project, so I cannot promise a fix timeline, but I will tell you where it stands. Please do not open a public issue until we have talked.

## Scope

The Next.js app, the Clerk and Supabase integration, and the way documents sync between peers. By default peers meet through a public signalling server, which sees connection metadata but not document content. Keys belong in `.env.local`, which is git-ignored.

Report issues privately by email.
