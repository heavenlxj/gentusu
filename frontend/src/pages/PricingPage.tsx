import { Seo, breadcrumbJsonLd } from "@/components/seo/Seo";
import { Pricing } from "@/components/home/Pricing";
import { FAQ } from "@/components/home/Sections";
import { CREDIT_PACKS, PLANS, SITE } from "@/config/site";

export default function PricingPage() {
  const pack = CREDIT_PACKS[0];
  return (
    <div className="pt-12">
      <Seo
        title={`Genjutsu AI Pricing — From $${pack.price} per Clip, No Subscription | ${SITE.name}`}
        description={`Edit a video from $${pack.price} with a one-off ${pack.credits}-credit pack — no subscription, credits never expire, 720p HD included. Motion transfer, character swap, object swap, restyle and face swap. Plans from $${PLANS[0].monthly}/mo if you edit every week.`}
        path="/pricing"
        jsonLd={breadcrumbJsonLd([["Pricing", "/pricing"]])}
      />
      <Pricing />
      <FAQ />
    </div>
  );
}
