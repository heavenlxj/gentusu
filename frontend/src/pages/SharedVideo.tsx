import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { Loader2, Wand2 } from "lucide-react";
import { SITE } from "@/config/site";
import { kinkora, type Generation } from "@/lib/kinkora";

export default function SharedVideo() {
  const { shareId = "" } = useParams();
  const [item, setItem] = useState<Generation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    kinkora
      .getShared(shareId)
      .then(setItem)
      .catch((e) => setError(e instanceof Error ? e.message : "This video is no longer available"));
  }, [shareId]);

  const title = item?.title ? `${item.title} — ${SITE.name}` : `Made with ${SITE.name}`;

  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-20 pt-24 text-center sm:pt-28">
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        {item?.posterUrl && <meta property="og:image" content={item.posterUrl} />}
        {item?.videoUrl && <meta property="og:video" content={item.videoUrl} />}
      </Helmet>

      {item?.videoUrl ? (
        <video
          src={item.videoUrl}
          poster={item.posterUrl ?? undefined}
          className="max-h-[72vh] w-auto max-w-full rounded-3xl bg-black shadow-chakra"
          controls
          autoPlay
          playsInline
          loop
        />
      ) : error ? (
        <p className="py-24 text-white/60">{error}</p>
      ) : (
        <Loader2 className="my-24 h-6 w-6 animate-spin text-white/50" />
      )}

      <h1 className="mt-8 font-display text-3xl uppercase tracking-tight sm:text-4xl">Recast any video with AI</h1>
      <p className="mt-2 max-w-md text-sm text-white/55">Swap characters, outfits, scenes and styles while every move stays the same. Your first 5s clip is free.</p>
      <Link to="/#studio" className="btn-primary mt-5">
        <Wand2 className="h-4 w-4" /> Make yours
      </Link>
    </section>
  );
}
