-- Streaks Enhancement Migration
-- Adds streak freeze system and milestone tracking

-- Add streak freeze columns to users_extended
alter table public.users_extended 
  add column if not exists streak_freeze_count integer default 2,
  add column if not exists last_streak_freeze_date date,
  add column if not exists longest_streak integer default 0;

-- Streak Milestones Table
-- Tracks when users achieve streak milestones
create table if not exists public.streak_milestones (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  milestone_days integer not null,
  achieved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  badge_awarded text,
  xp_awarded integer default 0,
  unique(user_id, milestone_days)
);

-- RLS for streak_milestones
alter table public.streak_milestones enable row level security;

create policy "Users can view their own milestones"
  on public.streak_milestones for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own milestones"
  on public.streak_milestones for insert
  with check ( auth.uid() = user_id );

-- Streak Freeze History Table
-- Tracks when users use streak freezes
create table if not exists public.streak_freeze_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  freeze_date date not null,
  used_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for streak_freeze_history
alter table public.streak_freeze_history enable row level security;

create policy "Users can view their own freeze history"
  on public.streak_freeze_history for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own freeze history"
  on public.streak_freeze_history for insert
  with check ( auth.uid() = user_id );

-- Index for better query performance
create index if not exists streak_milestones_user_idx 
  on public.streak_milestones(user_id, milestone_days desc);

create index if not exists streak_freeze_history_user_idx 
  on public.streak_freeze_history(user_id, freeze_date desc);

-- Function to use a streak freeze
create or replace function public.use_streak_freeze(
  p_user_id uuid,
  p_freeze_date date
)
returns jsonb as $$
declare
  v_freeze_count integer;
  v_last_freeze_date date;
  v_result jsonb;
begin
  -- Get current freeze count
  select streak_freeze_count, last_streak_freeze_date
  into v_freeze_count, v_last_freeze_date
  from public.users_extended
  where id = p_user_id;

  -- Check if user has freezes available
  if v_freeze_count <= 0 then
    return jsonb_build_object(
      'success', false,
      'message', 'No freeze tokens available'
    );
  end if;

  -- Update user's freeze count
  update public.users_extended
  set 
    streak_freeze_count = streak_freeze_count - 1,
    last_streak_freeze_date = p_freeze_date
  where id = p_user_id;

  -- Record freeze usage
  insert into public.streak_freeze_history (user_id, freeze_date)
  values (p_user_id, p_freeze_date);

  return jsonb_build_object(
    'success', true,
    'message', 'Streak freeze applied',
    'freezes_remaining', v_freeze_count - 1
  );
end;
$$ language plpgsql security definer;

-- Function to check and award streak milestones
create or replace function public.check_streak_milestone(
  p_user_id uuid,
  p_current_streak integer
)
returns jsonb as $$
declare
  v_milestone integer;
  v_xp_award integer;
  v_badge_id text;
  v_milestones integer[] := array[7, 14, 30, 60, 100, 365];
  v_awarded_milestones jsonb := '[]'::jsonb;
begin
  -- Update longest streak
  update public.users_extended
  set longest_streak = greatest(longest_streak, p_current_streak)
  where id = p_user_id;

  -- Check each milestone
  foreach v_milestone in array v_milestones
  loop
    if p_current_streak >= v_milestone then
      -- Check if milestone already awarded
      if not exists (
        select 1 from public.streak_milestones
        where user_id = p_user_id and milestone_days = v_milestone
      ) then
        -- Calculate XP award
        v_xp_award := case v_milestone
          when 7 then 50
          when 14 then 100
          when 30 then 200
          when 60 then 350
          when 100 then 500
          when 365 then 1000
          else 0
        end;

        -- Badge ID
        v_badge_id := 'streak_' || v_milestone::text;

        -- Award milestone
        insert into public.streak_milestones (
          user_id, milestone_days, badge_awarded, xp_awarded
        ) values (
          p_user_id, v_milestone, v_badge_id, v_xp_award
        );

        -- Award XP to user
        update public.users_extended
        set total_xp = total_xp + v_xp_award
        where id = p_user_id;

        -- Add bonus freeze for major milestones
        if v_milestone in (30, 100, 365) then
          update public.users_extended
          set streak_freeze_count = streak_freeze_count + 1
          where id = p_user_id;
        end if;

        -- Add to awarded list
        v_awarded_milestones := v_awarded_milestones || jsonb_build_object(
          'milestone', v_milestone,
          'xp', v_xp_award,
          'badge', v_badge_id
        );
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'success', true,
    'awarded', v_awarded_milestones
  );
end;
$$ language plpgsql security definer;

-- Function to reset monthly streak freezes (to be called by a cron job)
create or replace function public.reset_monthly_streak_freezes()
returns void as $$
begin
  update public.users_extended
  set streak_freeze_count = 2
  where streak_freeze_count < 2;
end;
$$ language plpgsql security definer;
