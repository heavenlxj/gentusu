import { Link } from "react-router-dom";
import { Logo } from "./Navbar";
import { MODES, SITE } from "@/config/site";

export function Footer() {
  return (
    <footer className="relative mt-28 overflow-hidden border-t border-white/5">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-white/50">Motion transfer, character swap and restyle — the art of illusion for every video.</p>
        </div>
        <div>
          <p className="eyebrow mb-4">Tools</p>
          <ul className="space-y-2.5 text-sm">
            {MODES.map((m) => (
              <li key={m.id}><Link to={`/${m.id}`} className="text-white/60 hover:text-white">{m.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Product</p>
          <ul className="space-y-2.5 text-sm">
            <li><a href="/#studio" className="text-white/60 hover:text-white">Studio</a></li>
            <li><a href="/#showcase" className="text-white/60 hover:text-white">Showcase</a></li>
            <li><Link to="/pricing" className="text-white/60 hover:text-white">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Trust</p>
          <ul className="space-y-2.5 text-sm">
            <li><a href="/#responsible" className="text-white/60 hover:text-white">Responsible AI</a></li>
            <li><a href="/#faq" className="text-white/60 hover:text-white">FAQ</a></li>
            <li><a href={`mailto:${SITE.supportEmail}`} className="text-white/60 hover:text-white">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-white/35 sm:px-6 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. 幻術 — the art of illusion.</p>
          <p>Independent product. Not affiliated with Higgsfield.</p>
        </div>
      </div>
    </footer>
  );
}
