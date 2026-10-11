import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { SITE } from "@/config/site";

export default function Privacy() {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-36 pb-24 sm:px-6">
      <Helmet>
        <title>Privacy Policy — {SITE.name}</title>
        <meta
          name="description"
          content={`How ${SITE.name} collects, uses and protects your information when you edit videos and photos.`}
        />
      </Helmet>

      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 font-display text-4xl uppercase leading-[1.05] sm:text-5xl">Privacy Policy</h1>
      <p className="mt-4 text-sm text-white/40">Last updated: October 11, 2026</p>

      <div className="mt-12 space-y-8 text-white/70">
        <section>
          <h2 className="font-display text-xl uppercase text-white">1. Overview</h2>
          <p className="mt-2">
            {SITE.name} ({SITE.kanji}) applies motion transfer, swaps and restyles to the videos and images you
            upload. This policy explains what we collect, why we collect it and the choices you have. By using the
            service you agree to this policy.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">2. What we collect</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Account details — the email address and profile from the sign-in provider you use.</li>
            <li>Content you upload — the videos and images you provide and the results generated from them.</li>
            <li>Billing details — processed by our payment provider; we do not store full card numbers.</li>
            <li>Usage and technical data — modes and features used, approximate location from IP, browser and device type, and referral source.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">3. How we use it</h2>
          <p className="mt-2">
            To create your edits, operate and secure your account, process payments and credits, provide support,
            prevent abuse, and understand in aggregate how the product is used so we can improve it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">4. Faces, likeness and consent</h2>
          <p className="mt-2">
            Several modes change or replace the person shown in your footage. You must have permission to use every
            video and image, and the consent of everyone depicted. Do not upload anything depicting someone without
            their consent, and never upload footage of minors.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">5. Processing by providers</h2>
          <p className="mt-2">
            We share content with third-party providers strictly to deliver the service — for example managed hosting,
            a payment processor and AI generation services. These providers process your content only to perform the
            requested task and are bound by their own confidentiality obligations. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">6. Retention</h2>
          <p className="mt-2">
            Uploaded media and generated results are kept only as long as needed to provide the service and are
            removed from our storage after a limited period. You can delete your results at any time, and we delete
            account data on request.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">7. Cookies &amp; analytics</h2>
          <p className="mt-2">
            We use essential cookies and local storage to keep you signed in and to remember your theme and other
            preferences. We use privacy-respecting analytics to measure aggregate traffic. We do not use third-party
            advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">8. Security</h2>
          <p className="mt-2">
            We use encryption in transit and access controls to protect your information. No method of transmission
            or storage is completely secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">9. Children</h2>
          <p className="mt-2">
            The service is not intended for anyone under 18. We do not knowingly collect information from children.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">10. Your rights</h2>
          <p className="mt-2">
            You may request access to, correction of, or deletion of your personal data, or ask us to stop certain
            processing, by emailing{" "}
            <a href={`mailto:${SITE.supportEmail}`} className="text-chakra-400 hover:text-chakra-300">
              {SITE.supportEmail}
            </a>
            . See also our <Link to="/terms" className="text-chakra-400 hover:text-chakra-300">Terms of Service</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl uppercase text-white">11. Changes</h2>
          <p className="mt-2">
            We may update this policy from time to time. Material changes will be posted on this page with a new
            "Last updated" date.
          </p>
        </section>
      </div>
    </article>
  );
}
