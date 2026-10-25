-- Clients and projects. Must run before tasks, time entries, and invoices.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'lead' check (status in ('lead', 'active', 'archived')),
  company text,
  industry text,
  email text,
  phone text,
  website text,
  address text,
  country text,
  vat_number text,
  total_billed numeric(12,2) not null default 0,
  last_contact timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users can view own clients"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "Users can insert own clients"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own clients"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "Users can delete own clients"
  on public.clients for delete
  using (auth.uid() = user_id);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  description text not null default '',
  status text not null default 'proposal'
    check (status in ('proposal', 'active', 'on_hold', 'review', 'completed', 'archived', 'draft')),
  progress numeric(5,2) not null default 0,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  category text,
  color text,
  value numeric(12,2) not null default 0,
  budget numeric(12,2) not null default 0,
  currency text not null default 'GBP',
  estimated_hours numeric(10,2) not null default 0,
  actual_hours numeric(10,2) not null default 0,
  profit_margin numeric(5,2) not null default 0,
  start_date date,
  due_date date,
  completed_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);