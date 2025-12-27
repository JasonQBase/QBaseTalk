-- Create custom types
create type difficulty_level as enum ('Beginner', 'Intermediate', 'Advanced', 'Fluent');
create type conversation_speaker as enum ('user', 'ai');

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS EXTENDED TABLE
create table public.users_extended (
  id uuid references auth.users not null primary key,
  full_name text,
  level difficulty_level default 'Beginner',
  avatar_url text,
  current_streak integer default 0,
  total_xp integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for users_extended
alter table public.users_extended enable row level security;

create policy "Users can view their own profile"
  on public.users_extended for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.users_extended for update
  using ( auth.uid() = id );

-- Trigger to create user_extended profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_extended (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- PRACTICE SESSIONS TABLE
create table public.practice_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  scenario text not null,
  duration_seconds integer default 0,
  vocab_score integer,
  pronunciation_score integer,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.practice_sessions enable row level security;

create policy "Users can view their own sessions"
  on public.practice_sessions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own sessions"
  on public.practice_sessions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own sessions"
  on public.practice_sessions for update
  using ( auth.uid() = user_id );


-- CONVERSATIONS TABLE
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.practice_sessions(id) not null,
  user_id uuid references public.users_extended(id) not null,
  speaker conversation_speaker not null,
  message text not null,
  audio_url text,
  has_error boolean default false,
  correction text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.conversations enable row level security;

create policy "Users can view their own conversations"
  on public.conversations for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own conversations"
  on public.conversations for insert
  with check ( auth.uid() = user_id );


-- VOCABULARY WORDS TABLE
create table public.vocabulary_words (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  word text not null,
  pronunciation text,
  meaning text,
  example text,
  category text,
  difficulty difficulty_level default 'Beginner',
  learned boolean default false,
  favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vocabulary_words enable row level security;

create policy "Users can CRUD their own vocabulary"
  on public.vocabulary_words for all
  using ( auth.uid() = user_id );


-- ACHIEVEMENTS TABLE
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  badge_id text not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.achievements enable row level security;

create policy "Users can view their own achievements"
  on public.achievements for select
  using ( auth.uid() = user_id );


-- LEARNING GOALS TABLE
create table public.learning_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  daily_practice_minutes integer default 15,
  notification_enabled boolean default true,
  weekly_reports_enabled boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

alter table public.learning_goals enable row level security;

create policy "Users can CRUD their own goals"
  on public.learning_goals for all
  using ( auth.uid() = user_id );
