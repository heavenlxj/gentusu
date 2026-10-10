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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur" onClick={onClose}>
      <div className="relative flex max-h-full w-full max-w-3xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute -top-1 right-0 rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <video src={item.videoUrl ?? undefined} poster={item.posterUrl ?? undefined} className="mt-10 max-h-[75vh] w-auto max-w-full rounded-2xl bg-black" controls autoPlay playsInline loop />
        <div className="flex w-full max-w-md gap-2">
          <button type="button" onClick={onDownload} className="btn-primary flex-1">
            <Download className="h-4 w-4" /> Download MP4
          </button>
          <button type="button" onClick={onShare} className="btn-ghost flex-1">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
        {item.watermarked && (
          <p className="text-center text-xs text-white/50">
            Free renders carry a small watermark.{" "}
            <Link to="/pricing" className="font-semibold text-chakra-400 underline-offset-4 hover:underline">
              Any plan removes it
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
