import { useState } from "react";
import { Check, Loader2, Zap } from "lucide-react";
import { CONFIG, MODES, PRICE_PACKS, type PricePack } from "@/config/site";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { kinkora } from "@/lib/kinkora";
import { cn } from "@/lib/cn";

export function Pricing({ compact = false }: { compact?: boolean }) {
  const [loading, setLoading] = useState<string | null>(null);
  const { user, openAuth } = useAuth();
  const toast = useToast();

  const buy = async (pack: PricePack) => {
    if (!user) return openAuth();
    setLoading(pack.id);
    try {
      const url = await kinkora.startCheckout(pack);
      if (url) window.location.href = url;
      else if (CONFIG.demoMode) toast(`Demo: Stripe checkout for ${pack.name} ($${pack.price}) would open here`);
    } catch (e: any) {
      toast(e?.message ?? "Checkout failed", "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-28 sm:px-6">
      <p className="eyebrow text-center">Pricing</p>
      <h2 className="mt-3 text-center font-display text-4xl font-black sm:text-5xl">Credits that never expire.</h2>
      <p className="mx-auto mt-4 max-w-lg text-center text-white/55">One-time packs, no subscription. Failed renders return your credits automatically.</p>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {PRICE_PACKS.map((p) => (
          <div
            key={p.id}
            className={cn(
              "relative flex flex-col rounded-[28px] border p-7 transition",
              p.highlight ? "border-chakra-500 bg-gradient-to-b from-chakra-500/15 to-transparent shadow-chakra" : "border-white/10 bg-white/[0.02] hover:border-white/25",
            )}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-7 flex items-center gap-1 rounded-full bg-spirit px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-950">
                <Zap className="h-3 w-3" /> Most popular
              </span>
            )}
            <p className="font-display text-xl font-bold">{p.name}</p>
            <p className="mt-4">
              <span className="font-display text-5xl font-black">${p.price}</span>
              <span className="ml-2 text-white/50">one-time</span>
            </p>
            <p className="mt-1 text-sm text-chakra-300">{p.credits} credits</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {p.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-white/75">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-spirit" /> {perk}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => buy(p)} disabled={loading === p.id} className={cn("mt-8 w-full", p.highlight ? "btn-primary" : "btn-ghost py-3")}>
              {loading === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : `Get ${p.credits} credits`}
            </button>
          </div>
        ))}
      </div>

      {!compact && (
        <div className="card mx-auto mt-10 max-w-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left font-mono text-[11px] uppercase tracking-widest text-white/45">
                <th className="px-5 py-3">Mode</th>
                <th className="px-5 py-3 text-right">Credits / second</th>
                <th className="px-5 py-3 text-right">Clip length</th>
              </tr>
            </thead>
            <tbody>
              {MODES.map((m) => {
                const defaults = Object.fromEntries(m.options.map((o) => [o.key, o.default]));
                return (
                  <tr key={m.id} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3 font-semibold"><span className="mr-2 font-jp text-chakra-400">{m.kanji}</span>{m.name}</td>
                    <td className="px-5 py-3 text-right text-white/70">from {m.creditsPerSecond(defaults)}</td>
                    <td className="px-5 py-3 text-right text-white/70">{m.minSeconds}–{m.maxSeconds(defaults)}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
