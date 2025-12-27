-- Idioms & Phrases Explorer Migration
-- Creates tables for idioms database with cultural context

-- Create idioms table
create table public.idioms (
  id uuid default uuid_generate_v4() primary key,
  phrase text not null unique,
  meaning text not null,
  origin text,
  category text not null,
  difficulty difficulty_level not null,
  examples jsonb not null, -- Array of example sentences
  cultural_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user idiom progress table
create table public.user_idiom_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users_extended(id) not null,
  idiom_id uuid references public.idioms(id) not null,
  learned boolean default false,
  last_reviewed timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, idiom_id)
);

-- Enable RLS
alter table public.idioms enable row level security;
alter table public.user_idiom_progress enable row level security;

-- Policies for idioms
create policy "Anyone can view idioms"
  on public.idioms for select
  using ( true );

-- Policies for user idiom progress
create policy "Users can view their own idiom progress"
  on public.user_idiom_progress for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own idiom progress"
  on public.user_idiom_progress for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own idiom progress"
  on public.user_idiom_progress for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own idiom progress"
  on public.user_idiom_progress for delete
  using ( auth.uid() = user_id );

-- Create indexes
create index idx_idioms_category on public.idioms(category);
create index idx_idioms_difficulty on public.idioms(difficulty);
create index idx_user_idiom_progress_user_id on public.user_idiom_progress(user_id);

-- Insert sample idioms
insert into public.idioms (phrase, meaning, category, difficulty, examples, cultural_note, origin) values
('Break the ice', 'To initiate conversation in a social setting', 'Social', 'Beginner',
  '["Let me break the ice by introducing myself.", "He told a joke to break the ice at the meeting."]'::jsonb,
  'Common in business networking events and social gatherings',
  'May come from ships breaking ice to create a path for other vessels'),

('Hit the books', 'To study hard', 'Education', 'Beginner',
  '["I need to hit the books for my exam tomorrow.", "She has been hitting the books all week."]'::jsonb,
  'Popular among students, especially during exam periods',
  'Refers to the physical act of opening textbooks to study'),

('Piece of cake', 'Something very easy to do', 'General', 'Beginner',
  '["The test was a piece of cake.", "Don''t worry, fixing this is a piece of cake!"]'::jsonb,
  'Often used to reassure someone about a task',
  'Unknown exact origin, possibly from 1930s America'),

('Spill the beans', 'To reveal a secret', 'General', 'Beginner',
  '["Who spilled the beans about the surprise party?", "I can''t believe you spilled the beans!"]'::jsonb,
  'Used when someone accidentally or intentionally reveals confidential information',
  'May originate from ancient Greek voting system using beans'),

('Under the weather', 'Feeling slightly ill', 'Health', 'Beginner',
  '["I''m feeling a bit under the weather today.", "She stayed home because she was under the weather."]'::jsonb,
  'A polite way to say you''re not feeling well',
  'Nautical origin - sailors would go below deck when feeling seasick'),

('Bite the bullet', 'To endure a painful situation', 'General', 'Intermediate',
  '["I had to bite the bullet and pay the expensive car repair.", "Sometimes you just have to bite the bullet."]'::jsonb,
  'Used when accepting something difficult or unpleasant',
  'From battlefield surgery before anesthesia - patients would bite on bullets'),

('Cost an arm and a leg', 'Very expensive', 'Money', 'Intermediate',
  '["This designer bag cost me an arm and a leg.", "Healthcare in the US can cost an arm and a leg."]'::jsonb,
  'Emphasizes the high cost of something',
  'Possibly from portraits where full-body paintings were more expensive'),

('The ball is in your court', 'It''s your turn to take action', 'Business', 'Intermediate',
  '["I''ve done my part, now the ball is in your court.", "The decision is yours - the ball is in your court."]'::jsonb,
  'Common in business and negotiations',
  'From tennis - when the ball is on your side, it''s your turn to play'),

('Barking up the wrong tree', 'Pursuing a mistaken course of action', 'General', 'Intermediate',
  '["If you think I did it, you''re barking up the wrong tree.", "The police are barking up the wrong tree with that suspect."]'::jsonb,
  'Indicates someone is making a wrong assumption',
  'From hunting dogs barking at the wrong tree where prey had escaped'),

('Blessing in disguise', 'A good thing that seemed bad at first', 'General', 'Intermediate',
  '["Losing that job was a blessing in disguise.", "The delay was actually a blessing in disguise."]'::jsonb,
  'Finding positive aspects in seemingly negative situations',
  'First recorded in a 1746 hymn by James Hervey'),

('Burn the midnight oil', 'Work late into the night', 'Work', 'Advanced',
  '["I had to burn the midnight oil to finish the project.", "Students often burn the midnight oil before exams."]'::jsonb,
  'Describes intense late-night work or study sessions',
  'From the era before electricity when oil lamps were used for light'),

('Cut corners', 'Do something in the easiest or cheapest way', 'Business', 'Advanced',
  '["We can''t cut corners on safety.", "The company was accused of cutting corners to save money."]'::jsonb,
  'Often used negatively to describe poor quality work',
  'May refer to literally cutting across corners rather than following paths'),

('Devil''s advocate', 'Someone who argues against an idea to test it', 'Discussion', 'Advanced',
  '["Let me play devil''s advocate for a moment.", "He''s just playing devil''s advocate to test our argument."]'::jsonb,
  'Used in debates and discussions to strengthen arguments',
  'From Catholic Church process of canonization - advocatus diaboli'),

('Go the extra mile', 'Make a special effort', 'Work', 'Advanced',
  '["She always goes the extra mile for her clients.", "Our team went the extra mile to deliver on time."]'::jsonb,
  'Indicates exceptional effort beyond what is required',
  'From the Bible - Matthew 5:41'),

('On thin ice', 'In a risky or precarious situation', 'General', 'Advanced',
  '["After that mistake, he''s on thin ice with the boss.", "You''re on thin ice if you keep arriving late."]'::jsonb,
  'Warning that someone is close to serious consequences',
  'Literally from skating on ice that might break');
