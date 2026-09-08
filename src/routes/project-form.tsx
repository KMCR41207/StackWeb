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

const CUSTOM = "Request a custom quote";

type BudgetOption = { value: string; hint: string };
type TimelineOption = { value: string; hint: string };

type ProjectTypeOption = {
  label: string;
  short: string;
  description: string;
  features: string[];
  examples: string[];
  budgets: BudgetOption[];
  timelines: TimelineOption[];
};

const projectTypeOptions: ProjectTypeOption[] = [
  {
    label: "Static Website",
    short: "AOS / Informational",
    description: "Content-focused websites served as plain HTML. Fast, secure, and easy to maintain.",
    features: ["Custom design", "SEO optimisation", "CMS integration", "Blog / articles", "Contact forms", "Analytics"],
    examples: ["Agency website", "Informational site", "Brochure site", "Event page"],
    budgets: [
      { value: "Under $2k",   hint: "Clean single-pager" },
      { value: "$2k – $5k",   hint: "Multi-page with CMS" },
      { value: "$5k – $10k",  hint: "Polished & full-featured" },
      { value: CUSTOM,        hint: "Something specific in mind?" },
    ],
    timelines: [
      { value: "1–2 weeks",  hint: "Quick turnaround" },
      { value: "2–4 weeks",  hint: "Comfortable pace" },
      { value: "1–2 months", hint: "Full creative process" },
      { value: CUSTOM,       hint: "Have a date in mind?" },
    ],
  },
  {
    label: "Dynamic Website",
    short: "Interactive / Data-driven",
    description: "Websites that generate content on-demand from a database or API.",
    features: ["Database-backed content", "User authentication", "API integrations", "Real-time updates", "Dynamic routing"],
    examples: ["News platform", "Job board", "Directory site", "Membership site"],
    budgets: [
      { value: "$5k – $10k",  hint: "Core dynamic features" },
      { value: "$10k – $20k", hint: "Rich interactions & APIs" },
      { value: "$20k+",       hint: "Complex & scalable" },
      { value: CUSTOM,        hint: "Let's scope it together" },
    ],
    timelines: [
      { value: "4–6 weeks",   hint: "Focused build" },
      { value: "2–3 months",  hint: "Thoughtful & tested" },
      { value: "3–5 months",  hint: "Full-scale delivery" },
      { value: CUSTOM,        hint: "Have a deadline?" },
    ],
  },
  {
    label: "Business Website",
    short: "Corporate / Agency",
    description: "Professional websites for companies, agencies, startups, and service providers.",
    features: ["Brand identity", "Services pages", "Team / about", "Case studies", "Lead capture", "Multi-page structure"],
    examples: ["Startup website", "Law firm", "Consultancy", "Creative agency"],
    budgets: [
      { value: "$3k – $6k",   hint: "Sharp & professional" },
      { value: "$6k – $12k",  hint: "Premium brand presence" },
      { value: "$12k+",       hint: "Flagship-level quality" },
      { value: CUSTOM,        hint: "Bespoke scope" },
    ],
    timelines: [
      { value: "2–4 weeks",   hint: "Fast to market" },
      { value: "1–2 months",  hint: "Craft-focused" },
      { value: "2–3 months",  hint: "Full brand build" },
      { value: CUSTOM,        hint: "Work around your launch" },
    ],
  },
  {
    label: "E-commerce",
    short: "Store / Products / Payments",
    description: "Online stores for selling physical or digital products — from catalogue to checkout.",
    features: ["Product catalogue", "Search & filtering", "Shopping cart", "Checkout", "Payment integration", "Order management", "Customer accounts"],
    examples: ["Fashion store", "D2C brand", "Electronics store", "Digital downloads"],
    budgets: [
      { value: "$5k – $10k",   hint: "Essential storefront" },
      { value: "$10k – $20k",  hint: "Full shopping experience" },
      { value: "$20k – $40k",  hint: "Feature-rich & scalable" },
      { value: "$40k+",        hint: "Enterprise-grade" },
      { value: CUSTOM,         hint: "Complex catalogue?" },
    ],
    timelines: [
      { value: "4–8 weeks",   hint: "Lean launch" },
      { value: "2–4 months",  hint: "Refined & ready" },
      { value: "4–6 months",  hint: "Full-scale store" },
      { value: CUSTOM,        hint: "Seasonal deadline?" },
    ],
  },
  {
    label: "Web Application",
    short: "Dashboard / SaaS / Platform",
    description: "Advanced interactive platforms where users log in, create, and manage data.",
    features: ["User authentication", "Role-based access", "Dashboard UI", "CRUD operations", "API integrations", "Admin panel"],
    examples: ["SaaS product", "Internal tool", "Client portal", "Analytics platform"],
    budgets: [
      { value: "$10k – $25k", hint: "MVP & core flows" },
      { value: "$25k – $50k", hint: "Production-ready" },
      { value: "$50k+",       hint: "Full platform build" },
      { value: CUSTOM,        hint: "Let's architect it" },
    ],
    timelines: [
      { value: "2–3 months",   hint: "Focused sprint" },
      { value: "3–6 months",   hint: "Iterative build" },
      { value: "6–12 months",  hint: "Long-form delivery" },
      { value: CUSTOM,         hint: "Phased rollout?" },
    ],
  },
  {
    label: "Portfolio / Personal",
    short: "Personal / Creator / Professional",
    description: "Showcases for freelancers, designers, photographers, writers, and professionals.",
    features: ["Work showcase", "About / bio", "Contact form", "Blog (optional)", "PDF downloads", "Social links"],
    examples: ["Designer portfolio", "Photographer site", "Freelancer profile", "Resume site"],
    budgets: [
      { value: "Under $2k",  hint: "Minimal & elegant" },
      { value: "$2k – $4k",  hint: "Considered & personal" },
      { value: "$4k – $8k",  hint: "Standout creative presence" },
      { value: CUSTOM,       hint: "Something extra?" },
    ],
    timelines: [
      { value: "1 week",     hint: "Quick launch" },
      { value: "1–2 weeks",  hint: "Polished & prompt" },
      { value: "2–4 weeks",  hint: "Full creative treatment" },
      { value: CUSTOM,       hint: "Around your schedule" },
    ],
  },
  {
    label: "Landing Page",
    short: "Marketing / Campaign / Product",
    description: "Single-page sites designed to convert — for launches, ads, waitlists, and campaigns.",
    features: ["Hero section", "Feature highlights", "Social proof", "CTA buttons", "Lead capture", "A/B ready"],
    examples: ["Product launch", "App waitlist", "Ad campaign", "Event signup"],
    budgets: [
      { value: "Under $1.5k", hint: "Clean conversion page" },
      { value: "$1.5k – $3k", hint: "Crafted & compelling" },
      { value: "$3k – $6k",   hint: "Art-directed & animated" },
      { value: CUSTOM,        hint: "Campaign-level scope" },
    ],
    timelines: [
      { value: "3–5 days",   hint: "Rapid deploy" },
      { value: "1–2 weeks",  hint: "Properly considered" },
      { value: "2–3 weeks",  hint: "Full creative pass" },
      { value: CUSTOM,       hint: "Campaign date locked?" },
    ],
  },
  {
    label: "Custom / Other",
    short: "Something different",
    description: "Doesn't fit the above? Tell us what you're building and we'll figure it out.",
    features: ["Scoped on enquiry", "Architecture review", "Tech recommendation", "Custom roadmap"],
    examples: ["Hybrid platform", "Niche tool", "Multi-tenant app", "Experimental build"],
    budgets: [
      { value: "Not sure yet", hint: "We'll help scope it" },
      { value: "Under $5k",    hint: "Compact & clever" },
      { value: "$5k – $20k",   hint: "Solid custom build" },
      { value: "$20k+",        hint: "No ceiling" },
      { value: CUSTOM,         hint: "Something in mind?" },
    ],
    timelines: [
      { value: "ASAP",              hint: "As soon as possible" },
      { value: "Flexible",          hint: "No rush" },
      { value: "Need a quote first",hint: "Scope first, then date" },
      { value: CUSTOM,              hint: "Tell us your window" },
    ],
  },
];

