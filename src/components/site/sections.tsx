import { Link } from "@tanstack/react-router";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { BrowserFrame } from "./browser-frame";
import { GatewayFlow } from "./gateway-flow";
import { MaskedLinesOnScroll, Rise } from "./motion-primitives";
import { projects } from "@/lib/site";

/* ---------------------------------------------------------------- Hero -- */

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <>
      {/* Full-viewport STACKWEB wordmark */}
      <section className="relative flex h-screen w-full items-center justify-start overflow-hidden">
        {/* Gateway-flow canvas background */}
        <GatewayFlow />

        {/* STACKWEB — sized to fill viewport width */}
        <motion.h1
          className="display relative z-10 leading-none whitespace-nowrap select-none"
          style={{ fontSize: "clamp(4.5rem, 19.5vw, 100vw)" }}
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Stackweb
        </motion.h1>
      </section>

      {/* Value-prop + subhead + CTAs + thumbnail strip */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-5 pb-16 sm:px-8 lg:pb-24">
        <GatewayFlow />
        <div className="relative z-10 mx-auto w-full max-w-[110rem]">

          {/* Value-prop headline */}
          <motion.p
            className="display text-[clamp(3rem,10.5vw,9.5rem)] leading-[0.88]"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Custom websites,
            <br />
            <span className="text-foreground/40">built to convert.</span>
          </motion.p>

          {/* Subheadline + CTAs */}
          <Rise delay={0.4} className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-lg font-serif text-xl leading-snug text-foreground/70 sm:text-2xl">
              One studio. One project at a time. No templates, no juniors, no handover PDFs.
            </p>
            <div className="flex flex-wrap items-center gap-4 lg:shrink-0">
              <Link
                to="/project-form"
                className="btn-wipe bg-primary px-7 py-3.5 text-[12px] font-medium tracking-[0.18em] text-primary-foreground uppercase"
              >
                Start a Project
              </Link>
              <a
                href="#work"
                className="link-draw inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-foreground/70 hover:text-foreground"
              >
                See our work
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </Rise>

          {/* Project thumbnail strip */}
          <motion.div
            className="mt-14 grid grid-cols-3 gap-3 lg:mt-20 lg:gap-5"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {projects.slice(0, 3).map((p) => (
              <Link key={p.slug} to="/designs" hash={p.slug} className="group block">
                <BrowserFrame url={`${p.slug}.com`}>
                  <div className="overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.alt}
                      width={720}
                      height={480}
                      className="block w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  </div>
                </BrowserFrame>
              </Link>
            ))}
          </motion.div>

        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- Work -- */

function WorkItem({ project, index }: { project: (typeof projects)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [reduced ? 1 : 0.9, 1]);
  const flip = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`grid items-center gap-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-14 ${
        flip ? "lg:[&>figure]:order-2" : ""
      }`}
    >
      <motion.figure style={{ scale }} className="group origin-center">
        <BrowserFrame url={`${project.slug}.com`}>
          <div className="overflow-hidden">
            <img
              src={project.image}
              alt={project.alt}
              width={1440}
              height={960}
              loading="lazy"
              className="block w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            />
          </div>
        </BrowserFrame>
      </motion.figure>

      <div>
        <MaskedLinesOnScroll
          className="display block text-5xl sm:text-6xl"
          lines={[project.client]}
        />
        <Rise delay={0.1}>
          <p className="eyebrow mt-4">
            {project.type} — {project.year}
          </p>
          <p className="mt-4 max-w-sm font-serif text-xl leading-snug text-foreground/85">
            {project.result}
          </p>
          <Link
            to="/designs"
            hash={project.slug}
            className="link-draw mt-6 inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-primary"
          >
            View project
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Rise>
      </div>
    </div>
  );
}

