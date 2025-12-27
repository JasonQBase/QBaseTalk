# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project with a strong database password
4. Wait for project to be provisioned (~2 minutes)

## 2. Get Your API Keys

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Create Environment Variables

Create `.env.local` file in the project root:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-generate-with-openssl

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

## 4. Run Database Migrations

Copy the SQL from `src/lib/supabase/schema.sql` and run it in:

- Supabase Dashboard → **SQL Editor** → **New Query**
- Paste the SQL and click "Run"

## 5. Enable Row Level Security (RLS)

Important policies to add:

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Similar policies for other tables...
```

## 6. Verify Setup

Run the development server and check:

- No Supabase connection errors in console
- Can create users
- Can save progress

## Troubleshooting

- **Connection refused**: Check your API keys
- **RLS errors**: Verify policies are set up correctly
- **Type errors**: Regenerate types with `npm run gen:types`
