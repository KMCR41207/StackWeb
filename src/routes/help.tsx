import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MaskedLinesOnScroll, Rise } from "@/components/site/motion-primitives";

const title = "Help — Stackweb | FAQ & Support";
const description =
  "Answers on timelines, pricing, revisions, copy, hosting and support for websites built by Stackweb. Every project is fixed price.";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  }),
  component: HelpPage,
});

const faqGroups = [
  {
    group: "Getting started",
    faqs: [
      {
        q: "How do I start a project?",
        a: "Fill in the project form — it takes two minutes. Tell us what you need, share a rough budget, and pick a rough timeline. We'll come back with honest thoughts within one business day.",
      },
      {
        q: "How long does a website take?",
        a: "Most marketing sites run three to five weeks from kickoff to launch. Larger stores and product interfaces take longer; we give you a dated schedule before anything starts.",
      },
      {
        q: "What does a project cost?",
        a: "Projects are quoted as a fixed price once we understand the scope. Small sites typically start in the low four figures; bigger builds scale from there. No hourly surprises, ever.",
      },
      {
        q: "Do you work with clients outside the UK?",
        a: "Yes. Most of our clients are outside the UK. We work async over email and short video calls, and we have shipped to clients across Europe, North America, the Middle East, and South Asia.",
      },
    ],
  },
  {
    group: "Design & revisions",
    faqs: [
      {
        q: "How many rounds of revisions do I get?",
        a: "Two structured rounds at design stage, plus a month of small tweaks after launch. In practice we keep going until the page is right.",
      },
      {
        q: "Can you write the copy and supply images?",
        a: "Yes. We can write the page copy and art-direct or source imagery. If you already have a brand kit, we work inside it.",
      },
      {
        q: "Do I need to supply a brief?",
        a: "A brief helps, but it is not required. If you know what you want, send it over. If you are still figuring it out, the project form asks the right questions and we work it out together.",
      },
      {
        q: "What if I hate the first design?",
        a: "It has happened. We will rethink the direction from scratch at no extra charge within the first revision round. That is what structured rounds are for — catching a wrong turn early.",
      },
    ],
  },
  {
    group: "Technical & hosting",
    faqs: [
      {
        q: "Who hosts and maintains the site?",
        a: "We can host and maintain it, or hand over a clean codebase to your team. Either way you own everything we make — code, assets, design files, the lot.",
      },
      {
        q: "What technologies do you build with?",
        a: "React, TanStack Start, Next.js, Shopify, and plain HTML/CSS depending on what the project calls for. We pick the right tool, not the fashionable one.",
      },
      {
        q: "Can I see the code before I pay?",
        a: "Yes. We stage every build on a live URL as we go, and you see commits in real time. Nothing is hidden behind a reveal-on-payment wall.",
      },
      {
        q: "Will my site be fast and accessible?",
        a: "Yes, both are non-negotiable for us. We target 90+ Lighthouse scores on every build, proper heading structure, keyboard navigation, and WCAG-compliant contrast ratios.",
      },
    ],
  },
  {
    group: "Working together",
    faqs: [
      {
        q: "Do you work with existing sites?",
        a: "Often. We take over half-finished builds and redesign tired ones — send the URL and we will tell you honestly what is worth keeping.",
      },
      {
        q: "Can you work inside our existing brand?",
        a: "Absolutely. Send over your brand guidelines, style guide, or just a Figma file and we will work entirely within your existing system.",
      },
      {
        q: "Do you sign NDAs?",
        a: "Yes. If your project requires confidentiality we are happy to sign a standard mutual NDA before any details are shared.",
      },
      {
        q: "What happens after launch?",
        a: "We include 30 days of small fixes post-launch at no charge. After that, ongoing maintenance is available as a separate monthly retainer if you want us to look after it.",
      },
    ],
  },
];

function HelpPage() {
  return (
    <>
      <section className="px-5 pt-32 pb-14 sm:px-8 lg:pt-44">
        <div className="mx-auto max-w-[110rem]">
          <h1 className="display text-[clamp(3rem,10vw,9rem)]">
            <MaskedLinesOnScroll lines={["Help"]} />
          </h1>
          <Rise delay={0.15}>
            <p className="mt-6 max-w-xl font-serif text-2xl leading-snug text-foreground/85">
              The questions we get asked before every project.
            </p>
          </Rise>
        </div>
      </section>

      <section className="border-t border-hairline px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl space-y-16">
          {faqGroups.map((group, gi) => {
            const offset = faqGroups.slice(0, gi).reduce((acc, g) => acc + g.faqs.length, 0);
            return (
              <div key={group.group}>
                <p className="eyebrow mb-6">{group.group}</p>
                <Accordion
                  type="multiple"
                  defaultValue={group.faqs.map((_, i) => `item-${offset + i}`)}
                  className="w-full"
                >
                  {group.faqs.map((f, i) => (
                    <AccordionItem key={f.q} value={`item-${offset + i}`} className="border-hairline">
                      <AccordionTrigger className="py-6 text-left text-xl hover:no-underline sm:text-2xl">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="max-w-2xl pb-8 text-base leading-relaxed text-muted-foreground">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-hairline px-5 py-20 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-6">
          <p className="font-serif text-2xl">Still stuck?</p>
          <Link
            to="/project-form"
            className="btn-wipe bg-primary px-7 py-3.5 text-[12px] font-medium tracking-[0.18em] text-primary-foreground uppercase"
          >
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
