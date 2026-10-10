import { Helmet } from "react-helmet-async";
import { Comparison, FAQ, FinalCTA, HowItWorks, Responsible, Showcase, UseCases } from "@/components/home/Sections";
import { Pricing } from "@/components/home/Pricing";
import { Studio } from "@/components/studio/Studio";
import { SITE } from "@/config/site";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>{SITE.name} — Motion Transfer, Character Swap & Video Restyle</title>
      </Helmet>
      <Studio
        title={
          <>
            Rewrite reality. <span className="text-chakra-500">Keep the motion.</span>
          </>
        }
        subtitle="Recast the performer, swap an object or restyle the whole scene — every move, camera path and cut stays exactly as filmed."
      />
      <Showcase />
      <HowItWorks />
      <UseCases />
      <Comparison />
      <Pricing compact />
      <Responsible />
      <FAQ />
      <FinalCTA />
    </>
  );
}
