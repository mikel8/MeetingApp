-- Create table public.meetings
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled meeting',
  created_at timestamptz not null default now(),
  status text not null default 'created',
  duration_seconds integer,
  summary text,
  transcript text
);

-- Create table public.meeting_artifacts
create table if not exists public.meeting_artifacts (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  storage_bucket text not null default 'meeting-media',
  storage_path text not null,
  mime_type text,
  bytes bigint,
  created_at timestamptz not null default now()
);

-- Add indexes
create index if not exists meetings_owner_date_idx on public.meetings (owner_id, created_at desc);
create index if not exists meeting_artifacts_meeting_date_idx on public.meeting_artifacts (meeting_id, created_at desc);

-- Enable RLS
alter table public.meetings enable row level security;
alter table public.meeting_artifacts enable row level security;

-- Policies for meetings
drop policy if exists "Users can select their own meetings" on public.meetings;
create policy "Users can select their own meetings" on public.meetings
  for select using (auth.uid() = owner_id);

drop policy if exists "Users can insert their own meetings" on public.meetings;
create policy "Users can insert their own meetings" on public.meetings
  for insert with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own meetings" on public.meetings;
create policy "Users can update their own meetings" on public.meetings
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete their own meetings" on public.meetings;
create policy "Users can delete their own meetings" on public.meetings
  for delete using (auth.uid() = owner_id);

-- Policies for meeting_artifacts
drop policy if exists "Users can select their own artifacts" on public.meeting_artifacts;
create policy "Users can select their own artifacts" on public.meeting_artifacts
  for select using (auth.uid() = owner_id);

drop policy if exists "Users can insert their own artifacts" on public.meeting_artifacts;
create policy "Users can insert their own artifacts" on public.meeting_artifacts
  for insert with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own artifacts" on public.meeting_artifacts;
create policy "Users can update their own artifacts" on public.meeting_artifacts
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete their own artifacts" on public.meeting_artifacts;
create policy "Users can delete their own artifacts" on public.meeting_artifacts
  for delete using (auth.uid() = owner_id);
