-- Enhanced SRS (Spaced Repetition System)
-- Add SM-2 algorithm fields to vocabulary

-- Add SRS fields to vocabulary_words table
alter table public.vocabulary_words
  add column if not exists ease_factor decimal(3,2) default 2.5,
  add column if not exists interval_days integer default 1,
  add column if not exists repetitions integer default 0,
  add column if not exists next_review_date date default current_date + interval '1 day',
  add column if not exists last_reviewed timestamp with time zone;

-- Create review history table
create table if not exists public.review_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  word_id uuid references public.vocabulary_words(id) on delete cascade not null,
  quality integer not null check (quality >= 1 and quality <= 4),
  ease_factor_before decimal(3,2),
  ease_factor_after decimal(3,2),
  interval_days integer,
  reviewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for review_history
alter table public.review_history enable row level security;

create policy "Users can view their own review history"
  on public.review_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own review history"
  on public.review_history for insert
  with check (auth.uid() = user_id);

-- Index for better query performance
create index if not exists review_history_user_word_idx 
  on public.review_history(user_id, word_id);

create index if not exists review_history_reviewed_at_idx 
  on public.review_history(reviewed_at desc);

create index if not exists vocabulary_words_next_review_idx 
  on public.vocabulary_words(user_id, next_review_date);

-- Function to record review and update SRS data
create or replace function public.record_vocabulary_review(
  p_word_id uuid,
  p_quality integer
)
returns void as $$
declare
  v_word record;
  v_new_ease_factor decimal(3,2);
  v_new_interval integer;
  v_new_repetitions integer;
  v_next_review_date date;
begin
  -- Get current word data
  select * into v_word
  from vocabulary_words
  where id = p_word_id;

  if not found then
    raise exception 'Word not found';
  end if;

  -- Calculate new values based on SM-2 algorithm
  if p_quality < 3 then
    -- Failed review, reset
    v_new_repetitions := 0;
    v_new_interval := 1;
  else
    -- Successful review
    v_new_repetitions := v_word.repetitions + 1;
    
    if v_new_repetitions = 1 then
      v_new_interval := 1;
    elsif v_new_repetitions = 2 then
      v_new_interval := 6;
    else
      v_new_interval := round(v_word.interval_days * v_word.ease_factor);
    end if;
  end if;

  -- Update ease factor
  v_new_ease_factor := v_word.ease_factor + (0.1 - (4 - p_quality) * (0.08 + (4 - p_quality) * 0.02));
  
  -- Ensure minimum ease factor
  if v_new_ease_factor < 1.3 then
    v_new_ease_factor := 1.3;
  end if;

  -- Calculate next review date
  v_next_review_date := current_date + (v_new_interval || ' days')::interval;

  -- Update vocabulary word
  update vocabulary_words
  set 
    ease_factor = v_new_ease_factor,
    interval_days = v_new_interval,
    repetitions = v_new_repetitions,
    next_review_date = v_next_review_date,
    last_reviewed = timezone('utc'::text, now()),
    learned = true
  where id = p_word_id;

  -- Record review history
  insert into review_history (
    user_id,
    word_id,
    quality,
    ease_factor_before,
    ease_factor_after,
    interval_days
  ) values (
    v_word.user_id,
    p_word_id,
    p_quality,
    v_word.ease_factor,
    v_new_ease_factor,
    v_new_interval
  );
end;
$$ language plpgsql security definer;
