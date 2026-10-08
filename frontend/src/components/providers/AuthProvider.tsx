import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CONFIG } from "@/config/site";
import { supabase } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email?: string;
  avatarUrl?: string;
  name?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  credits: number;
  ready: boolean;
  authOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  spendDemoCredits: (n: number) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER: AuthUser = { id: "demo", email: "demo@genjutsu.ai", name: "Demo Creator" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [credits, setCredits] = useState(CONFIG.demoMode ? 40 : 0);
  const [ready, setReady] = useState(CONFIG.demoMode || !supabase);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (CONFIG.demoMode || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email, avatarUrl: u.user_metadata?.avatar_url, name: u.user_metadata?.full_name } : null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email, avatarUrl: u.user_metadata?.avatar_url, name: u.user_metadata?.full_name } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (CONFIG.demoMode || !supabase) {
      await new Promise((r) => setTimeout(r, 700));
      setUser(DEMO_USER);
      setAuthOpen(false);
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
  }, []);

  const signOut = useCallback(async () => {
    if (supabase && !CONFIG.demoMode) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const spendDemoCredits = useCallback((n: number) => setCredits((c) => Math.max(0, c - n)), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        ready,
        authOpen,
        openAuth: () => setAuthOpen(true),
        closeAuth: () => setAuthOpen(false),
        signInWithGoogle,
        signOut,
        spendDemoCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
