-- Daily Challenges System Migration
-- Creates tables and policies for daily challenges with streak tracking

-- Create daily_challenges table
create table public.daily_challenges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  challenge_date date not null,
  challenge_type text not null, -- 'vocab_quiz', 'pronunciation', 'conversation', 'grammar'
  difficulty difficulty_level not null,
  content jsonb not null, -- Challenge specific data (questions, words, etc.)
  completed boolean default false,
  score integer,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, challenge_date)
);

-- Enable RLS
alter table public.daily_challenges enable row level security;

-- Policies for daily_challenges
create policy "Users can view their own challenges"
  on public.daily_challenges for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own challenges"
  on public.daily_challenges for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own challenges"
  on public.daily_challenges for update
  using ( auth.uid() = user_id );

-- Add streak tracking columns to users_extended
alter table public.users_extended 
  add column if not exists longest_streak integer default 0,
  add column if not exists last_challenge_date date;

-- Function to update user streak when completing a challenge
create or replace function update_user_streak()
returns trigger as $$
declare
  v_last_date date;
  v_current_streak integer;
begin
  -- Only run when challenge is marked as completed
  if new.completed = true and (old.completed is null or old.completed = false) then
    -- Get user's last challenge date and current streak
    select last_challenge_date, current_streak
    into v_last_date, v_current_streak
    from public.users_extended
    where id = new.user_id;

    -- Update streak logic
    if v_last_date is null then
      -- First challenge ever
      update public.users_extended
      set 
        current_streak = 1,
        longest_streak = greatest(longest_streak, 1),
        last_challenge_date = new.challenge_date
      where id = new.user_id;
    elsif v_last_date = new.challenge_date - interval '1 day' then
      -- Consecutive day - increment streak
      update public.users_extended
      set 
        current_streak = v_current_streak + 1,
        longest_streak = greatest(longest_streak, v_current_streak + 1),
        last_challenge_date = new.challenge_date
      where id = new.user_id;
    elsif v_last_date < new.challenge_date - interval '1 day' then
      -- Broke streak - reset to 1
      update public.users_extended
      set 
        current_streak = 1,
        last_challenge_date = new.challenge_date
      where id = new.user_id;
    end if;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically update streak
create trigger on_challenge_completed
  after update on public.daily_challenges
  for each row
  execute function update_user_streak();

-- Create index for faster queries
create index idx_daily_challenges_user_date on public.daily_challenges(user_id, challenge_date);
