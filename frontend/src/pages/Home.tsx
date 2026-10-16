import { Comparison, FAQ, FAQS, FinalCTA, HowItWorks, Responsible, Showcase, UseCases } from "@/components/home/Sections";
import { Explainer } from "@/components/home/Explainer";
import { Pricing } from "@/components/home/Pricing";
import { Studio } from "@/components/studio/Studio";
import { Seo, faqJsonLd } from "@/components/seo/Seo";

export default function Home() {
  return (
    <>
      <Seo
        title="Genjutsu AI Video Generator — Motion Transfer, Object Swap & Restyle"
        description="Genjutsu AI video generator: transfer motion to any character, swap people, outfits or objects, or restyle a clip into anime — motion and camera stay as filmed. A Higgsfield Genjutsu alternative."
        path="/"
        jsonLd={faqJsonLd(FAQS)}
      />
      <Studio
        title={
          <>
            Genjutsu AI: rewrite reality. <span className="text-chakra-500">Keep the motion.</span>
          </>
        }
        subtitle="Recast the performer, swap an object or restyle the whole scene — every move, camera path and cut stays exactly as filmed."
      />
      <Showcase />
      <HowItWorks />
      <UseCases />
      <Comparison />
      <Explainer />
      <Pricing compact />
      <Responsible />
      <FAQ />
      <FinalCTA />
    </>
  );
}
