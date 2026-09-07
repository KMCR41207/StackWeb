import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MaskedLinesOnScroll, Rise } from "@/components/site/motion-primitives";

const title = "Help — Stackweb";
const description =
  "Answers on timelines, pricing, revisions, hosting and support for websites built by Stackweb.";

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

const faqs = [
  {
    q: "How long does a website take?",
    a: "Most marketing sites run three to five weeks from kickoff to launch. Larger stores and product interfaces take longer; we give you a dated schedule before anything starts.",
  },
  {
    q: "What does a project cost?",
    a: "Projects are quoted as a fixed price once we understand the scope. Small sites typically start in the low four figures; bigger builds scale from there. No hourly surprises.",
  },
  {
    q: "How many rounds of revisions do I get?",
    a: "Two structured rounds at design stage, plus a month of small tweaks after launch. In practice we keep going until the page is right.",
  },
  {
    q: "Can you write the copy and supply images?",
    a: "Yes. We can write the page copy and art-direct or source imagery. If you already have a brand kit, we work inside it.",
  },
  {
    q: "Who hosts and maintains the site?",
    a: "We can host and maintain it, or hand over a clean codebase to your team. Either way you own everything we make.",
  },
  {
    q: "Do you work with existing sites?",
    a: "Often. We take over half-finished builds and redesign tired ones — send the URL and we will tell you honestly what is worth keeping.",
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
        <div className="mx-auto max-w-4xl">
          <Accordion type="multiple" defaultValue={faqs.map((_, i) => `item-${i}`)} className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-hairline">
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
