-- Disable RLS temporarily to work with Clerk authentication
-- This allows the anon key to access the tables

ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_collaborators DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('documents', 'document_collaborators');
