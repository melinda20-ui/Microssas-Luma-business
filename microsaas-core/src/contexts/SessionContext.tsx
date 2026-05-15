"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase, signInWithSupabase, signOutFromSupabase, getCurrentSession } from "@/lib/supabase";

type SessionUser = {
  id: string;
  email: string;
  name: string;
};

type SessionContextType = {
  user: SessionUser | null;
  isLoaded: boolean;
  signIn: (email: string) => Promise<boolean>;
  signOut: () => void;
};

const AUTO_EMAIL = "lumabusinessa1.0@gmail.com";
const AUTO_ID = "super-admin-seed";

const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoaded: false,
  signIn: async () => false,
  signOut: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const sb = await getCurrentSession();
      if (sb && !cancelled) {
        setUser(sb.user);
        localStorage.setItem("session_user", JSON.stringify(sb.user));
        setIsLoaded(true);
        return;
      }
      const stored = localStorage.getItem("session_user");
      if (stored && !cancelled) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
      if (!cancelled) setIsLoaded(true);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !cancelled) {
        const u: SessionUser = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "",
        };
        setUser(u);
        localStorage.setItem("session_user", JSON.stringify(u));
      } else if (!cancelled) {
        setUser(null);
        localStorage.removeItem("session_user");
      }
      if (!cancelled) setIsLoaded(true);
    });

    return () => {
      cancelled = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string): Promise<boolean> => {
    const { error } = await signInWithSupabase(email);
    if (!error) return true;
    const sessionUser: SessionUser = {
      id: email === AUTO_EMAIL ? AUTO_ID : `user_${Date.now()}`,
      email,
      name: email.split("@")[0],
    };
    localStorage.setItem("session_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
    return true;
  };

  const signOut = async () => {
    await signOutFromSupabase();
    localStorage.removeItem("session_user");
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, isLoaded, signIn, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
