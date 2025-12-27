import { useState, useEffect } from "react";
import { mockUser, UserProfile } from "@/lib/data/user";
// import { createClient } from '@/lib/supabase/client';

export function useUserProgress() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // const supabase = createClient();

  useEffect(() => {
    async function loadProgress() {
      // In a real app, we would fetch from Supabase here
      // const { data: { user } } = await supabase.auth.getUser();
      // if (user) { fetch profile from DB }

      // For now, simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUserProfile(mockUser);
      setLoading(false);
    }

    loadProgress();
  }, []);

  return { userProfile, loading };
}
