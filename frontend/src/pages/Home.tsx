import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/home/Hero";
import { Comparison, FAQ, FinalCTA, HowItWorks, ModesShowcase, Responsible, Ticker, UseCases } from "@/components/home/Sections";
import { Pricing } from "@/components/home/Pricing";
import { Studio } from "@/components/studio/Studio";
import { SITE } from "@/config/site";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>{SITE.name} — Motion Transfer, Character Swap & Video Restyle</title>
      </Helmet>
      <Hero />
      <Ticker />
      <section id="studio" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-24 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Studio</p>
            <h2 className="mt-3 font-display text-4xl font-black sm:text-5xl">Direct the illusion.</h2>
          </div>
          <p className="max-w-md text-white/55">Choose a mode, drop your footage and references, hit cast. Try it with the motion library if you don’t have a clip.</p>
        </div>
        <Studio />
      </section>
      <ModesShowcase />
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
