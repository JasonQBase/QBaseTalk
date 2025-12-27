-- Badges and Milestones System
-- Gamification features for user achievement tracking

-- Badge definitions table
create table if not exists public.badge_definitions (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  category text not null, -- 'streak', 'vocabulary', 'conversation', 'game', 'milestone'
  requirement_type text not null, -- 'streak_days', 'words_learned', 'conversations_completed', 'games_played', 'xp_earned'
  requirement_value integer not null,
  xp_reward integer default 0,
  rarity text default 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User badges (unlocked badges)
create table if not exists public.user_badges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  badge_id text references public.badge_definitions(id) not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  progress jsonb default '{}'::jsonb,
  unique(user_id, badge_id)
);

-- Milestones (progress checkpoints)
create table if not exists public.milestones (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  milestone_type text not null, -- 'first_word', 'first_conversation', 'week_streak', etc.
  completed boolean default false,
  progress integer default 0,
  target integer not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.badge_definitions enable row level security;
alter table public.user_badges enable row level security;
alter table public.milestones enable row level security;

-- Badge definitions are public (everyone can see available badges)
create policy "Badge definitions are viewable by everyone"
  on public.badge_definitions for select
  using (true);

-- Users can view their own badges
create policy "Users can view their own badges"
  on public.user_badges for select
  using (auth.uid() = user_id);

create policy "Users can insert their own badges"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

-- Users can manage their own milestones
create policy "Users can view their own milestones"
  on public.milestones for select
  using (auth.uid() = user_id);

create policy "Users can insert their own milestones"
  on public.milestones for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own milestones"
  on public.milestones for update
  using (auth.uid() = user_id);

-- Indexes
create index if not exists user_badges_user_id_idx on public.user_badges(user_id);
create index if not exists milestones_user_id_idx on public.milestones(user_id);
create index if not exists badge_definitions_category_idx on public.badge_definitions(category);

-- Insert badge definitions
insert into public.badge_definitions (id, name, description, icon, category, requirement_type, requirement_value, xp_reward, rarity) values
  -- Streak Badges
  ('first_steps', 'First Steps', 'Complete your first day of learning', '🎯', 'streak', 'streak_days', 1, 10, 'common'),
  ('week_warrior', 'Week Warrior', 'Maintain a 7-day learning streak', '🔥', 'streak', 'streak_days', 7, 50, 'rare'),
  ('dedication', 'Dedication', 'Maintain a 30-day learning streak', '⚡', 'streak', 'streak_days', 30, 200, 'epic'),
  ('unstoppable', 'Unstoppable', 'Maintain a 100-day learning streak', '💎', 'streak', 'streak_days', 100, 1000, 'legendary'),
  
  -- Vocabulary Badges
  ('word_learner', 'Word Learner', 'Learn your first 10 words', '📚', 'vocabulary', 'words_learned', 10, 20, 'common'),
  ('vocabulary_builder', 'Vocabulary Builder', 'Learn 50 words', '📖', 'vocabulary', 'words_learned', 50, 100, 'rare'),
  ('word_master', 'Word Master', 'Learn 200 words', '🎓', 'vocabulary', 'words_learned', 200, 500, 'epic'),
  ('polyglot', 'Polyglot', 'Learn 1000 words', '🌟', 'vocabulary', 'words_learned', 1000, 2000, 'legendary'),
  
  -- Conversation Badges
  ('first_chat', 'First Chat', 'Complete your first conversation', '💬', 'conversation', 'conversations_completed', 1, 15, 'common'),
  ('conversationalist', 'Conversationalist', 'Complete 10 conversations', '🗣️', 'conversation', 'conversations_completed', 10, 75, 'rare'),
  ('dialogue_expert', 'Dialogue Expert', 'Complete 50 conversations', '🎭', 'conversation', 'conversations_completed', 50, 300, 'epic'),
  
  -- Game Badges
  ('game_rookie', 'Game Rookie', 'Play your first mini-game', '🎮', 'game', 'games_played', 1, 10, 'common'),
  ('game_enthusiast', 'Game Enthusiast', 'Play 20 mini-games', '🕹️', 'game', 'games_played', 20, 100, 'rare'),
  ('game_champion', 'Game Champion', 'Play 100 mini-games', '🏆', 'game', 'games_played', 100, 500, 'epic'),
  
  -- XP Milestones
  ('rising_star', 'Rising Star', 'Earn 100 XP', '⭐', 'milestone', 'xp_earned', 100, 20, 'common'),
  ('experience_seeker', 'Experience Seeker', 'Earn 500 XP', '✨', 'milestone', 'xp_earned', 500, 100, 'rare'),
  ('elite_learner', 'Elite Learner', 'Earn 2000 XP', '🌠', 'milestone', 'xp_earned', 2000, 400, 'epic'),
  ('legend', 'Legend', 'Earn 10000 XP', '👑', 'milestone', 'xp_earned', 10000, 2000, 'legendary')
on conflict (id) do nothing;

-- Function to check and award badges
create or replace function public.check_and_award_badges(p_user_id uuid)
returns void as $$
declare
  v_user_stats record;
  v_badge record;
begin
  -- Get user statistics
  select 
    coalesce(ue.current_streak, 0) as streak_days,
    coalesce(ue.total_xp, 0) as xp_earned,
    coalesce((select count(*) from vocabulary_words where user_id = p_user_id and learned = true), 0) as words_learned,
    coalesce((select count(distinct session_id) from conversations where user_id = p_user_id), 0) as conversations_completed,
    0 as games_played -- TODO: Add games_played tracking
  into v_user_stats
  from users_extended ue
  where ue.id = p_user_id;
  
  -- Check each badge definition
  for v_badge in 
    select bd.* 
    from badge_definitions bd
    where bd.id not in (
      select badge_id from user_badges where user_id = p_user_id
    )
  loop
    -- Check if user meets requirement
    if (
      (v_badge.requirement_type = 'streak_days' and v_user_stats.streak_days >= v_badge.requirement_value) or
      (v_badge.requirement_type = 'words_learned' and v_user_stats.words_learned >= v_badge.requirement_value) or
      (v_badge.requirement_type = 'conversations_completed' and v_user_stats.conversations_completed >= v_badge.requirement_value) or
      (v_badge.requirement_type = 'games_played' and v_user_stats.games_played >= v_badge.requirement_value) or
      (v_badge.requirement_type = 'xp_earned' and v_user_stats.xp_earned >= v_badge.requirement_value)
    ) then
      -- Award the badge
      insert into user_badges (user_id, badge_id)
      values (p_user_id, v_badge.id)
      on conflict (user_id, badge_id) do nothing;
      
      -- Award XP bonus
      if v_badge.xp_reward > 0 then
        update users_extended
        set total_xp = total_xp + v_badge.xp_reward
        where id = p_user_id;
      end if;
    end if;
  end loop;
end;
$$ language plpgsql security definer;
