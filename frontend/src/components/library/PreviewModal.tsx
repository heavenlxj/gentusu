import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, Share2, X } from "lucide-react";
import type { Generation } from "@/lib/kinkora";

interface Props {
  item: Generation;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export function PreviewModal({ item, onClose, onDownload, onShare }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={onClose}>
      {/* 灯箱在两种主题下都是深底：内部文字 / 按钮用固定 snow，别用会翻转的 white */}
      <div className="relative flex max-h-full w-full max-w-7xl flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-snow/45 bg-snow/15 text-snow transition hover:bg-snow/30"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <video
          src={item.videoUrl ?? undefined}
          poster={item.posterUrl ?? undefined}
          className="mt-12 max-h-[82vh] w-full rounded-2xl bg-black object-contain"
          controls
          autoPlay
          playsInline
          loop
        />

        <div className="flex w-full max-w-2xl gap-3">
          <button type="button" onClick={onDownload} className="btn-primary flex-1 py-3.5 text-base">
            <Download className="h-5 w-5" /> Download MP4
          </button>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-snow px-6 py-3.5 text-base font-semibold text-[#0c0e20] transition hover:bg-snow/90"
          >
            <Share2 className="h-5 w-5" /> Share
          </button>
        </div>

        {item.watermarked && (
          <p className="text-center text-sm text-snow/70">
            Free renders carry a small watermark.{" "}
            <Link to="/pricing" className="font-semibold text-snow underline underline-offset-4">
              Any plan removes it
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
