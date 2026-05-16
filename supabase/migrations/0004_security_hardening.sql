-- Fix: function_search_path_mutable + revoke from public/anon
create or replace function set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
  begin new.updated_at = now(); return new; end;
$$;

create or replace function is_workspace_member(ws_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$;

create or replace function current_workspace_id()
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select workspace_id from public.workspace_members
  where user_id = auth.uid()
  order by created_at asc
  limit 1;
$$;

-- Revoke direct RPC access — these are helpers used by RLS, not public API
revoke execute on function is_workspace_member(uuid) from public, anon, authenticated;
revoke execute on function current_workspace_id() from public, anon, authenticated;

-- Tighten leads insert: must have email and name, body limits
drop policy if exists "anyone can submit lead" on leads;
create policy "anyone can submit lead"
  on leads for insert
  to anon, authenticated
  with check (
    name is not null and length(trim(name)) > 0
    and email is not null and email like '%_@_%.__%'
    and length(coalesce(message, '')) <= 5000
  );

-- Tighten reviews insert similarly
drop policy if exists "anyone can submit review" on reviews;
create policy "anyone can submit review"
  on reviews for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and rating between 1 and 5
    and author_name is not null and length(trim(author_name)) > 0
    and body is not null and length(body) between 10 and 2000
  );
