import { createFileRoute, Link } from "@tanstack/react-router";
import { MaskedLinesOnScroll, Rise } from "@/components/site/motion-primitives";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/constants";

const title = "Privacy Policy — Stackweb";
const description =
  "How Stackweb collects, uses, and protects your personal data. We keep it simple — we collect as little as possible and never sell your information.";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacyPolicyPage,
});

const sections = [
  {
    heading: "1. Who We Are",
    body: [
      `${SITE_NAME} ("we", "us", "our") is a web design studio based in the United Kingdom. Our website is ${SITE_URL}. For questions about this policy, contact us at ${SITE_EMAIL}.`,
      `We are the data controller for personal information collected through this website and through the course of providing our services.`,
    ],
  },
  {
    heading: "2. What Data We Collect",
    body: [
      `When you fill in the project enquiry form on this website, we collect the information you provide: your name, email address, company name, and any project details you choose to include.`,
      `When you visit this website, our hosting infrastructure may automatically collect standard server log data including your IP address, browser type, referring URL, and pages visited. This data is used only for security and performance monitoring.`,
      `We do not use advertising trackers, fingerprinting scripts, or any third-party analytics that sell or share your browsing behaviour.`,
    ],
  },
  {
    heading: "3. How We Use Your Data",
    body: [
      `We use the information from your enquiry form to respond to your message and, if you become a client, to manage your project. We do not add you to any mailing list without your explicit consent.`,
      `We may use your contact email to send you a follow-up if you have not heard back from us within a reasonable time after submitting an enquiry. You can ask us to stop at any time.`,
      `We will never sell, rent, or trade your personal information to third parties.`,
    ],
  },
  {
    heading: "4. Legal Basis for Processing",
    body: [
      `We process enquiry data on the basis of legitimate interests — specifically, responding to potential clients who have chosen to contact us. For project-related data, processing is necessary for the performance of a contract.`,
      `Where we send any optional marketing or follow-up communications, we rely on your consent, which you may withdraw at any time.`,
    ],
  },
  {
    heading: "5. Data Retention",
    body: [
      `Enquiry data is retained for up to 24 months after last contact. Active client data (project correspondence, files, invoices) is retained for six years to comply with UK financial record-keeping requirements.`,
      `You may request deletion of your data at any time (see Your Rights below). We will delete or anonymise data unless we are required by law to retain it.`,
    ],
  },
  {
    heading: "6. Cookies",
    body: [
      `This website uses only strictly necessary cookies required for it to function. We do not use analytics, advertising, or optional cookies. No consent banner is required because we do not use non-essential cookies.`,
      `If this changes in the future, we will update this policy and add a cookie notice accordingly.`,
    ],
  },
  {
    heading: "7. Third-Party Services",
    body: [
      `This website is hosted on Cloudflare infrastructure. Cloudflare may process request data (IP address, headers) as part of its network security and performance services. Please see Cloudflare's Privacy Policy for details.`,
      `Fonts are loaded from Google Fonts. This involves a connection to Google's servers; Google may log the request. We load fonts at render time; no personal data you provide to us is shared with Google.`,
      `Project data submitted through the enquiry form is stored in a database managed by us. No project enquiry data is shared with any third-party marketing or analytics service.`,
    ],
  },
  {
    heading: "8. Your Rights",
    body: [
      `Under UK GDPR and the Data Protection Act 2018, you have the right to: access a copy of your personal data; request correction of inaccurate data; request deletion of your data; object to processing; and request restriction of processing.`,
      `To exercise any of these rights, email us at ${SITE_EMAIL}. We will respond within 30 days. There is no charge for exercising these rights.`,
      `If you are unhappy with how we handle your data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.`,
    ],
  },
  {
    heading: "9. Data Security",
    body: [
      `We take appropriate technical and organisational measures to protect your personal information from unauthorised access, loss, or disclosure. Our database connections use encryption in transit, and access is restricted to authorised personnel only.`,
      `No method of transmission over the internet is 100% secure. We cannot guarantee absolute security, but we will notify you and the relevant authorities promptly in the event of a data breach that is likely to affect your rights or freedoms.`,
    ],
  },
  {
    heading: "10. International Transfers",
    body: [
      `We are based in the UK and your data is primarily stored and processed there. Where any processing occurs outside the UK (for example, via Cloudflare's global network), appropriate safeguards are in place in accordance with UK GDPR requirements.`,
    ],
  },
  {
    heading: "11. Children's Privacy",
    body: [
      `Our website and services are not directed at children under 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a child, please contact us immediately and we will delete it.`,
    ],
  },
  {
    heading: "12. Changes to This Policy",
    body: [
      `We may update this Privacy Policy from time to time. The current version is always available at ${SITE_URL}/privacy-policy with the date it was last updated. If we make material changes, we will note them at the top of this page.`,
    ],
  },
  {
    heading: "13. Contact Us",
    body: [
      `For any privacy-related questions, data requests, or concerns, please contact us at ${SITE_EMAIL}.`,
    ],
  },
];

function PrivacyPolicyPage() {
  return (
    <>
      <section className="px-5 pt-32 pb-14 sm:px-8 lg:pt-44">
        <div className="mx-auto max-w-[110rem]">
          <h1 className="display text-[clamp(2.2rem,7vw,7rem)]">
            <MaskedLinesOnScroll lines={["Privacy", "Policy"]} />
          </h1>
          <Rise delay={0.15}>
            <p className="mt-6 max-w-xl font-serif text-xl leading-snug text-foreground/85 sm:text-2xl">
              Last updated: January 2025 · UK GDPR compliant
            </p>
          </Rise>
        </div>
      </section>

      <section className="border-t border-hairline px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-14">
          {sections.map((s) => (
            <Rise key={s.heading}>
              <article>
                <h2 className="display text-2xl sm:text-3xl">{s.heading}</h2>
                <div className="mt-5 space-y-4">
                  {s.body.map((para, i) => (
                    <p key={i} className="text-base leading-relaxed text-muted-foreground">
                      {para}
                    </p>
                  ))}
                </div>
              </article>
            </Rise>
          ))}
        </div>
      </section>

      <section className="border-t border-hairline px-5 py-20 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-6">
          <p className="font-serif text-xl text-foreground/80">Questions about your data?</p>
          <Link
            to="/project-form"
            className="btn-wipe bg-primary px-7 py-3.5 text-[12px] font-medium tracking-[0.18em] text-primary-foreground uppercase"
          >
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
