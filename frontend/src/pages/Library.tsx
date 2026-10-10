import { useCallback, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { Clapperboard, Coins, Loader2, Plus } from "lucide-react";
import { GenerationCard } from "@/components/library/GenerationCard";
import { PreviewModal } from "@/components/library/PreviewModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useGenerations } from "@/hooks/useGenerations";
import { SITE } from "@/config/site";
import type { Generation } from "@/lib/kinkora";
import { downloadVideo, shareLink, shareUrl } from "@/lib/media";

export default function Library() {
  const { user, ready, credits, billing, openAuth, refreshCredits } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const highlight = params.get("new");
  const [preview, setPreview] = useState<Generation | null>(null);
  const { items, loading, error, reload, remove } = useGenerations(!!user, refreshCredits);

  const running = items.filter((g) => g.status === "processing" || g.status === "finalizing").length;

  const download = useCallback(async (g: Generation) => {
    if (g.videoUrl) await downloadVideo(g.videoUrl, `genjutsu-${g.id.slice(0, 8)}.mp4`);
  }, []);

  const share = useCallback(
    async (g: Generation) => {
      try {
        const how = await shareLink(shareUrl(g.shareId), `${g.title || "My Genjutsu video"} — ${SITE.name}`);
        if (how === "copied") toast("Share link copied", "success");
      } catch {
        toast("Couldn't copy the link", "error");
      }
    },
    [toast],
  );

  const del = useCallback(
    async (g: Generation) => {
      if (!window.confirm("Delete this video? This can't be undone.")) return;
      try {
        await remove(g.id);
        toast("Video deleted", "success");
      } catch (e) {
        toast(e instanceof Error ? e.message : "Couldn't delete the video", "error");
      }
    },
    [remove, toast],
  );

  return (
    <section className="mx-auto max-w-[1320px] px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
      <Helmet>
        <title>My videos — {SITE.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight sm:text-5xl">My videos</h1>
          <p className="mt-2 text-sm text-white/55">
            {running
              ? `${running} rendering — they keep going even if you close this tab.`
              : "Every render lands here. Preview, download, share or delete."}
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-sm" title="Available credits (credits for running renders are on hold)">
              <Coins className="h-4 w-4 text-chakra-400" /> <b>{credits}</b>
              <span className="text-white/45">available</span>
            </span>
            <Link to="/#studio" className="btn-primary py-2 text-sm">
              <Plus className="h-4 w-4" /> New video
            </Link>
          </div>
        )}
      </div>

      {!billing.subscription && user && items.some((g) => g.watermarked) && (
        <p className="mb-5 rounded-2xl border border-chakra-500/25 bg-chakra-500/10 px-4 py-3 text-xs text-white/70">
          Free renders carry a small watermark.{" "}
          <Link to="/pricing" className="font-semibold text-chakra-400 hover:underline">
            Pick a plan
          </Link>{" "}
          for clean HD exports.
        </p>
      )}

      {!ready || (user && loading) ? (
        <div className="flex justify-center py-24 text-white/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : !user ? (
        <Empty title="Sign in to see your videos" action={<button type="button" onClick={openAuth} className="btn-primary">Sign in</button>} />
      ) : error && !items.length ? (
        <Empty title={error} action={<button type="button" onClick={reload} className="btn-ghost">Try again</button>} />
      ) : !items.length ? (
        <Empty title="No videos yet" action={<Link to="/#studio" className="btn-primary">Make your first video</Link>} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((g) => (
            <GenerationCard
              key={g.id}
              item={g}
              highlight={g.id === highlight}
              onPreview={() => setPreview(g)}
              onDownload={() => download(g)}
              onShare={() => share(g)}
              onDelete={() => del(g)}
            />
          ))}
        </div>
      )}

      {preview && (
        <PreviewModal item={preview} onClose={() => setPreview(null)} onDownload={() => download(preview)} onShare={() => share(preview)} />
      )}
    </section>
  );
}

function Empty({ title, action }: { title: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/10 py-20 text-center">
      <Clapperboard className="h-10 w-10 text-white/25" />
      <p className="text-white/70">{title}</p>
      {action}
    </div>
  );
}
