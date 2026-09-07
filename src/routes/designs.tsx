import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { BrowserFrame } from "@/components/site/browser-frame";
import { MaskedLinesOnScroll, Rise } from "@/components/site/motion-primitives";
import { projects } from "@/lib/site";

const title = "Work — Stackweb design studio";
const description =
  "Selected websites and product interfaces built by Stackweb: Livaani, Farcarfix, Prime Flex, SVLT, ASR Infra and Peoplix.";

export const Route = createFileRoute("/designs")({
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
  component: DesignsPage,
});

function DesignsPage() {
  return (
    <>
      <section className="px-5 pt-32 pb-14 sm:px-8 lg:pt-44">
        <div className="mx-auto max-w-[110rem]">
          <h1 className="display text-[clamp(3rem,11vw,10rem)]">
            <MaskedLinesOnScroll lines={["The work"]} />
          </h1>
          <Rise delay={0.2}>
            <p className="mt-6 max-w-xl font-serif text-2xl leading-snug text-foreground/85">
              Every site below was drawn from scratch — no themes, no starter kits, no two alike.
            </p>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground">
              Six of the last builds. Real clients, real briefs, real results.
            </p>
          </Rise>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="mx-auto grid max-w-[110rem] gap-16 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-24">
          {projects.map((p, i) => (
            <article
              key={p.slug}
              id={p.slug}
              className={`group scroll-mt-28 ${i % 3 === 0 ? "lg:col-span-2" : ""}`}
            >
              <BrowserFrame url={`${p.slug}.com`}>
                <div className="overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.alt}
                    width={1440}
                    height={960}
                    loading="lazy"
                    className="block w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  />
                </div>
              </BrowserFrame>

              <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <h2 className="display text-4xl sm:text-5xl">{p.client}</h2>
                  <p className="eyebrow mt-3">
                    {p.type} — {p.year}
                  </p>
                  <p className="mt-3 max-w-md text-sm text-muted-foreground">{p.result}</p>
                </div>
                <ArrowUpRight
                  className="h-6 w-6 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  aria-hidden="true"
                />
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-24 max-w-[110rem] border-t border-hairline pt-12">
          <Link
            to="/project-form"
            className="btn-wipe inline-block bg-primary px-7 py-3.5 text-[12px] font-medium tracking-[0.18em] text-primary-foreground uppercase"
          >
            Start a Project
          </Link>
        </div>
      </section>
    </>
  );
}
