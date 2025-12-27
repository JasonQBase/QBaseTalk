-- Story Reading System Migration
-- Creates tables for AI-generated stories with vocabulary tracking and comprehension

-- Create stories table
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  title text not null,
  content text not null,
  difficulty difficulty_level not null,
  topic text,
  word_count integer not null,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed boolean default false,
  comprehension_score integer,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create story vocabulary table
create table public.story_vocabulary (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  word text not null,
  definition text not null,
  context text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.stories enable row level security;
alter table public.story_vocabulary enable row level security;

-- Policies for stories
create policy "Users can view their own stories"
  on public.stories for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own stories"
  on public.stories for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own stories"
  on public.stories for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own stories"
  on public.stories for delete
  using ( auth.uid() = user_id );

-- Policies for story vocabulary
create policy "Users can view story vocabulary"
  on public.story_vocabulary for select
  using (
    exists (
      select 1 from public.stories
      where id = story_id and user_id = auth.uid()
    )
  );

create policy "Users can insert story vocabulary"
  on public.story_vocabulary for insert
  with check (
    exists (
      select 1 from public.stories
      where id = story_id and user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
create index idx_stories_user_id on public.stories(user_id);
create index idx_stories_difficulty on public.stories(difficulty);
create index idx_story_vocabulary_story_id on public.story_vocabulary(story_id);
