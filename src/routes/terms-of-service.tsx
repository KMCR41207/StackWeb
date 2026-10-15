import { createFileRoute, Link } from "@tanstack/react-router";
import { MaskedLinesOnScroll, Rise } from "@/components/site/motion-primitives";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/constants";

const title = "Terms of Service — Stackweb";
const description =
  "Read the Terms of Service for Stackweb. These terms govern your use of our website and the web design services we provide.";

export const Route = createFileRoute("/terms-of-service")({
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
  component: TermsOfServicePage,
});

const sections = [
  {
    heading: "1. Acceptance of Terms",
    body: [
      `By accessing ${SITE_URL} or engaging ${SITE_NAME} for web design services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, please do not use our website or services.`,
      `These terms apply to all visitors, clients, and anyone who accesses or uses the ${SITE_NAME} website and services.`,
    ],
  },
  {
    heading: "2. Services",
    body: [
      `${SITE_NAME} provides custom web design, front-end development, and related digital services ("Services"). The scope, deliverables, timeline, and price of any project are agreed in a separate written project proposal or contract signed by both parties before work begins.`,
      `We reserve the right to refuse service to anyone for any reason at any time, and to modify or discontinue the Services at any time without notice.`,
    ],
  },
  {
    heading: "3. Fixed-Price Projects & Payment",
    body: [
      `All projects are quoted and agreed at a fixed price before any work commences. The agreed price is set out in your project proposal. We do not invoice by the hour — the fixed price is the total price unless additional scope is agreed in writing.`,
      `Payment terms are set out in the project proposal. Typically a deposit is required before work begins, with the balance due on or before launch. We reserve the right to withhold delivery of final files until full payment is received.`,
      `Late payments may incur a late-payment charge as described in your proposal.`,
    ],
  },
  {
    heading: "4. Intellectual Property & Ownership",
    body: [
      `Upon receipt of full payment, you own all original creative work, code, and assets produced specifically for your project. This includes design files, source code, and written copy created by us for your project.`,
      `${SITE_NAME} retains the right to display the work in its portfolio, case studies, social media, and marketing materials unless you request otherwise in writing before the project contract is signed.`,
      `Third-party assets (stock imagery, fonts, libraries, plugins) remain subject to their respective licences. We will identify any such assets and their licence requirements during the project.`,
      `Tools, frameworks, templates, and code components created by ${SITE_NAME} prior to your project, or developed independently, remain our intellectual property and are licensed to you for use in your project on a perpetual, non-exclusive basis.`,
    ],
  },
  {
    heading: "5. Revisions",
    body: [
      `The number of revision rounds included in your project is specified in your proposal. Revisions beyond the included rounds may be scoped and quoted as additional work.`,
      `A "revision" is a modification to existing agreed scope. Requests that constitute new features or material changes to the agreed brief are treated as additional scope and quoted separately.`,
    ],
  },
  {
    heading: "6. Client Responsibilities",
    body: [
      `You agree to provide timely feedback, content (text, images, brand assets), and approvals when requested. Delays caused by late client feedback may result in a revised project timeline. We are not liable for delays caused by incomplete or late client input.`,
      `You confirm that any content, images, or materials you provide to us are owned by you or that you have the necessary rights and permissions to use them, and that they do not infringe any third-party rights.`,
    ],
  },
  {
    heading: "7. Warranties & Disclaimers",
    body: [
      `We warrant that the work delivered will be original, created by us, and free from known defects at the time of delivery. We do not warrant that the website will be entirely error-free or uninterrupted after handover if hosted independently by you.`,
      `The ${SITE_NAME} website and any information on it are provided "as is" without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.`,
    ],
  },
  {
    heading: "8. Limitation of Liability",
    body: [
      `To the fullest extent permitted by law, ${SITE_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits or data, arising out of or in connection with our Services or these Terms.`,
      `Our total cumulative liability to you for any claim arising out of or relating to your project shall not exceed the total fees paid by you for that project.`,
    ],
  },
  {
    heading: "9. Termination",
    body: [
      `Either party may terminate a project by giving written notice. If you terminate a project, any deposit paid is non-refundable and any work completed beyond the deposit value is payable in full. If we terminate a project without cause, we will refund any fees paid in advance for work not yet completed.`,
    ],
  },
  {
    heading: "10. Governing Law",
    body: [
      `These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
    ],
  },
  {
    heading: "11. Changes to These Terms",
    body: [
      `We may update these Terms of Service from time to time. The current version is always available at ${SITE_URL}/terms-of-service. Continued use of our website after changes are published constitutes acceptance of the revised Terms.`,
    ],
  },
  {
    heading: "12. Contact",
    body: [
      `If you have any questions about these Terms, please contact us at ${SITE_EMAIL}.`,
    ],
  },
];

function TermsOfServicePage() {
  return (
    <>
      <section className="px-5 pt-32 pb-14 sm:px-8 lg:pt-44">
        <div className="mx-auto max-w-[110rem]">
          <h1 className="display text-[clamp(2.2rem,7vw,7rem)]">
            <MaskedLinesOnScroll lines={["Terms of", "Service"]} />
          </h1>
          <Rise delay={0.15}>
            <p className="mt-6 max-w-xl font-serif text-xl leading-snug text-foreground/85 sm:text-2xl">
              Last updated: January 2025 · Governing law: England and Wales
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
          <p className="font-serif text-xl text-foreground/80">Questions about these terms?</p>
          <Link
            to="/project-form"
            className="btn-wipe bg-primary px-7 py-3.5 text-[12px] font-medium tracking-[0.18em] text-primary-foreground uppercase"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
