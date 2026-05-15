import { createClient } from "@supabase/supabase-js";

// Keys sourced from luma-os primary env
const SUPABASE_URL = "https://vadljxyykrhyeuarzyat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1O8rZojnDMZeYkBOtFF6jA_8m64Y-Yo";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhZGxqeHl5a3JoeWV1YXJ6eWF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE1NDk5NCwiZXhwIjoyMDkyNzMwOTk0fQ.JF_j9g3OpfGB0ZJk0ye0wQU-NEHU6dO4vfMjShcJ2YE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function signInWithSupabase(email: string) {
  return supabase.auth.signInWithOtp({ email });
}

export async function signOutFromSupabase() {
  return supabase.auth.signOut();
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return {
    user: {
      id: data.session.user.id,
      email: data.session.user.email || "",
      name: data.session.user.user_metadata?.full_name || data.session.user.email?.split("@")[0] || "",
    },
    session: data.session,
  };
}
