import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { SITE } from "@/config/site";

export default function Terms() {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-36 pb-24 sm:px-6">
      <Helmet>
        <title>Terms of Service — {SITE.name}</title>
        <meta name="description" content={`The terms that govern your use of ${SITE.name}.`} />
      </Helmet>

      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 font-display text-4xl uppercase leading-[1.05] sm:text-5xl">Terms of Service</h1>
      <p className="mt-4 text-sm text-white/40">Last updated: October 11, 2026</p>

      <div className="mt-12 space-y-8 text-white/70">
        <section>
          <h2 className="font-display text-xl uppercase text-white">1. Acceptance</h2>
          <p className="mt-2">
            By accessing or using {SITE.name} you agree to these terms. If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">2. Eligibility</h2>
          <p className="mt-2">
            You must be at least 18 years old and able to enter a binding agreement. You are responsible for keeping
            your account secure and for all activity under it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">3. Your content</h2>
          <p className="mt-2">
            You keep ownership of the videos and images you upload and the results you generate. You grant us a
            limited licence to store, process and transmit your content solely to operate the service. You confirm you
            own or have all necessary rights and consents to everything you upload, including the likeness of anyone
            shown.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">4. Acceptable use</h2>
          <p className="mt-2">You agree not to use the service to:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>depict someone without their consent, or create misleading or harmful likenesses;</li>
            <li>upload footage of minors, or any content that is illegal, hateful, harassing or sexually explicit;</li>
            <li>infringe anyone's copyright, trademark or other rights;</li>
            <li>impersonate others for fraud or deception, or misrepresent AI-generated output as authentic footage;</li>
            <li>break the law, circumvent our safeguards, or disrupt the service.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">5. Credits, subscriptions &amp; billing</h2>
          <p className="mt-2">
            Edits are paid for with credits, charged by the length and quality of the source clip. Subscriptions renew
            automatically each period until cancelled, and monthly credits expire at the end of the period. Credit
            packs are added to your balance once purchased. Prices are shown before you pay.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">6. Refunds</h2>
          <p className="mt-2">
            Because generation consumes computing resources, credits that have been spent are non-refundable. If an
            edit fails for a technical reason, the affected credits are returned automatically. You can cancel a
            subscription at any time to stop future renewals.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">7. Our service</h2>
          <p className="mt-2">
            Results are produced by automated systems and may be imperfect. We may change, suspend or discontinue
            features or modes, and we may suspend accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">8. Disclaimer</h2>
          <p className="mt-2">
            The service is provided "as is" without warranties of any kind. We do not warrant that results will be
            accurate, uninterrupted or fit for a particular purpose.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">9. Limitation of liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, we are not liable for indirect, incidental or consequential
            damages, and our total liability is limited to the amount you paid us in the twelve months before the claim.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">10. Changes to these terms</h2>
          <p className="mt-2">
            We may update these terms from time to time. Continued use after changes take effect means you accept the
            updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">11. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Email{" "}
            <a href={`mailto:${SITE.supportEmail}`} className="text-chakra-400 hover:text-chakra-300">
              {SITE.supportEmail}
            </a>
            . See also our <Link to="/privacy" className="text-chakra-400 hover:text-chakra-300">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </article>
  );
}
