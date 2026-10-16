import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Facebook,
  ImageDown,
  Instagram,
  Link2,
  Linkedin,
  MessageCircle,
  Music2,
  Send,
  Twitter,
  X,
} from "lucide-react";
import type { Generation } from "@/lib/kinkora";
import { copyText, downloadFile, shareUrl } from "@/lib/media";
import { platformIntent, shareCaption, shareCaptionForX, shareDescription, shareFilename } from "@/lib/share-copy";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/cn";

interface Props {
  item: Generation;
  onClose: () => void;
}

type Platform = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** 没有 web 分享入口（Instagram / TikTok）→ 只复制文案，让用户去 App 里粘 */
  manual?: boolean;
};

const PLATFORMS: Platform[] = [
  { id: "x", label: "X", icon: Twitter },
  { id: "instagram", label: "Instagram", icon: Instagram, manual: true },
  { id: "tiktok", label: "TikTok", icon: Music2, manual: true },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "reddit", label: "Reddit", icon: MessageCircle },
  { id: "telegram", label: "Telegram", icon: Send },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function ShareSheet({ item, onClose }: Props) {
  const toast = useToast();
  const url = shareUrl(item.shareId);
  const suggested = useMemo(() => shareCaption(item, url), [item, url]);
  const [caption, setCaption] = useState(suggested);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const flag = (key: string) => {
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
  };

  const copy = async (text: string, key: string, message: string) => {
    const ok = await copyText(text);
    if (!ok) return toast("Couldn't copy — select the text and copy it manually", "error");
    flag(key);
    toast(message, "success");
  };

  const post = (p: Platform) => {
    const text = p.id === "x" ? shareCaptionForX(item, url, caption) : caption;
    const intent = platformIntent(p.id, url, text, item);

    // 复制永远不阻塞分享：窗口要同步打开（异步后会被弹窗拦截），复制在后台尽力而为
    if (p.manual || !intent) {
      void copy(text, p.id, `Caption copied — paste it into ${p.label}, then add the cover image`);
      return;
    }
    window.open(intent, "_blank", "noopener,width=680,height=640");
    flag(p.id);
    void copyText(text).then((ok) =>
      toast(ok ? `Caption copied · opening ${p.label}` : `Opening ${p.label} — the caption is in the box above`, ok ? "success" : "error"),
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-y-auto rounded-[28px] border border-white/10 bg-ink-900 p-5 shadow-chakra sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/15 p-2 text-white/60 transition hover:border-white/35 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="eyebrow">Share</p>
        <h3 className="mt-2 pr-12 font-display text-2xl font-bold leading-tight sm:text-3xl">Send this illusion everywhere</h3>
        <p className="mt-2 text-sm text-white/60">
          {shareDescription(item)} · the caption and link are ready to paste — Instagram and TikTok take the caption only.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              {item.posterUrl ? (
                <img src={item.posterUrl} alt="" className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-chakra-600/40 to-ink-950 text-xs text-white/60">
                  Cover image
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => downloadFile(item.posterUrl ?? "", shareFilename(item))}
              disabled={!item.posterUrl}
              className="btn-ghost mt-3 w-full py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied === "cover" ? <Check className="h-4 w-4" /> : <ImageDown className="h-4 w-4" />} Download cover
            </button>
          </div>

          <div className="flex flex-col">
            <label className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50" htmlFor="share-caption">
              Caption
            </label>
            <textarea
              id="share-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              spellCheck={false}
              className="mt-2 h-40 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-relaxed text-white/90 outline-none transition focus:border-chakra-400"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/55">
              <span className="tabular-nums">{caption.length} characters</span>
              {caption.length > 280 && <span>X will get a shorter version (280 limit)</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => copy(caption, "caption", "Caption copied")} className="btn-primary flex-1 py-2.5 text-sm">
                {copied === "caption" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy caption
              </button>
              <button type="button" onClick={() => copy(url, "link", "Link copied")} className="btn-ghost flex-1 py-2.5 text-sm">
                {copied === "link" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} Copy link
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">Post to</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => post(p)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-3 text-sm font-medium transition hover:border-chakra-400 hover:bg-white/5",
                  copied === p.id && "border-chakra-400 text-chakra-400",
                )}
              >
                {copied === p.id ? <Check className="h-4 w-4" /> : <p.icon className="h-4 w-4" />}
                {p.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/55">
            Every option copies the caption for you. The link preview shows this clip with its cover image.
          </p>
        </div>
      </div>
    </div>
  );
}
