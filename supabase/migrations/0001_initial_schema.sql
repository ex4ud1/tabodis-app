-- Workspaces (multi-tenant ready)
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text check (role in ('owner', 'agent', 'viewer')) default 'agent',
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- Properties
create table properties (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  slug text not null,
  title text not null,
  description text,
  price numeric not null,
  type text check (type in ('venta', 'alquiler', 'lujo')) not null,
  city text not null,
  loc text not null,
  address text,
  lat numeric,
  lng numeric,
  bedrooms int default 0,
  bathrooms int default 0,
  m2 int default 0,
  features text[] default '{}',
  images jsonb default '[]'::jsonb,
  meta_title text,
  meta_desc text,
  status text check (status in ('draft', 'live', 'review', 'archived')) default 'draft',
  featured boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(workspace_id, slug)
);
create index properties_status_city_idx on properties(status, city);
create index properties_slug_idx on properties(slug);
create index properties_workspace_status_idx on properties(workspace_id, status);

-- Leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  services text[] default '{}',
  budget numeric,
  urgency text,
  contact_methods text[] default '{}',
  message text,
  language text default 'es',
  source text default 'web',
  status text check (status in ('new', 'contacted', 'qualified', 'closed')) default 'new',
  assigned_to uuid references auth.users(id),
  created_at timestamptz default now()
);
create index leads_workspace_status_idx on leads(workspace_id, status, created_at desc);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  author_name text not null,
  city text,
  rating int check (rating between 1 and 5) not null,
  services text[] default '{}',
  body text not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz default now()
);
create index reviews_workspace_status_idx on reviews(workspace_id, status, created_at desc);

-- updated_at trigger
create or replace function set_updated_at() returns trigger as $$
  begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_properties_updated before update on properties
  for each row execute function set_updated_at();
