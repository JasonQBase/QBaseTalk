# Supabase Client Setup

This file provides a Supabase client instance that can be used throughout the app.

## Environment Variables Needed

Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service role key for admin operations (keep secret!)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_SUPABASE=false
```

## Getting Your Supabase Credentials

1. Go to https://supabase.com
2. Create a new project (or select existing)
3. Go to Settings → API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Usage

The app will automatically use mock data if `NEXT_PUBLIC_ENABLE_SUPABASE=false` or if Supabase credentials are not provided.

To enable real database integration, set `NEXT_PUBLIC_ENABLE_SUPABASE=true` after adding your credentials.
