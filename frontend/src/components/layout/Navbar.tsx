import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Coins, LogOut, Menu, X } from "lucide-react";
import { CONFIG, MODES, SITE } from "@/config/site";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/cn";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-chakra-500">
        <span className="h-2.5 w-2.5 rounded-full bg-chakra-500 shadow-glow" />
        <span className="absolute -right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-spirit" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Genjutsu<span className="text-chakra-500">.</span>
      </span>
      <span className="hidden font-jp text-sm text-white/40 sm:inline">{SITE.kanji}</span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, credits, openAuth, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition", scrolled ? "border-b border-white/5 bg-ink-950/80 backdrop-blur-xl" : "")}>
      {CONFIG.demoMode && (
        <div className="bg-gradient-to-r from-chakra-600 via-chakra-500 to-chakra-600 py-1 text-center font-mono text-[10px] font-bold uppercase tracking-[0.25em]">
          Demo mode · renders are simulated
        </div>
      )}
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          <div className="group relative">
            <button type="button" className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
              Tools <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible absolute left-0 top-full w-72 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-2xl border border-white/10 bg-ink-900/95 p-2 shadow-2xl backdrop-blur-xl">
                {MODES.map((m) => (
                  <Link key={m.id} to={`/${m.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-chakra-500/15 font-jp text-lg text-chakra-400">{m.kanji}</span>
                    <span>
                      <span className="block text-sm font-semibold">{m.name}</span>
                      <span className="block text-xs text-white/45">{m.tagline}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <a href="/#showcase" className="rounded-full px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">Showcase</a>
          <a href="/#how" className="rounded-full px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">How it works</a>
          <NavLink to="/pricing" className="rounded-full px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">Pricing</NavLink>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/pricing" className="hidden items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm sm:flex">
                <Coins className="h-4 w-4 text-chakra-400" /> <b>{credits}</b>
              </Link>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-chakra-500 font-bold">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : (user.name ?? user.email ?? "U")[0].toUpperCase()}
              </div>
              <button type="button" onClick={signOut} className="hidden p-2 text-white/50 hover:text-white sm:block" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button type="button" onClick={openAuth} className="btn-ghost hidden py-2 text-sm sm:inline-flex">Sign in</button>
          )}
          <a href="/#studio" className="btn-primary hidden py-2 text-sm sm:inline-flex">Open studio</a>
          <button type="button" className="p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-white/5 bg-ink-950/95 px-4 py-4 backdrop-blur-xl md:hidden">
          {MODES.map((m) => (
            <Link key={m.id} to={`/${m.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/80 hover:bg-white/5">
              <span className="font-jp text-chakra-400">{m.kanji}</span> {m.name}
            </Link>
          ))}
          <Link to="/pricing" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-white/80 hover:bg-white/5">Pricing</Link>
          {!user && (
            <button type="button" onClick={() => { setOpen(false); openAuth(); }} className="btn-primary mt-3 w-full">Sign in</button>
          )}
        </div>
      )}
    </header>
  );
}