export function Work() {
  return (
    <section
      id="work"
      className="scroll-mt-24 border-t border-hairline px-5 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[110rem]">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-hairline pb-8">
          <h2 className="display text-[clamp(2.5rem,7vw,6rem)]">
            <MaskedLinesOnScroll lines={["Selected work"]} />
          </h2>
          <p className="eyebrow">Six of the last builds</p>
        </div>

        <div className="mt-20 space-y-28 lg:space-y-40">
          {projects.map((p, i) => (
            <WorkItem key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Process -- */

const steps = [
  {
    n: "01",
    title: "Discovery",
    body: "A short, sharp call. We map what the site has to do, who it has to convince and what success looks like in numbers.",
  },
  {
    n: "02",
    title: "Design",
    body: "Art direction first: type, colour, layout, motion. You see real screens, not wireframes, and we iterate until it feels inevitable.",
  },
  {
    n: "03",
    title: "Build",
    body: "Hand-built front-end, fast by default. Responsive down to the smallest phone, accessible, and easy for you to update.",
  },
  {
    n: "04",
    title: "Launch",
    body: "We ship, measure and stay on for the first month of tweaks. No handover PDF and a wave goodbye.",
  },
];

export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 75%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <section className="border-t border-hairline px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-[110rem]">
        <h2 className="display max-w-4xl text-[clamp(2.5rem,7vw,6rem)]">
          <MaskedLinesOnScroll lines={["How we work"]} />
        </h2>

        <div ref={ref} className="relative mt-16 pl-10 sm:pl-20">
          <div
            className="absolute top-0 bottom-0 left-0 w-px bg-hairline sm:left-8"
            aria-hidden="true"
          >
            <motion.div
              className="h-full w-px origin-top bg-primary"
              style={{ scaleY: progress }}
            />
          </div>

          <ol className="space-y-20 lg:space-y-28">
            {steps.map((s, i) => (
              <li key={s.n} className={i % 2 === 1 ? "lg:ml-[26%] lg:max-w-xl" : "lg:max-w-2xl"}>
                <Rise>
                  <p className="font-serif text-4xl text-primary sm:text-5xl">{s.n}</p>
                  <h3
                    className={`display mt-3 ${i % 2 === 1 ? "text-4xl sm:text-5xl" : "text-5xl sm:text-7xl"}`}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </Rise>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Stats -- */

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1400, 1);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduced]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

const comparison = [
  ["Six-week discovery decks", "A call, then screens in week one"],
  ["Themes reskinned to fit", "Every layout drawn for your brand"],
  ["Handed to a junior after signing", "The designer who pitched it builds it"],
  ["Invoices for every small change", "First month of tweaks included"],
];

export function WhyStackweb() {
  return (
    <section className="border-t border-hairline px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto max-w-[110rem]">
        <h2 className="display max-w-5xl text-[clamp(2.4rem,6.5vw,5.5rem)]">
          <MaskedLinesOnScroll lines={["A small studio", "that ships like", "a big one"]} />
        </h2>

        <dl className="mt-16 grid gap-10 border-y border-hairline py-12 sm:grid-cols-3">
          {[
            { v: 140, s: "+", l: "Projects delivered" },
            { v: 21, s: " days", l: "Average turnaround" },
            { v: 98, s: "%", l: "Clients who come back" },
          ].map((stat) => (
            <div key={stat.l}>
              <dt className="display text-[clamp(3rem,8vw,6rem)] text-primary">
                <Counter to={stat.v} suffix={stat.s} />
              </dt>
              <dd className="eyebrow mt-2">{stat.l}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-16 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2">
          <div className="bg-background px-6 py-5">
            <p className="eyebrow">Typical agency</p>
          </div>
          <div className="bg-background px-6 py-5">
            <p className="eyebrow text-primary">Stackweb</p>
          </div>
          {comparison.map(([a, b]) => (
            <Rise key={a} className="contents">
              <div className="bg-background px-6 py-6 text-muted-foreground line-through decoration-foreground/20">
                {a}
              </div>
              <div className="bg-background px-6 py-6 text-foreground">{b}</div>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Testimonials -- */

const quotes = [
  {
    quote:
      "They designed like it was their own brand on the line. The site sells better than we do.",
    name: "Ananya Rao",
    company: "Livaani",
  },
  {
    quote: "Bookings went up the week we launched. That never happens with a redesign.",
    name: "Marcus Field",
    company: "Farcarfix",
  },
  {
    quote: "Fast, opinionated and genuinely good at the details nobody else bothers with.",
    name: "Dev Sharma",
    company: "ASR Infra",
  },
  {
    quote: "Our dashboard finally looks like the product we tell investors it is.",
    name: "Lena Osei",
    company: "Peoplix",
  },
];

export function Testimonials() {
  const reduced = useReducedMotion();
  const row = [...quotes, ...quotes];

  return (
    <section className="overflow-hidden border-t border-hairline py-24 lg:py-32">
      <h2 className="eyebrow px-5 sm:px-8">What clients say</h2>

      <motion.div
        className="mt-12 flex w-max gap-6"
        animate={reduced ? { x: 0 } : { x: ["0%", "-50%"] }}
        transition={{ duration: 46, ease: "linear", repeat: Infinity }}
      >
        {row.map((q, i) => (
          <figure
            key={`${q.name}-${i}`}
            className="w-[85vw] shrink-0 border border-hairline bg-surface p-8 sm:w-[38rem] sm:p-12"
          >
            <blockquote className="font-serif text-2xl leading-tight sm:text-4xl">
              “{q.quote}”
            </blockquote>
            <figcaption className="eyebrow mt-8">
              {q.name} — {q.company}
            </figcaption>
          </figure>
        ))}
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------ Final CTA -- */

export function FinalCta() {
  return (
    <section className="grain relative border-t border-hairline bg-primary px-5 py-28 text-primary-foreground sm:px-8 lg:py-40">
      <div className="relative z-10 mx-auto max-w-[110rem]">
        <h2 className="display text-[clamp(2.6rem,10vw,9rem)]">
          <MaskedLinesOnScroll lines={["Let's build", "something worth", "showing off"]} />
        </h2>
        <Rise delay={0.15}>
          <Link
            to="/project-form"
            className="group mt-12 inline-flex items-center gap-4 border border-primary-foreground/40 px-8 py-4 text-[12px] tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-primary-foreground hover:text-primary"
          >
            Start a Project
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
              aria-hidden="true"
            />
          </Link>
        </Rise>
      </div>
    </section>
  );
}
