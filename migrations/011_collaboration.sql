-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    topic TEXT NOT NULL,
    language_level TEXT CHECK (language_level IN ('Beginner', 'Intermediate', 'Advanced', 'All')) DEFAULT 'All',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    participants_count INTEGER DEFAULT 0
);

-- Create room_messages table
CREATE TABLE IF NOT EXISTS room_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'audio')) DEFAULT 'text',
    audio_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

-- Policies for rooms
CREATE POLICY "Rooms are viewable by everyone" 
    ON rooms FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create rooms" 
    ON rooms FOR INSERT 
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their rooms" 
    ON rooms FOR UPDATE 
    USING (auth.uid() = created_by);

-- Policies for messages
CREATE POLICY "Room messages are viewable by authenticated users" 
    ON room_messages FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert messages" 
    ON room_messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Realtime publication
-- Check if table exists in publication first to avoid errors if repeated
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'room_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
    END IF;
END $$;

-- Add realtime for rooms to see new rooms created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'rooms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
    END IF;
END $$;
