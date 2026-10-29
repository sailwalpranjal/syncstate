-- Row-level security for SyncState.
--
-- Expects requests to carry a Clerk session token that Supabase accepts (third-party auth),
-- so that auth.jwt() ->> 'sub' is the Clerk user id and the role claim is 'authenticated'.
-- Apply it only once the client sends that token, otherwise every request is refused.
-- Safe to run more than once.

create schema if not exists private;
grant usage on schema private to authenticated;

-- Helper functions run as their owner so policies on one table can look at another
-- without recursing into that table's own policies.
create or replace function private.uid() returns text
language sql stable as $$ select auth.jwt() ->> 'sub' $$;

create or replace function private.is_owner(doc uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from documents d where d.id = doc and d.owner_id = private.uid())
$$;

create or replace function private.is_member(doc uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select private.is_owner(doc)
      or exists (select 1 from document_collaborators c
                 where c.document_id = doc and c.user_id = private.uid())
$$;

create or replace function private.can_write(doc uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select private.is_owner(doc)
      or exists (select 1 from document_collaborators c
                 where c.document_id = doc and c.user_id = private.uid()
                   and c.permission in ('write', 'admin'))
$$;

grant execute on function private.uid(), private.is_owner(uuid), private.is_member(uuid),
  private.can_write(uuid) to authenticated;

-- Tables
alter table documents enable row level security;
alter table document_collaborators enable row level security;
do $$ begin
  if to_regclass('public.document_versions') is not null then
    execute 'alter table document_versions enable row level security';
  end if;
end $$;

revoke all on documents, document_collaborators from anon;
do $$ begin
  if to_regclass('public.document_versions') is not null then
    execute 'revoke all on document_versions from anon';
  end if;
end $$;

-- Remove earlier policies by name so the ones below are the only ones in force.
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('documents', 'document_collaborators', 'document_versions')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- documents: the owner and collaborators
create policy documents_select on documents for select to authenticated
  using (private.is_member(id));
create policy documents_insert on documents for insert to authenticated
  with check (owner_id = private.uid());
create policy documents_update on documents for update to authenticated
  using (owner_id = private.uid()) with check (owner_id = private.uid());
create policy documents_delete on documents for delete to authenticated
  using (owner_id = private.uid());

-- document_collaborators: visible to members, managed by the owner
create policy collaborators_select on document_collaborators for select to authenticated
  using (private.is_member(document_id));
create policy collaborators_insert on document_collaborators for insert to authenticated
  with check (private.is_owner(document_id));
create policy collaborators_update on document_collaborators for update to authenticated
  using (private.is_owner(document_id)) with check (private.is_owner(document_id));
create policy collaborators_delete on document_collaborators for delete to authenticated
  using (private.is_owner(document_id));

-- document_versions: members read, writers add their own, the owner deletes. No updates.
do $$ begin
  if to_regclass('public.document_versions') is not null then
    execute $p$create policy versions_select on document_versions for select to authenticated
      using (private.is_member(document_id))$p$;
    execute $p$create policy versions_insert on document_versions for insert to authenticated
      with check (private.can_write(document_id) and author_id = private.uid())$p$;
    execute $p$create policy versions_delete on document_versions for delete to authenticated
      using (private.is_owner(document_id))$p$;
  end if;
end $$;
