create table if not exists public.extension_pair_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  code text not null,
  refresh_token text not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  consumed boolean default false
);

alter table public.extension_pair_codes enable row level security;

-- Policies

-- Users can insert their own code (and the refresh token they hold)
create policy "Users can insert own pair codes"
  on public.extension_pair_codes
  for insert
  with check (auth.uid() = user_id);

-- Users can view their own pair codes (to show the code in UI)
create policy "Users can view own pair codes"
  on public.extension_pair_codes
  for select
  using (auth.uid() = user_id);

-- No update policy needed for user; only the server updates 'consumed'
-- No delete policy needed; let them expire or be cleaned up
