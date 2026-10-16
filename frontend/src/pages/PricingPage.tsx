import { Seo, breadcrumbJsonLd } from "@/components/seo/Seo";
import { Pricing } from "@/components/home/Pricing";
import { FAQ } from "@/components/home/Sections";
import { FREE_TRIAL, PLANS, SITE } from "@/config/site";

export default function PricingPage() {
  return (
    <div className="pt-12">
      <Seo
        title={`Genjutsu AI Pricing — Plans from $${PLANS[0].monthly}/mo | ${SITE.name}`}
        description={`Genjutsu AI plans from $${PLANS[0].monthly}/month for motion transfer, character swap, object swap, restyle and face swap. HD on every plan, 20% off yearly, a free ${FREE_TRIAL.seconds}s clip for new accounts.`}
        path="/pricing"
        jsonLd={breadcrumbJsonLd([["Pricing", "/pricing"]])}
      />
      <Pricing />
      <FAQ />
    </div>
  );
}
