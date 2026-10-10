import { useState } from "react";
import { Gift, Loader2, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { CompareSlider } from "@/components/studio/CompareSlider";
import { FREE_TRIAL, MODES } from "@/config/site";

export function AuthModal() {
  const { authOpen, authError, closeAuth, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  if (!authOpen) return null;

  const onGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" onClick={closeAuth} />
      <div className="relative grid w-full max-w-3xl animate-rise overflow-hidden rounded-[32px] border border-white/10 bg-ink-900 md:grid-cols-2">
        <div className="hidden md:block">
          <CompareSlider before={MODES[0].example.before} after={MODES[0].example.after} poster={MODES[0].example.poster} beforePoster={MODES[0].example.beforePoster} className="h-full min-h-[420px] w-full" />
        </div>
        <div className="relative flex flex-col justify-center p-8">
          <button type="button" onClick={closeAuth} className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:bg-white/5 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <p className="eyebrow">幻術 · Sign in</p>
          <h3 className="mt-3 font-display text-3xl font-bold leading-tight">Cast your first illusion</h3>
          <p className="mt-3 text-sm text-white/60">Your uploads stay private, are never used for training and can be deleted anytime.</p>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm">
            <Gift className="h-5 w-5 flex-none text-chakra-400" />
            <span>
              New accounts get <b>{FREE_TRIAL.credits} free credits</b> — enough for a {FREE_TRIAL.seconds}s {FREE_TRIAL.resolution} clip in any mode (watermarked).
            </span>
          </div>
          {authError && (
            <p className="mt-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-100">{authError}</p>
          )}
          <button type="button" onClick={onGoogle} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 font-semibold text-ink-950 transition hover:bg-white/90 disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>
          <p className="mt-4 text-center text-[11px] text-white/35">By continuing you confirm you have the right to use every likeness and clip you upload.</p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}
