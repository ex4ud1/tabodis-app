-- Audit follow-up hardening (2026-05-16).
-- 1) Storage: prevent listing the public bucket while keeping read-by-URL.
-- 2) Performance: cache auth.uid() per query in RLS policies.
-- 3) Performance: cover the foreign keys that were flagged as unindexed.
-- 4) Audit trail: add updated_at to leads/reviews and wire the existing trigger.
--
-- After this migration the public.set_updated_at() function references
-- public.workspace_members in the helper functions (migration 0004) — the
-- triggers below also need search_path='' for the same security reason.

-- ─── 1. Storage hardening ─────────────────────────────────────────────────────
-- Drop the overly broad SELECT policy. Public bucket reads by URL go through
-- /storage/v1/object/public/property-images/* which serves objects by bucket-id
-- without consulting RLS, so direct image links keep working. The listing
-- endpoint (/storage/v1/object/list) does consult RLS, so without this policy
-- anon clients can no longer enumerate every file in the bucket.
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0025_public_bucket_allows_listing
drop policy if exists "property images public read" on storage.objects;

-- ─── 2. Auth RLS initplan — wrap auth.uid() in (select ...) ───────────────────
-- Postgres caches scalar SELECT results for the duration of the query plan, so
-- this stops auth.uid() being recomputed per row.
drop policy if exists "users read own membership" on workspace_members;
create policy "users read own membership"
  on workspace_members for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "members read workspace" on workspaces;
create policy "members read workspace"
  on workspaces for select
  to authenticated
  using (
    id in (select workspace_id from workspace_members where user_id = (select auth.uid()))
  );

drop policy if exists "owners update workspace" on workspaces;
create policy "owners update workspace"
  on workspaces for update
  to authenticated
  using (
    id in (
      select workspace_id from workspace_members
      where user_id = (select auth.uid()) and role = 'owner'
    )
  );

-- ─── 3. Cover unindexed foreign keys ──────────────────────────────────────────
create index if not exists leads_assigned_to_idx on leads(assigned_to);
create index if not exists workspace_members_user_id_idx on workspace_members(user_id);

-- ─── 4. updated_at on leads & reviews ─────────────────────────────────────────
alter table leads   add column if not exists updated_at timestamptz default now();
alter table reviews add column if not exists updated_at timestamptz default now();

drop trigger if exists trg_leads_updated on leads;
create trigger trg_leads_updated
  before update on leads
  for each row execute function set_updated_at();

drop trigger if exists trg_reviews_updated on reviews;
create trigger trg_reviews_updated
  before update on reviews
  for each row execute function set_updated_at();
