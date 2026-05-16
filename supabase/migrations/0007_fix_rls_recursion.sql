-- Recursive RLS policies that triggered "infinite recursion detected in
-- policy for relation workspace_members". Drop them; admin reads/writes
-- now use service-role client which bypasses RLS, public reads use the
-- already-existing public policies (live properties, approved reviews).

drop policy if exists "owners manage team" on public.workspace_members;
drop policy if exists "members read workspace properties" on public.properties;
drop policy if exists "members manage workspace properties" on public.properties;
drop policy if exists "members read workspace leads" on public.leads;
drop policy if exists "members update workspace leads" on public.leads;
drop policy if exists "members read workspace reviews" on public.reviews;
drop policy if exists "members update workspace reviews" on public.reviews;
