import { useState } from "react";
import { AlertTriangle, Download, Loader2, Play, Share2, Trash2 } from "lucide-react";
import type { Generation } from "@/lib/kinkora";
import { formatAgo, formatRemaining } from "@/lib/media";
import { cn } from "@/lib/cn";

interface Props {
  item: Generation;
  highlight?: boolean;
  onPreview: () => void;
  onDownload: () => Promise<void>;
  onShare: () => void;
  onDelete: () => void;
}

export function GenerationCard({ item, highlight, onPreview, onDownload, onShare, onDelete }: Props) {
  const [downloading, setDownloading] = useState(false);
  const ready = item.status === "succeeded" && !!item.videoUrl;
  const running = item.status === "processing" || item.status === "finalizing";
  const wide = item.meta.aspect !== "9:16";

  const download = async () => {
    setDownloading(true);
    await onDownload().finally(() => setDownloading(false));
  };

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border bg-ink-900 transition",
        highlight ? "border-chakra-500 shadow-chakra" : "border-white/10 hover:border-white/20",
      )}
    >
      <button
        type="button"
        onClick={ready ? onPreview : undefined}
        className={cn("relative block w-full overflow-hidden bg-black", wide ? "aspect-video" : "aspect-[9/16] max-h-[420px]", ready && "cursor-pointer")}
      >
        {item.posterUrl ? (
          <img src={item.posterUrl} alt="" className={cn("h-full w-full object-cover", !ready && "scale-105 opacity-40 blur-sm")} />
        ) : (
          <Thumbs urls={item.meta.thumbs} dim={!ready} />
        )}

        {ready && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-chakra-500 text-white opacity-90 shadow-xl transition group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          </span>
        )}

        {running && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
            <span className="font-display text-5xl tracking-wide">{item.progress}%</span>
            <span className="h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-white/15">
              <span className="block h-full rounded-full bg-chakra-500 transition-[width] duration-1000" style={{ width: `${item.progress}%` }} />
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/70">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-chakra-400" />
              {item.status === "finalizing" ? "Finishing up" : formatRemaining(item.remainingSeconds)}
            </span>
          </span>
        )}

        {item.status === "failed" && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <span className="text-sm font-semibold">Render failed</span>
            <span className="text-xs text-white/60">{item.error || "Your credits were returned."}</span>
          </span>
        )}

        <StatusBadge status={item.status} />
        {ready && item.watermarked && (
          <span className="absolute right-2 top-2 rounded-full bg-ink-950/70 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur">Watermark</span>
        )}
      </button>

      <div className="flex items-center gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{item.title || "Genjutsu video"}</p>
          <p className="truncate text-[11px] text-white/45">
            {[item.resolution, item.seconds ? `${item.seconds}s` : null, formatAgo(item.createdAt)].filter(Boolean).join(" · ")}
          </p>
        </div>
        {ready && (
          <>
            <IconButton label="Download" onClick={download} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </IconButton>
            <IconButton label="Share" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </IconButton>
          </>
        )}
        <IconButton label={running ? "Can be deleted once it finishes" : "Delete"} onClick={onDelete} disabled={running} danger>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </article>
  );
}

function Thumbs({ urls, dim }: { urls?: string[]; dim: boolean }) {
  if (!urls?.length) return <span className="block h-full w-full bg-gradient-to-br from-chakra-600/40 to-ink-950" />;
  return (
    <span className={cn("flex h-full w-full", dim && "opacity-40 blur-[2px]")}>
      {urls.slice(0, 2).map((u) => (
        <img key={u} src={u} alt="" className="h-full w-1/2 object-cover" />
      ))}
    </span>
  );
}

const BADGES: Record<Generation["status"], { label: string; cls: string }> = {
  processing: { label: "Rendering", cls: "bg-chakra-500 text-white" },
  finalizing: { label: "Finishing", cls: "bg-chakra-500 text-white" },
  succeeded: { label: "Ready", cls: "bg-emerald-500 text-ink-950" },
  failed: { label: "Failed · refunded", cls: "bg-red-500/90 text-white" },
};

function StatusBadge({ status }: { status: Generation["status"] }) {
  const b = BADGES[status];
  return <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", b.cls)}>{b.label}</span>;
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/10 text-white/70 transition disabled:cursor-not-allowed disabled:opacity-30",
        danger ? "hover:border-red-400/60 hover:text-red-300" : "hover:border-chakra-400 hover:text-chakra-400",
      )}
    >
      {children}
    </button>
  );
}
