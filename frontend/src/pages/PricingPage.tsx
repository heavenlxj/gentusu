import { Helmet } from "react-helmet-async";
import { Pricing } from "@/components/home/Pricing";
import { FAQ } from "@/components/home/Sections";
import { SITE } from "@/config/site";

export default function PricingPage() {
  return (
    <div className="pt-12">
      <Helmet>
        <title>Pricing | {SITE.name}</title>
        <meta name="description" content="One-time credit packs for Genjutsu AI motion transfer, character swap, object swap, restyle and face swap. Credits never expire." />
      </Helmet>
      <Pricing />
      <FAQ />
    </div>
  );
}
