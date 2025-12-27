-- Word of the Day System Migration
-- Creates tables for daily word features with user progress tracking

-- Create word_of_day table
create table public.word_of_day (
  id uuid default uuid_generate_v4() primary key,
  word text not null,
  pronunciation text not null,
  part_of_speech text not null, -- noun, verb, adjective, etc.
  definition text not null,
  example_1 text not null,
  example_2 text,
  example_3 text,
  synonym text,
  antonym text,
  difficulty difficulty_level not null,
  date date not null unique,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user progress tracking table
create table public.user_wotd_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  wotd_id uuid references public.word_of_day(id) not null,
  viewed boolean default false,
  practiced boolean default false,
  mastered boolean default false,
  quiz_score integer,
  viewed_at timestamp with time zone,
  practiced_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, wotd_id)
);

-- Enable RLS
alter table public.word_of_day enable row level security;
alter table public.user_wotd_progress enable row level security;

-- Policies for word_of_day (public read)
create policy "Anyone can view word of day"
  on public.word_of_day for select
  using ( true );

-- Policies for user_wotd_progress
create policy "Users can view their own WOTD progress"
  on public.user_wotd_progress for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own WOTD progress"
  on public.user_wotd_progress for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own WOTD progress"
  on public.user_wotd_progress for update
  using ( auth.uid() = user_id );

-- Create index for faster queries
create index idx_wotd_date on public.word_of_day(date desc);
create index idx_user_wotd_progress on public.user_wotd_progress(user_id, wotd_id);

-- Insert sample words for the next few days
insert into public.word_of_day (word, pronunciation, part_of_speech, definition, example_1, example_2, example_3, synonym, antonym, difficulty, date) values
  ('Serendipity', '/ˌser.ənˈdɪp.ə.ti/', 'noun', 
   'The occurrence of events by chance in a happy or beneficial way', 
   'Finding that old photo was pure serendipity.',
   'Their meeting was a serendipity that changed both their lives.',
   'The serendipity of discovering this café made my day.',
   'fortune, luck', 'misfortune, design', 'Advanced', CURRENT_DATE),
  
  ('Eloquent', '/ˈel.ə.kwənt/', 'adjective',
   'Fluent or persuasive in speaking or writing',
   'She gave an eloquent speech that moved the audience.',
   'His eloquent words convinced everyone in the room.',
   'The author is known for her eloquent writing style.',
   'articulate, fluent', 'inarticulate, tongue-tied', 'Intermediate', CURRENT_DATE + interval '1 day'),
  
  ('Ambitious', '/æmˈbɪʃ.əs/', 'adjective',
   'Having or showing a strong desire and determination to succeed',
   'She is an ambitious student who always aims for the top.',
   'His ambitious plan to start a business impressed investors.',
   'The company has set ambitious goals for this year.',
   'determined, driven', 'lazy, unambitious', 'Beginner', CURRENT_DATE + interval '2 days'),
  
  ('Resilient', '/rɪˈzɪl.i.ənt/', 'adjective',
   'Able to withstand or recover quickly from difficult conditions',
   'The resilient community rebuilt after the disaster.',
   'Children are remarkably resilient and adapt quickly.',
   'Her resilient spirit helped her overcome many challenges.',
   'strong, tough', 'fragile, weak', 'Intermediate', CURRENT_DATE + interval '3 days'),
  
  ('Ephemeral', '/ɪˈfem.ər.əl/', 'adjective',
   'Lasting for a very short time',
   'The beauty of cherry blossoms is ephemeral.',
   'Social media fame can be quite ephemeral.',
   'The ephemeral nature of youth makes it precious.',
   'fleeting, temporary', 'permanent, lasting', 'Advanced', CURRENT_DATE + interval '4 days');
