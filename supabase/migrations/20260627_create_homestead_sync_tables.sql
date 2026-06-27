-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  sync_enabled boolean default false,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  account_upgrade_status text default 'anonymous'
);

-- Create homestead_plans table
create table if not exists public.homestead_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  module_key text not null,
  plan_data jsonb not null default '{}',
  updated_at timestamp with time zone default now(),
  sync_updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone,
  schema_version integer default 1,
  unique (user_id, module_key)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.homestead_plans enable row level security;

-- Policies for public.profiles
create policy "Allow users to read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Allow users to insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Policies for public.homestead_plans
create policy "Allow users to read their own plans"
  on public.homestead_plans for select
  using (auth.uid() = user_id);

create policy "Allow users to insert their own plans"
  on public.homestead_plans for insert
  with check (auth.uid() = user_id);

create policy "Allow users to update their own plans"
  on public.homestead_plans for update
  using (auth.uid() = user_id);

create policy "Allow users to delete their own plans"
  on public.homestead_plans for delete
  using (auth.uid() = user_id);

-- Profile trigger on auth.users creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, account_upgrade_status)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'display_name', 'Homesteader'), 
    case when new.email is null then 'anonymous' else 'upgraded' end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
