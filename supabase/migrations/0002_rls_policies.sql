-- Enable RLS on all tables
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table properties enable row level security;
alter table leads enable row level security;
alter table reviews enable row level security;

-- Helper function: is user member of workspace?
create or replace function is_workspace_member(ws_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$;

-- Helper: get user's first workspace_id
create or replace function current_workspace_id()
returns uuid
language sql
security definer
stable
as $$
  select workspace_id from workspace_members
  where user_id = auth.uid()
  order by created_at asc
  limit 1;
$$;

-- WORKSPACES policies
create policy "members can read their workspaces"
  on workspaces for select
  using (is_workspace_member(id));

create policy "owners can update their workspaces"
  on workspaces for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspaces.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

-- WORKSPACE_MEMBERS policies
create policy "members can read their team"
  on workspace_members for select
  using (is_workspace_member(workspace_id));

create policy "owners can manage team"
  on workspace_members for all
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role = 'owner'
    )
  );

-- PROPERTIES policies
-- Public can read live properties (anon role)
create policy "public can read live properties"
  on properties for select
  to anon, authenticated
  using (status = 'live');

-- Members can read all their workspace properties (incl drafts)
create policy "members can read workspace properties"
  on properties for select
  to authenticated
  using (is_workspace_member(workspace_id));

-- Members can insert/update/delete properties in their workspace
create policy "members can manage workspace properties"
  on properties for all
  to authenticated
  using (is_workspace_member(workspace_id))
  with check (is_workspace_member(workspace_id));

-- LEADS policies
-- Anyone (anon) can submit a lead
create policy "anyone can submit lead"
  on leads for insert
  to anon, authenticated
  with check (true);

-- Workspace members can read/update leads
create policy "members can read workspace leads"
  on leads for select
  to authenticated
  using (workspace_id is null or is_workspace_member(workspace_id));

create policy "members can update workspace leads"
  on leads for update
  to authenticated
  using (workspace_id is null or is_workspace_member(workspace_id));

-- REVIEWS policies
-- Anyone can submit (status defaults to 'pending')
create policy "anyone can submit review"
  on reviews for insert
  to anon, authenticated
  with check (status = 'pending');

-- Public can read approved reviews
create policy "public can read approved reviews"
  on reviews for select
  to anon, authenticated
  using (status = 'approved');

-- Members read all reviews (incl pending)
create policy "members can read workspace reviews"
  on reviews for select
  to authenticated
  using (workspace_id is null or is_workspace_member(workspace_id));

-- Members can update review status
create policy "members can update workspace reviews"
  on reviews for update
  to authenticated
  using (workspace_id is null or is_workspace_member(workspace_id));
