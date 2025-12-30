import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy client for build time or when Supabase is disabled
    return createBrowserClient(
      "https://placeholder-url.supabase.co",
      "placeholder-key"
    );
  }

  return createBrowserClient(url, key);
};
