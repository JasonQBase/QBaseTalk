-- Activity Tracking Table
-- Stores daily activity data for streak calendar visualization

create table if not exists public.daily_activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  activity_date date not null,
  activity_count integer default 0,
  activity_types jsonb default '[]'::jsonb,
  total_minutes integer default 0,
  xp_earned integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, activity_date)
);

-- RLS for daily_activities
alter table public.daily_activities enable row level security;

create policy "Users can view their own activities"
  on public.daily_activities for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own activities"
  on public.daily_activities for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own activities"
  on public.daily_activities for update
  using ( auth.uid() = user_id );

-- Index for better query performance
create index if not exists daily_activities_user_date_idx 
  on public.daily_activities(user_id, activity_date desc);

-- Function to track activity
create or replace function public.track_activity(
  p_user_id uuid,
  p_activity_type text,
  p_minutes integer default 0,
  p_xp integer default 0
)
returns void as $$
declare
  v_today date;
begin
  v_today := current_date;
  
  insert into public.daily_activities (
    user_id,
    activity_date,
    activity_count,
    activity_types,
    total_minutes,
    xp_earned
  )
  values (
    p_user_id,
    v_today,
    1,
    jsonb_build_array(p_activity_type),
    p_minutes,
    p_xp
  )
  on conflict (user_id, activity_date)
  do update set
    activity_count = daily_activities.activity_count + 1,
    activity_types = daily_activities.activity_types || jsonb_build_array(p_activity_type),
    total_minutes = daily_activities.total_minutes + p_minutes,
    xp_earned = daily_activities.xp_earned + p_xp,
    updated_at = timezone('utc'::text, now());
end;
$$ language plpgsql security definer;