/* ─── Detail popover ─── */
function TypeDetail({ option, onClose }: { option: ProjectTypeOption; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const id = setTimeout(() => {
      const onClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) onClose();
      };
      document.addEventListener("mousedown", onClick);
      return () => document.removeEventListener("mousedown", onClick);
    }, 10);
    return () => clearTimeout(id);
  }, [onClose]);

  useEffect(() => { ref.current?.focus(); }, []);

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
        <button type="button" onClick={onClose} aria-label="Close details"
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{option.description}</p>
      <div className="mt-4">
        <p className="eyebrow mb-2">Typical features</p>
        <ul className="space-y-1">
          {option.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
              <span className="h-px w-3 shrink-0 bg-primary" aria-hidden="true" />{f}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <p className="eyebrow mb-2">Example use cases</p>
        <ul className="space-y-1">
          {option.examples.map((e) => (
            <li key={e} className="flex items-center gap-2 text-sm text-foreground/80">
              <span className="h-px w-3 shrink-0 bg-foreground/30" aria-hidden="true" />{e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ─── Project-type selector ─── */
function ProjectTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<ProjectTypeOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setDetail(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = projectTypeOptions.find((o) => o.label === value) ?? projectTypeOptions[0]!;

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name="type" value={value} />
      <button type="button" aria-haspopup="listbox" aria-expanded={open}
        onClick={() => { setOpen((v) => !v); setDetail(null); }}
        className={`${fieldClass} flex items-center justify-between text-left`}>
        <span className="truncate">
          {selected.label}
          <span className="ml-2 text-muted-foreground/60">— {selected.short}</span>
        </span>
        <span className="ml-2 shrink-0 text-xs text-muted-foreground/40">▾</span>
      </button>

      {open && (
        <ul role="listbox" aria-label="Project type"
          className="absolute left-0 right-0 top-full z-40 border border-hairline bg-background shadow-[0_8px_40px_rgba(0,0,0,0.7)]">
          {projectTypeOptions.map((opt) => {
            const isSel = opt.label === value;
            return (
              <li key={opt.label} role="option" aria-selected={isSel}
                className={`flex items-center justify-between gap-2 px-4 py-3 font-serif text-base ${
                  isSel ? "bg-primary/10 text-foreground" : "text-foreground/80 hover:bg-surface hover:text-foreground"
                }`}>
                <button type="button" className="flex-1 text-left"
                  onClick={() => { onChange(opt.label); setOpen(false); setDetail(null); }}>
                  <span className="font-medium">{opt.label}</span>
                  <span className="ml-2 text-sm text-muted-foreground">— {opt.short}</span>
                </button>
                <button type="button" aria-label={`Details about ${opt.label}`}
                  onClick={(e) => { e.stopPropagation(); setDetail(detail?.label === opt.label ? null : opt); }}
                  className="shrink-0 rounded px-1.5 py-0.5 text-xs tracking-widest text-muted-foreground hover:bg-surface hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  ⋯
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {detail && <TypeDetail option={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

/* ─── Dynamic select with optional custom input ─── */
function DynamicSelect({
  id,
  name,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  options: { value: string; hint: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const isCustom = value === CUSTOM || (!options.some((o) => o.value === value) && value !== "");
  const selected = options.find((o) => o.value === value) ?? options[0]!;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="eyebrow block">{label}</label>
      <input type="hidden" name={name} value={isCustom ? customText : value} />

      {/* Trigger */}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${fieldClass} flex items-center justify-between text-left`}
      >
        <span className="truncate">
          {isCustom ? (customText || "Request a custom quote") : selected.value}
          {!isCustom && selected.hint && (
            <span className="ml-2 text-sm text-muted-foreground/60">— {selected.hint}</span>
          )}
        </span>
        <span className="ml-2 shrink-0 text-xs text-muted-foreground/40">▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-40 border border-hairline bg-background shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
        >
          {options.map((opt) => {
            const isSel = opt.value === value || (opt.value === CUSTOM && isCustom);
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSel}
                className={`cursor-pointer px-4 py-3 font-serif text-base transition-colors ${
                  isSel ? "bg-primary/10 text-foreground" : "text-foreground/80 hover:bg-surface hover:text-foreground"
                }`}
                onClick={() => { onChange(opt.value); setOpen(false); if (opt.value !== CUSTOM) setCustomText(""); }}
              >
                <span className="font-medium">{opt.value}</span>
                {opt.value !== CUSTOM && opt.hint && (
                  <span className="ml-2 text-sm text-muted-foreground">— {opt.hint}</span>
                )}
                {opt.value === CUSTOM && (
                  <span className="ml-2 text-sm text-primary/80">— {opt.hint}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Custom free-text */}
      {isCustom && (
        <input
          type="text"
          placeholder={`Describe your ${label.toLowerCase()}…`}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          className={`${fieldClass} mt-2 text-base`}
          aria-label={`Custom ${label.toLowerCase()}`}
        />
      )}
    </div>
  );
}

/* ─── Main page ─── */
function ProjectFormPage() {
  const { submit, status, error, isSubmitting } = useEnquirySubmit();
  const [projectType, setProjectType] = useState(projectTypeOptions[0]?.label ?? "Static Website");
  const currentType = projectTypeOptions.find((o) => o.label === projectType) ?? projectTypeOptions[0]!;

  const [budget, setBudget] = useState(currentType.budgets[0]?.value ?? "");
  const [timeline, setTimeline] = useState(currentType.timelines[0]?.value ?? "");

  // Reset budget/timeline when project type changes
  const prevType = useRef(projectType);
  useEffect(() => {
    if (prevType.current !== projectType) {
      setBudget(currentType.budgets[0]?.value ?? "");
      setTimeline(currentType.timelines[0]?.value ?? "");
      prevType.current = projectType;
    }
  }, [projectType, currentType]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const budgetVal = String(data.get("budget") ?? "").trim();
    const timelineVal = String(data.get("timeline") ?? "").trim();
    const details = String(data.get("details") ?? "").trim();
    if (!name || !email || !details) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    submit({ name, company, email, projectType, budget: budgetVal, timeline: timelineVal, details });
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
                <label htmlFor="name" className="eyebrow block">Your name</label>
                <input id="name" name="name" className={fieldClass} placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="company" className="eyebrow block">Company</label>
                <input id="company" name="company" className={fieldClass} placeholder="Optional" />
              </div>
              <div>
                <label htmlFor="email" className="eyebrow block">Email</label>
                <input id="email" name="email" type="email" className={fieldClass} placeholder="jane@company.com" />
              </div>
              <div>
                <label className="eyebrow block">Project type</label>
                <ProjectTypeSelect value={projectType} onChange={setProjectType} />
              </div>
              <DynamicSelect
                id="budget"
                name="budget"
                label="Budget"
                options={currentType.budgets}
                value={budget}
                onChange={setBudget}
              />
              <DynamicSelect
                id="timeline"
                name="timeline"
                label="Timeline"
                options={currentType.timelines}
                value={timeline}
                onChange={setTimeline}
              />
            </div>

            <div>
              <label htmlFor="details" className="eyebrow block">About the project</label>
              <textarea id="details" name="details" rows={5}
                className={`${fieldClass} resize-none`}
                placeholder="What are you building, and what does success look like?" />
            </div>

            {status === "error" && error && (
              <p role="alert" aria-live="polite" className="text-sm text-destructive">{error}</p>
            )}

            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}
              className="btn-wipe group inline-flex items-center gap-4 bg-primary px-8 py-4 text-[12px] font-medium tracking-[0.2em] text-primary-foreground uppercase disabled:opacity-60">
              {isSubmitting ? "Sending enquiry" : "Send enquiry"}
              {isSubmitting
                ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                : <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
