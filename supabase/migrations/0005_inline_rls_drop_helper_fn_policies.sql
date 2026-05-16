-- The previous policies invoked helper SECURITY DEFINER functions that had
-- their EXECUTE permission revoked from authenticated. RLS expressions need
-- the function to be callable by the role evaluating them, so policies were
-- effectively returning NULL → no rows visible. Replace with inline checks.

drop policy if exists "members can read their team" on workspace_members;
create policy "users read own membership"
  on workspace_members for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "owners can manage team" on workspace_members;
create policy "owners manage team"
  on workspace_members for all
  to authenticated
  using (
    workspace_id in (
      select wm.workspace_id from workspace_members wm
      where wm.user_id = auth.uid() and wm.role = 'owner'
    )
  )
  with check (
    workspace_id in (
      select wm.workspace_id from workspace_members wm
      where wm.user_id = auth.uid() and wm.role = 'owner'
    )
  );

drop policy if exists "members can read their workspaces" on workspaces;
create policy "members read workspace"
  on workspaces for select
  to authenticated
  using (
    id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

drop policy if exists "owners can update their workspaces" on workspaces;
create policy "owners update workspace"
  on workspaces for update
  to authenticated
  using (
    id in (
      select workspace_id from workspace_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- properties
drop policy if exists "members can read workspace properties" on properties;
create policy "members read workspace properties"
  on properties for select
  to authenticated
  using (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

drop policy if exists "members can manage workspace properties" on properties;
create policy "members manage workspace properties"
  on properties for all
  to authenticated
  using (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  )
  with check (
    workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

-- leads
drop policy if exists "members can read workspace leads" on leads;
create policy "members read workspace leads"
  on leads for select
  to authenticated
  using (
    workspace_id is null
    or workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

drop policy if exists "members can update workspace leads" on leads;
create policy "members update workspace leads"
  on leads for update
  to authenticated
  using (
    workspace_id is null
    or workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

-- reviews
drop policy if exists "members can read workspace reviews" on reviews;
create policy "members read workspace reviews"
  on reviews for select
  to authenticated
  using (
    workspace_id is null
    or workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );

drop policy if exists "members can update workspace reviews" on reviews;
create policy "members update workspace reviews"
  on reviews for update
  to authenticated
  using (
    workspace_id is null
    or workspace_id in (select workspace_id from workspace_members where user_id = auth.uid())
  );
