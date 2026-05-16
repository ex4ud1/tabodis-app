-- Public bucket for property photos
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Anyone reads, only authenticated write/update/delete
drop policy if exists "property images public read" on storage.objects;
create policy "property images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'property-images');

drop policy if exists "property images authed insert" on storage.objects;
create policy "property images authed insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'property-images');

drop policy if exists "property images authed update" on storage.objects;
create policy "property images authed update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'property-images')
  with check (bucket_id = 'property-images');

drop policy if exists "property images authed delete" on storage.objects;
create policy "property images authed delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images');
