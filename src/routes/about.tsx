import { createFileRoute, Link } from "@tanstack/react-router";
import { MaskedLinesOnScroll, Rise } from "@/components/site/motion-primitives";

const title = "About — Stackweb";
const description =
  "Stackweb is a small web design studio building custom sites on demand: art direction, front-end craft and a launch you can measure.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AboutPage,
});

const principles = [
  {
    t: "Design is the product",
    b: "We sell websites, so ours has to be the proof. Nothing leaves the studio that we would not put in the portfolio.",
  },
  {
    t: "One project at a time",
    b: "We keep a short client list on purpose. It is the only way the work stays this considered.",
  },
  {
    t: "Built, not assembled",
    b: "Hand-written front-end, real performance budgets, accessible contrast and keyboard paths from the first commit.",
  },
];

function AboutPage() {
  return (
    <>
      <section className="px-5 pt-32 pb-16 sm:px-8 lg:pt-44">
        <div className="mx-auto max-w-[110rem]">
          <h1 className="display max-w-5xl text-[clamp(2.8rem,9vw,8rem)]">
            <MaskedLinesOnScroll lines={["A studio for", "brands that", "sweat details"]} />
          </h1>
        </div>
      </section>

      <section className="border-t border-hairline px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-[110rem] gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
          <Rise>
            <p className="eyebrow">Who we are</p>
          </Rise>
          <Rise delay={0.1}>
            <p className="font-serif text-2xl leading-snug sm:text-4xl">
              Stackweb started because most agency sites look the same and most templates look
              worse. We build custom websites on demand — brand-led, fast, and finished to a
              standard you can point at.
            </p>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
              We work directly with founders and marketing leads, no account layer in between. The
              person who pitches the design is the person who builds it, which is why projects land
              in weeks rather than quarters.
            </p>
          </Rise>
        </div>
      </section>

      <section className="border-t border-hairline px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[110rem] space-y-16">
          {principles.map((p, i) => (
            <Rise key={p.t}>
              <div
                className={`grid gap-6 border-t border-hairline pt-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16 ${
                  i % 2 === 1 ? "lg:pl-[12%]" : ""
                }`}
              >
                <p className="font-serif text-4xl text-primary">0{i + 1}</p>
                <div>
                  <h2 className="display text-4xl sm:text-6xl">{p.t}</h2>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                    {p.b}
                  </p>
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </section>

      <section className="border-t border-hairline px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[110rem]">
          <Link
            to="/project-form"
            className="btn-wipe inline-block bg-primary px-7 py-3.5 text-[12px] font-medium tracking-[0.18em] text-primary-foreground uppercase"
          >
            Work with us
          </Link>
        </div>
      </section>
    </>
  );
}
