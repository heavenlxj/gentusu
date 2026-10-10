import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CONFIG } from "@/config/site";
import { getVisitorId } from "@/lib/fingerprint";
import { supabase } from "@/lib/supabase";
import { EMPTY_BILLING, kinkora, KinkoraError, type BillingState } from "@/lib/kinkora";

export interface AuthUser {
  id: string;
  email?: string;
  avatarUrl?: string;
  name?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  credits: number;
  billing: BillingState;
  /** 风控拒绝注册等登录相关错误，在登录弹窗里展示 */
  authError: string | null;
  ready: boolean;
  authOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  spendDemoCredits: (n: number) => void;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER: AuthUser = { id: "demo", email: "demo@genjutsu.ai", name: "Demo Creator" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [billing, setBilling] = useState<BillingState>(CONFIG.demoMode ? { ...EMPTY_BILLING, credits: 150 } : EMPTY_BILLING);
  const [authError, setAuthError] = useState<string | null>(null);
  const [ready, setReady] = useState(CONFIG.demoMode || !supabase);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (CONFIG.demoMode || !supabase) return;
    getVisitorId();
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email, avatarUrl: u.user_metadata?.avatar_url ?? u.user_metadata?.picture, name: u.user_metadata?.full_name ?? u.user_metadata?.name } : null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      setUser(u ? { id: u.id, email: u.email, avatarUrl: u.user_metadata?.avatar_url ?? u.user_metadata?.picture, name: u.user_metadata?.full_name ?? u.user_metadata?.name } : null);
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

  const refreshCredits = useCallback(async () => {
    if (CONFIG.demoMode || !supabase) return;
    try {
      setBilling(await kinkora.getBilling());
    } catch (e) {
      if (e instanceof KinkoraError && e.code === "REGISTRATION_DENIED") {
        setAuthError(e.message);
        setAuthOpen(true);
        await supabase.auth.signOut();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      if (!CONFIG.demoMode) setBilling(EMPTY_BILLING);
      return;
    }
    refreshCredits();
    if (!new URLSearchParams(window.location.search).has("checkout")) return;
    // Stripe webhook 入账有几秒延迟
    const timers = [3000, 10000].map((ms) => window.setTimeout(refreshCredits, ms));
    return () => timers.forEach(window.clearTimeout);
  }, [user?.id, refreshCredits]);

  const spendDemoCredits = useCallback((n: number) => setBilling((b) => ({ ...b, credits: Math.max(0, b.credits - n) })), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        credits: billing.credits,
        billing,
        authError,
        ready,
        authOpen,
        openAuth: () => setAuthOpen(true),
        closeAuth: () => {
          setAuthOpen(false);
          setAuthError(null);
        },
        signInWithGoogle,
        signOut,
        spendDemoCredits,
        refreshCredits,
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
