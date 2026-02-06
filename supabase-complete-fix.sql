-- Complete SyncState Database Setup
-- Run this ENTIRE file in Supabase SQL Editor

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.document_collaborators CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;

-- Create documents table
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create document_collaborators table
CREATE TABLE public.document_collaborators (
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  permission TEXT NOT NULL DEFAULT 'read',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (document_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_documents_owner ON public.documents(owner_id);
CREATE INDEX idx_documents_updated ON public.documents(updated_at DESC);
CREATE INDEX idx_collaborators_user ON public.document_collaborators(user_id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- DISABLE RLS (since we're using Clerk, not Supabase Auth)
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collaborators DISABLE ROW LEVEL SECURITY;

-- Verify everything was created
SELECT
  'documents' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'documents' AND table_schema = 'public'
UNION ALL
SELECT
  'document_collaborators' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'document_collaborators' AND table_schema = 'public';

-- Show RLS status (should be disabled)
SELECT
  tablename,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('documents', 'document_collaborators')
ORDER BY tablename;
