import { useState } from "react";
import { CalendarClock, Check, Gift, Loader2, Lock, Package, Zap } from "lucide-react";
import {
  CONFIG,
  CREDIT_PACKS,
  FREE_TRIAL,
  MODES,
  PLANS,
  YEARLY_DISCOUNT,
  creditsPerSecond,
  planFromLookup,
  planLookup,
  type BillingInterval,
  type CreditPack,
  type Plan,
  type Resolution,
} from "@/config/site";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { kinkora } from "@/lib/kinkora";
import { cn } from "@/lib/cn";

const usd = (n: number) => `$${n.toFixed(2)}`;
const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "");
const RESOLUTIONS: [Resolution, string][] = [
  ["480p", "Fast"],
  ["720p", "HD"],
  ["1080p", "Full HD"],
];
/** 一条 15s 720p 视频的积分，用来把额度换算成「几条视频」 */
const CLIP_SECONDS = 15;
const FULL_720 = Math.ceil(creditsPerSecond("720p") * CLIP_SECONDS);

export function Pricing({ compact = false }: { compact?: boolean }) {
  const [interval, setBillingInterval] = useState<BillingInterval>("year");
  const [loading, setLoading] = useState<string | null>(null);
  const { user, billing, openAuth, refreshCredits } = useAuth();
  const toast = useToast();
  const current = planFromLookup(billing.subscription?.lookup);
  const subscribed = billing.subscription?.status === "active";

  const run = async (key: string, fn: () => Promise<void>) => {
    if (!user) return openAuth();
    setLoading(key);
    try {
      await fn();
    } catch (e: any) {
      toast(e?.message ?? "Something went wrong", "error");
    } finally {
      setLoading(null);
    }
  };

  const openCheckout = (lookup: string, label: string) =>
    run(lookup, async () => {
      const url = await kinkora.checkout(lookup);
      if (url) window.location.href = url;
      else if (CONFIG.demoMode) toast(`Demo: Stripe checkout for ${label} would open here`, "info");
    });

  const choosePlan = (plan: Plan) => {
    const lookup = planLookup(plan.id, interval);
    if (!current) return openCheckout(lookup, `${plan.name} (${interval}ly)`);
    const price = interval === "year" ? plan.yearly : plan.monthly;
    const ok = window.confirm(
      `Switch to ${plan.name} · ${interval === "year" ? "yearly" : "monthly"} (${usd(price)}/${interval})?\n\n` +
        "You pay only the prorated difference today, charged to your card on file. New credits are added right away.",
    );
    if (!ok) return;
    run(lookup, async () => {
      const r = await kinkora.upgrade(lookup);
      toast(`Upgraded to ${plan.name}${r.amountPaid ? ` · charged ${usd(r.amountPaid / 100)}` : ""}`, "success");
      await refreshCredits();
    });
  };

  const buyPack = (pack: CreditPack) => {
    if (user && !subscribed && !CONFIG.demoMode) {
      toast("Credit packs are for subscribers — pick a plan first", "info");
      return document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" });
    }
    openCheckout(pack.lookup, `${pack.credits} credits`);
  };

  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-28 sm:px-6">
      <p className="eyebrow text-center">Pricing</p>
      <h2 className="mt-3 text-center font-display text-4xl font-black sm:text-5xl">Pick your power level.</h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-white/60">
        All {MODES.length} modes and HD on every plan, fresh credits every month, failed renders refunded automatically. Need more? Subscribers can top up with packs that never expire.
      </p>

      {billing.subscription && current && (
        <MyPlan
          planName={current.plan.name}
          interval={current.interval}
          loading={loading}
          onCancel={(cancel) =>
            run(cancel ? "cancel" : "resume", async () => {
              if (cancel && !window.confirm("Cancel at the end of this billing period? You keep your credits until then.")) return;
              await kinkora.setCancel(cancel);
              toast(cancel ? "Your plan will end at the period end" : "Your plan will renew as usual", "success");
              await refreshCredits();
            })
          }
          onPortal={() =>
            run("portal", async () => {
              const url = await kinkora.portal();
              if (url) window.location.href = url;
            })
          }
        />
      )}

      <div id="plans" className="mt-10 flex scroll-mt-28 justify-center">
        <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm font-semibold">
          {(["month", "year"] as const).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setBillingInterval(i)}
              className={cn("rounded-full px-5 py-2 transition", interval === i ? "bg-chakra-500 text-white" : "text-white/65 hover:text-white")}
            >
              {i === "month" ? "Monthly" : "Yearly"}
              {i === "year" && <span className={cn("ml-2 text-xs", interval === i ? "text-white/75" : "text-chakra-300")}>−{YEARLY_DISCOUNT * 100}%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {PLANS.map((p) => {
          const lookup = planLookup(p.id, interval);
          const isCurrent = current?.plan.id === p.id && current.interval === interval;
          const canSwitch =
            !current ||
            (p.rank > current.plan.rank && !(current.interval === "year" && interval === "month")) ||
            (p.rank === current.plan.rank && current.interval === "month" && interval === "year");
          const perMonth = interval === "year" ? p.yearly / 12 : p.monthly;
          return (
            <div
              key={p.id}
              className={cn(
                "relative flex flex-col rounded-[28px] border p-7 transition",
                p.highlight ? "border-chakra-500 bg-gradient-to-b from-chakra-500/15 to-transparent shadow-chakra" : "border-white/10 bg-white/[0.02] hover:border-white/25",
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-7 flex items-center gap-1 rounded-full bg-chakra-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  <Zap className="h-3 w-3" /> Most popular
                </span>
              )}
              <p className="font-display text-xl font-bold">{p.name}</p>
              <p className="mt-4">
                <span className="font-display text-5xl font-black">{usd(perMonth)}</span>
                <span className="ml-2 text-white/50">/ month</span>
              </p>
              <p className="mt-1 text-sm text-white/45">
                {interval === "year" ? (
                  <>
                    Billed {usd(p.yearly)} yearly · <s>{usd(p.monthly * 12)}</s>
                  </>
                ) : (
                  "Billed monthly · cancel anytime"
                )}
              </p>
              <p className="mt-3 text-sm text-chakra-300">
                {p.credits} credits every month · ~{usd(perMonth / Math.floor(p.credits / FULL_720))} per 15s HD clip
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-white/75">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-chakra-400" /> {perk}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => choosePlan(p)}
                disabled={loading === lookup || isCurrent || !canSwitch}
                className={cn("mt-8 w-full", p.highlight ? "btn-primary" : "btn-ghost py-3")}
              >
                {loading === lookup ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrent ? (
                  "Current plan"
                ) : !current ? (
                  `Get ${p.name}`
                ) : canSwitch ? (
                  `Upgrade to ${p.name}`
                ) : (
                  "Included in your plan"
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-6 flex max-w-3xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
        <Gift className="h-5 w-5 flex-none text-chakra-400" />
        <span>
          <b className="text-white">Free to try:</b> new accounts get {FREE_TRIAL.credits} credits — one {FREE_TRIAL.seconds}s {FREE_TRIAL.resolution} clip in any mode (with a small watermark — every plan exports clean). Monthly credits refresh each billing month and unused ones expire; yearly plans drop a fresh batch every month.
        </span>
      </div>

      <div className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Credit packs</p>
            <h3 className="mt-2 font-display text-3xl font-black">Top up anytime</h3>
          </div>
          <p className="flex items-center gap-2 text-sm text-white/50">
            {subscribed ? <Package className="h-4 w-4 text-chakra-400" /> : <Lock className="h-4 w-4" />}
            {subscribed ? "Pack credits never expire and are used after your monthly credits" : "Available with any active plan"}
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <button
              key={pack.lookup}
              type="button"
              onClick={() => buyPack(pack)}
              disabled={loading === pack.lookup}
              className={cn(
                "flex items-center justify-between rounded-2xl border p-5 text-left transition",
                subscribed || CONFIG.demoMode ? "border-white/15 bg-white/[0.03] hover:border-chakra-400" : "border-white/5 bg-white/[0.015] opacity-60",
              )}
            >
              <span>
                <span className="block font-display text-2xl">{pack.credits} credits</span>
                <span className="text-xs text-white/50">
                  ≈ {Math.floor(pack.credits / creditsPerSecond("720p"))}s of HD · never expire
                </span>
              </span>
              <span className="flex items-center gap-2 font-semibold">
                {loading === pack.lookup ? <Loader2 className="h-4 w-4 animate-spin" /> : usd(pack.price)}
                {!subscribed && !CONFIG.demoMode && <Lock className="h-3.5 w-3.5 text-white/50" />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!compact && (
        <div className="card mx-auto mt-10 max-w-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left font-mono text-[11px] uppercase tracking-widest text-white/45">
                <th className="px-5 py-3">Quality</th>
                <th className="px-5 py-3 text-right">Credits / second</th>
                <th className="px-5 py-3 text-right">5s clip</th>
                <th className="px-5 py-3 text-right">10s clip</th>
                <th className="px-5 py-3 text-right">15s clip</th>
              </tr>
            </thead>
            <tbody>
              {RESOLUTIONS.map(([res, label]) => (
                <tr key={res} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-semibold">
                    {res} <span className="font-normal text-white/45">· {label}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-white/80">{creditsPerSecond(res)}</td>
                  {[5, 10, 15].map((sec) => (
                    <td key={sec} className="px-5 py-3 text-right text-white/60">{Math.ceil(creditsPerSecond(res) * sec)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-white/5 px-5 py-3 text-xs text-white/40">
            Same rate for all {MODES.length} modes, billed per second of your source clip (2–15s). Sound included.
          </p>
        </div>
      )}
    </section>
  );
}

function MyPlan({
  planName,
  interval,
  loading,
  onCancel,
  onPortal,
}: {
  planName: string;
  interval: BillingInterval;
  loading: string | null;
  onCancel: (cancel: boolean) => void;
  onPortal: () => void;
}) {
  const { billing } = useAuth();
  const sub = billing.subscription!;
  const nextDrop = billing.upcoming[0];
  return (
    <div className="card mx-auto mt-10 max-w-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">Your plan</p>
          <p className="mt-1 font-display text-3xl font-black">
            {planName} <span className="text-white/45">· {interval === "year" ? "yearly" : "monthly"}</span>
          </p>
          <p className={cn("mt-1 text-sm", sub.status === "past_due" ? "text-red-300" : "text-white/55")}>
            {sub.status === "past_due"
              ? "Payment failed — update your card to keep your plan"
              : sub.cancelAtPeriodEnd
                ? `Ends on ${date(sub.periodEnd)}`
                : `Renews on ${date(sub.periodEnd)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onPortal} disabled={loading === "portal"} className="btn-ghost px-4 py-2 text-sm">
            {loading === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Billing & invoices"}
          </button>
          <button
            type="button"
            onClick={() => onCancel(!sub.cancelAtPeriodEnd)}
            disabled={loading === "cancel" || loading === "resume"}
            className="btn-ghost px-4 py-2 text-sm"
          >
            {sub.cancelAtPeriodEnd ? "Resume plan" : "Cancel plan"}
          </button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <Stat label="Available now" value={`${billing.credits} credits`} />
        <Stat
          label="Monthly credits"
          value={`${billing.subscriptionCredits}`}
          note={billing.nextExpiry ? `expire ${date(billing.nextExpiry.at)}` : "refresh each billing month"}
        />
        <Stat label="Pack credits" value={`${billing.packCredits}`} note="never expire" />
      </div>
      {nextDrop && (
        <p className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <CalendarClock className="h-4 w-4 text-chakra-400" /> Next {nextDrop.credits} credits arrive on {date(nextDrop.at)}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
      {note && <p className="text-xs text-white/45">{note}</p>}
    </div>
  );
}
