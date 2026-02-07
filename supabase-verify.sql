-- Verification Script for SyncState
-- Run this in Supabase SQL Editor to verify your setup

-- 1. Check if tables exist
SELECT
    'documents' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'documents'
    ) as exists;

SELECT
    'document_collaborators' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'document_collaborators'
    ) as exists;

SELECT
    'document_versions' as table_name,
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'document_versions'
    ) as exists;

-- 2. Check documents count
SELECT COUNT(*) as total_documents FROM documents;

-- 3. Check versions count
SELECT COUNT(*) as total_versions FROM document_versions;

-- 4. View all documents with their version counts
SELECT
    d.id,
    d.title,
    d.owner_id,
    d.created_at,
    d.updated_at,
    COUNT(dv.id) as version_count
FROM documents d
LEFT JOIN document_versions dv ON d.id = dv.document_id
GROUP BY d.id, d.title, d.owner_id, d.created_at, d.updated_at
ORDER BY d.updated_at DESC;

-- 5. View all versions
SELECT
    dv.id,
    dv.document_id,
    d.title as document_title,
    dv.timestamp,
    dv.author,
    dv.message,
    dv.parent_id
FROM document_versions dv
JOIN documents d ON d.id = dv.document_id
ORDER BY dv.timestamp DESC;
