import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, LoaderCircle, X } from "lucide-react";
import { MaskedLinesOnScroll, Rise } from "@/components/site/motion-primitives";
import { useEnquirySubmit } from "@/lib/use-enquiry-submit";

const title = "Start a Project — Stackweb";
const description =
  "Tell Stackweb about your website project: scope, budget and timeline. We reply within one working day.";

export const Route = createFileRoute("/project-form")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ProjectFormPage,
});

const fieldClass =
  "w-full border-b border-input bg-transparent py-3 text-lg text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary font-serif";

type ProjectTypeOption = {
  label: string;
  short: string;
  description: string;
  features: string[];
  examples: string[];
};

const projectTypeOptions: ProjectTypeOption[] = [
  {
    label: "Static Website",
    short: "AOS / Informational",
    description:
      "Content-focused websites that are pre-built and served as plain HTML. Fast, secure, and easy to maintain.",
    features: ["Custom design", "SEO optimisation", "CMS integration", "Blog / articles", "Contact forms", "Analytics"],
    examples: ["Agency website", "Informational site", "Brochure site", "Event page"],
  },
  {
    label: "Dynamic Website",
    short: "Interactive / Data-driven",
    description:
      "Websites that generate content on-demand from a database or API. Great for frequently updated content and user-specific experiences.",
    features: ["Database-backed content", "User authentication", "API integrations", "Real-time updates", "Dynamic routing"],
    examples: ["News platform", "Job board", "Directory site", "Membership site"],
  },
  {
    label: "Business Website",
    short: "Corporate / Agency",
    description:
      "Professional websites for companies, agencies, startups, and service providers. Focused on credibility and conversion.",
    features: ["Brand identity", "Services pages", "Team / about", "Case studies", "Lead capture", "Multi-page structure"],
    examples: ["Startup website", "Law firm", "Consultancy", "Creative agency"],
  },
  {
    label: "E-commerce",
    short: "Store / Products / Payments",
    description:
      "Online stores built for selling physical or digital products. Includes everything from catalogue to checkout.",
    features: ["Product catalogue", "Search & filtering", "Shopping cart", "Checkout", "Payment integration", "Order management", "Customer accounts"],
    examples: ["Fashion store", "D2C brand", "Electronics store", "Digital downloads"],
  },
  {
    label: "Web Application",
    short: "Dashboard / SaaS / Platform",
    description:
      "Advanced interactive platforms where users log in, create, manage, and act on data. Built for scale.",
    features: ["User authentication", "Role-based access", "Dashboard UI", "CRUD operations", "Third-party API integrations", "Admin panel"],
    examples: ["SaaS product", "Internal tool", "Client portal", "Analytics platform"],
  },
  {
    label: "Portfolio / Personal",
    short: "Personal / Creator / Professional",
    description:
      "Showcases for individuals — freelancers, designers, photographers, writers, and professionals.",
    features: ["Work showcase", "About / bio", "Contact form", "Blog (optional)", "PDF downloads", "Social links"],
    examples: ["Designer portfolio", "Photographer site", "Freelancer profile", "Resume site"],
  },
  {
    label: "Landing Page",
    short: "Marketing / Campaign / Product",
    description:
      "Single-page sites designed to convert. Used for product launches, ads, waitlists, and campaigns.",
    features: ["Hero section", "Feature highlights", "Social proof", "CTA buttons", "Lead capture", "A/B ready"],
    examples: ["Product launch", "App waitlist", "Ad campaign", "Event signup"],
  },
  {
    label: "Custom / Other",
    short: "Something different",
    description:
      "Doesn't fit the above? Tell us what you're building and we'll figure out the right approach together.",
    features: ["Scoped on enquiry", "Architecture review", "Tech recommendation", "Custom roadmap"],
    examples: ["Hybrid platform", "Niche tool", "Multi-tenant app", "Experimental build"],
  },
];

const budgets = ["Under $2k", "$2k – $5k", "$5k – $15k", "$15k+", "Not sure yet"];
const timelines = ["ASAP", "2–4 weeks", "1–2 months", "Just planning"];

