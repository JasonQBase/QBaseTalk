-- Create user_learning_goals table
CREATE TABLE IF NOT EXISTS user_learning_goals (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    primary_goal TEXT NOT NULL DEFAULT 'General Fluency',
    weekly_target_minutes INTEGER DEFAULT 60,
    current_level TEXT CHECK (current_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learning_path_items table
CREATE TABLE IF NOT EXISTS learning_path_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('lesson', 'practice', 'quiz')) NOT NULL,
    status TEXT CHECK (status IN ('locked', 'available', 'completed')) DEFAULT 'locked',
    order_index INTEGER NOT NULL,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE user_learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_items ENABLE ROW LEVEL SECURITY;

-- Policies for goals
CREATE POLICY "Users can view own goals" 
    ON user_learning_goals FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" 
    ON user_learning_goals FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" 
    ON user_learning_goals FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policies for path items
CREATE POLICY "Users can view own path" 
    ON learning_path_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own path" 
    ON learning_path_items FOR UPDATE 
    USING (auth.uid() = user_id);
    
-- Allow service role to manage paths (usually handled by bypass RLS, but for client-side generation logic):
CREATE POLICY "Users can insert own path" 
    ON learning_path_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own path" 
    ON learning_path_items FOR DELETE 
    USING (auth.uid() = user_id);
