-- Pronunciation Recordings Migration
-- Creates tables for pronunciation practice with AI feedback

-- Create pronunciation_recordings table
create table public.pronunciation_recordings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  text text not null,
  audio_url text not null,
  duration_seconds real,
  ai_score integer check (ai_score >= 0 and ai_score <= 100),
  ai_feedback jsonb, -- { overall: string, strengths: string[], improvements: string[] }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.pronunciation_recordings enable row level security;

-- Policies
create policy "Users can view their own recordings"
  on public.pronunciation_recordings for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own recordings"
  on public.pronunciation_recordings for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own recordings"
  on public.pronunciation_recordings for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own recordings"
  on public.pronunciation_recordings for delete
  using ( auth.uid() = user_id );

-- Create index
create index idx_pronunciation_recordings_user_id on public.pronunciation_recordings(user_id);
create index idx_pronunciation_recordings_created_at on public.pronunciation_recordings(created_at desc);
