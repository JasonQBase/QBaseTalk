-- Add questions column to stories table for persisting AI-generated quizzes
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS questions jsonb DEFAULT '[]'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.stories.questions IS 'AI-generated comprehension questions in JSON format';
