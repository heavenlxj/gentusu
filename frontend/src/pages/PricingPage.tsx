import { Helmet } from "react-helmet-async";
import { Pricing } from "@/components/home/Pricing";
import { FAQ } from "@/components/home/Sections";
import { SITE } from "@/config/site";

export default function PricingPage() {
  return (
    <div className="pt-12">
      <Helmet>
        <title>Pricing | {SITE.name}</title>
        <meta name="description" content="Genjutsu AI plans from $24.99/month for motion transfer, character swap, object swap, restyle and face swap. HD on every plan, 20% off yearly, a free 5s clip for new accounts." />
      </Helmet>
      <Pricing />
      <FAQ />
    </div>
  );
}