/* ─── Project-type detail popover ─── */
function TypeDetail({
  option,
  onClose,
}: {
  option: ProjectTypeOption;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // Small delay so the opening click doesn't immediately close it
    const id = setTimeout(() => document.addEventListener("mousedown", onClick), 10);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", onClick);
    };
  }, [onClose]);

  // Trap focus
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Details: ${option.label}`}
      tabIndex={-1}
      className="absolute right-0 top-full z-50 mt-2 w-80 border border-hairline bg-background p-5 shadow-[0_8px_40px_rgba(0,0,0,0.7)] outline-none sm:w-96"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-serif text-lg text-foreground">{option.label}</p>
          <p className="eyebrow mt-0.5 text-primary">{option.short}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{option.description}</p>

      <div className="mt-4">
        <p className="eyebrow mb-2">Typical features</p>
        <ul className="space-y-1">
          {option.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
              <span className="h-px w-3 shrink-0 bg-primary" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="eyebrow mb-2">Example use cases</p>
        <ul className="space-y-1">
          {option.examples.map((e) => (
            <li key={e} className="flex items-center gap-2 text-sm text-foreground/80">
              <span className="h-px w-3 shrink-0 bg-foreground/30" aria-hidden="true" />
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Custom project-type selector ─── */
function ProjectTypeSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ProjectTypeOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setDetail(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = projectTypeOptions.find((o) => o.label === value) ?? projectTypeOptions[0]!;

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input so FormData picks it up */}
      <input type="hidden" name="type" value={value} />

      {/* Trigger — mimics the select style */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => { setOpen((v) => !v); setDetail(null); }}
        className={`${fieldClass} flex items-center justify-between text-left`}
      >
        <span className="truncate">
          {selected.label}
          <span className="ml-2 text-muted-foreground/60">— {selected.short}</span>
        </span>
        <span className="ml-2 shrink-0 text-muted-foreground/40 text-xs">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          aria-label="Project type"
          className="absolute left-0 right-0 top-full z-40 mt-0 border border-hairline bg-background shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
        >
          {projectTypeOptions.map((opt) => {
            const isSelected = opt.label === value;
            return (
              <li
                key={opt.label}
                role="option"
                aria-selected={isSelected}
                className={`group flex items-center justify-between gap-2 px-4 py-3 font-serif text-base cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-foreground"
                    : "text-foreground/80 hover:bg-surface hover:text-foreground"
                }`}
              >
                {/* Click row = select */}
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => {
                    onChange(opt.label);
                    setOpen(false);
                    setDetail(null);
                  }}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="ml-2 text-sm text-muted-foreground">— {opt.short}</span>
                </button>

                {/* ⋯ detail button */}
                <button
                  type="button"
                  aria-label={`Details about ${opt.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetail(detail?.label === opt.label ? null : opt);
                  }}
                  className="shrink-0 rounded px-1.5 py-0.5 text-xs tracking-widest text-muted-foreground hover:bg-surface hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  ⋯
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Detail popover — renders relative to container */}
      {detail && (
        <TypeDetail option={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}

/* ─── Main form page ─── */
function ProjectFormPage() {
  const { submit, status, error, isSubmitting } = useEnquirySubmit();
  const [projectType, setProjectType] = useState(projectTypeOptions[0]?.label ?? "Static Website");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const budget = String(data.get("budget") ?? "").trim();
    const timeline = String(data.get("timeline") ?? "").trim();
    const details = String(data.get("details") ?? "").trim();

    if (!name || !email || !details) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    submit({ name, company, email, projectType, budget, timeline, details });
  }

  return (
    <section className="px-5 pt-32 pb-24 sm:px-8 lg:pt-44">
      <div className="mx-auto grid max-w-[110rem] gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h1 className="display text-[clamp(2.6rem,8vw,7rem)]">
            <MaskedLinesOnScroll lines={["Start a", "project"]} />
          </h1>
          <Rise delay={0.2}>
            <p className="mt-6 max-w-md font-serif text-2xl leading-snug text-foreground/85">
              Tell us what you're building. We read every enquiry ourselves and reply within one
              working day.
            </p>
          </Rise>
        </div>

        {status === "success" ? (
          <div className="flex flex-col justify-center border border-hairline bg-surface p-10">
            <Check className="h-10 w-10 text-primary" aria-hidden="true" />
            <h2 className="display mt-6 text-4xl sm:text-5xl">Thanks — got it</h2>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Your enquiry is in front of us. Expect a reply within one working day with next steps
              and a rough schedule.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="space-y-10">
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="eyebrow block">
                  Your name
                </label>
                <input id="name" name="name" className={fieldClass} placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="company" className="eyebrow block">
                  Company
                </label>
                <input id="company" name="company" className={fieldClass} placeholder="Optional" />
              </div>
              <div>
                <label htmlFor="email" className="eyebrow block">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={fieldClass}
                  placeholder="jane@company.com"
                />
              </div>
              <div>
                <label className="eyebrow block">
                  Project type
                </label>
                <ProjectTypeSelect value={projectType} onChange={setProjectType} />
              </div>
              <div>
                <label htmlFor="budget" className="eyebrow block">
                  Budget
                </label>
                <select id="budget" name="budget" className={`${fieldClass} appearance-none`}>
                  {budgets.map((b) => (
                    <option key={b} value={b} className="bg-background">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="timeline" className="eyebrow block">
                  Timeline
                </label>
                <select id="timeline" name="timeline" className={`${fieldClass} appearance-none`}>
                  {timelines.map((t) => (
                    <option key={t} value={t} className="bg-background">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="details" className="eyebrow block">
                About the project
              </label>
              <textarea
                id="details"
                name="details"
                rows={5}
                className={`${fieldClass} resize-none`}
                placeholder="What are you building, and what does success look like?"
              />
            </div>

            {status === "error" && error && (
              <p role="alert" aria-live="polite" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="btn-wipe group inline-flex items-center gap-4 bg-primary px-8 py-4 text-[12px] font-medium tracking-[0.2em] text-primary-foreground uppercase disabled:opacity-60"
            >
              {isSubmitting ? "Sending enquiry" : "Send enquiry"}
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
                  aria-hidden="true"
                />
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
