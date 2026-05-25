"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, signInWithSupabase, signOutFromSupabase, getCurrentSession } from "@/lib/supabase";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

type SessionContextType = {
  user: SessionUser | null;
  isLoaded: boolean;
  signIn: (email: string) => Promise<boolean>;
  signOut: () => void;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoaded: false,
  signIn: async () => false,
  signOut: () => {},
  refreshSession: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshSession = useCallback(async () => {
    const sb = await getCurrentSession();
    if (sb) {
      setUser(sb.user);
    } else {
      setUser(null);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u: SessionUser = {
          id: session.user.id,
          email: session.user.email || "",
          name:
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "",
        };
        setUser(u);
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [refreshSession]);

  const signIn = async (email: string): Promise<boolean> => {
    const { error } = await signInWithSupabase(email);
    if (error) {
      console.error("[SessionContext] signIn error:", error.message);
      return false;
    }
    return true;
  };

  const signOut = async () => {
    await signOutFromSupabase();
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, isLoaded, signIn, signOut, refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
